import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigEntity } from './app-config.entity';
import { AppConfigService } from './app-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppConfigEntity])],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
