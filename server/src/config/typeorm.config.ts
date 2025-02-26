import { config } from 'dotenv';
config();
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL!,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  ssl: {
    rejectUnauthorized: false,
  },
  migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
  migrationsRun: process.env.NODE_ENV === 'production',
});
