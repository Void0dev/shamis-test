import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { memoizeAsync } from 'utils-decorators';
import { ConfigService } from '@nestjs/config';

interface TelegramUserData {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  localTime?: Date;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  @memoizeAsync(10000)
  async findByTelegramId(telegramId: string) {
    return this.userRepository.findOne({ where: { telegramId } });
  }

  @memoizeAsync(10000)
  async findByTonAddress(tonAddress: string) {
    return this.userRepository.findOne({ where: { tonAddress } });
  }

  async createUserFromTelegram(data: Omit<User, 'id' | 'createdAt'>) {
    const user = this.userRepository.create({
      telegramId: data.telegramId,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      localTime: data.localTime,
    });
    return this.userRepository.save(user);
  }

  async updateLocalTime(userId: number, localTime: Date) {
    return this.userRepository.update(userId, { localTime });
  }

  async setLanguageCode(userId: number, languageCode: string) {
    return this.userRepository.update(userId, { languageCode });
  }

  async setTonAddress(userId: number, tonAddress: string) {
    return this.userRepository.update(userId, { tonAddress });
  }

  async updateUser(userId: number, data: Partial<User>) {
    await this.userRepository.update(userId, data);
    return this.findById(userId);
  }

  async getUsersBatch(pointer: number, batchSize: number = 100) {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id > :pointer', { pointer })
      .orderBy('user.id', 'ASC')
      .take(batchSize)
      .getMany();
  }

  async findAdminUsers() {
    return this.userRepository.find({
      where: this.configService.get('TESTNET') ? {} : { isAdmin: true }
    });
  }
}
