import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfigEntity } from './app-config.entity';

type ConfigKey = keyof Omit<AppConfigEntity, 'id'>;

@Injectable()
export class AppConfigService implements OnModuleInit, OnModuleDestroy {
  private cachedConfig: AppConfigEntity | null = null;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    @InjectRepository(AppConfigEntity)
    private appConfigRepository: Repository<AppConfigEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.appConfigRepository.count();
    if (count === 0) {
      await this.appConfigRepository.save(new AppConfigEntity());
    }
    
    // Initial load
    await this.loadConfig();
    
    if (!this.cachedConfig) {
      throw new Error('Configuration not found');
    }
    
    // Set up refresh interval
    this.refreshInterval = setInterval(async () => {
      await this.loadConfig();
    }, this.cachedConfig.configCacheTtl);
  }

  async loadConfig() {
    const config = await this.appConfigRepository.findOne({
      where: {},
      order: { id: 'ASC' },
    });

    if (!config) {
      throw new Error('Configuration not found');
    }

    this.cachedConfig = config;
    return config;
  }

  async get<K extends ConfigKey>(key: K) {
    if (!this.cachedConfig) {
      await this.loadConfig();
    }
    return this.cachedConfig![key];
  }

  onModuleDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}
