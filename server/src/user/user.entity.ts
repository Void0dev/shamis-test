import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  localTime: Date | null;

  @Index()
  @Column({ unique: true, type: 'varchar' })
  telegramId: string;

  @Column({ nullable: true, type: 'varchar' })
  tonAddress: string | null;

  @Column({ nullable: true, type: 'varchar' })
  username: string | null;

  @Column({ nullable: true, type: 'varchar' })
  firstName: string | null;

  @Column({ nullable: true, type: 'varchar' })
  lastName: string | null;

  @Column({ nullable: true, type: 'varchar' })
  languageCode: string | null;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true, type: 'varchar' })
  avatarUrl: string | null;

  @Column({ nullable: true, type: 'varchar' })
  ref: string | null;
}
