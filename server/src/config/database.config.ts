import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    url: process.env.DATABASE_URL!,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production',
    ssl: {
      rejectUnauthorized: false,
    },
    migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
    migrationsRun: process.env.NODE_ENV === 'production',
  };
});


