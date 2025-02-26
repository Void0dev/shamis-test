import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../user/user.entity';
import { Card } from './types/cards';
import { Suite } from './types/suites';

@Entity('game_rooms')
export class Room {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar' })
  trump: Suite;

  @ManyToOne(() => User)
  @JoinColumn()
  @Index()
  player1: User;

  @ManyToOne(() => User)
  @JoinColumn()
  @Index()
  player2: User | null;

  @Column('simple-array')
  tableCards: Card[];

  @Column('simple-array')
  unbittenCards: Card[];

  @Column('simple-array')
  remainingCards: Card[];

  @Column('simple-array')
  player1hand: Card[];

  @Column('simple-array')
  player2hand: Card[];

  @Column('simple-array')
  playedCards: Card[];

  @Column({ type: 'int', enum: [1, 2] })
  playerMove: 1 | 2;

  @Column({ type: 'boolean', default: false })
  @Index()
  finished: boolean;
}
