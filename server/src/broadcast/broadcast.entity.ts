import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('broadcast')
export class BroadcastEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ nullable: true, type: 'timestamptz' })
  createdAt: Date;

  @Column()
  message: string;

  @Column({ nullable: true, type: 'varchar' })
  image: string | null;

  @Column({ nullable: true, type: 'varchar' })
  buttonUrl: string | null;

  @Column({ nullable: true, type: 'varchar' })
  buttonText: string | null;

  @Column({ default: false })
  toSend: boolean;

  @Column({ type: 'int', default: 0 })
  userPointer: number;

  @Column({ default: false })
  finished: boolean;
}
