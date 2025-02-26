import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { dedent } from 'ts-dedent';

@Entity()
export class AppConfigEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: 'BET, NOT BAD' })
  botName: string;

  @Column({
    nullable: false,
    default: dedent`
Win every 3 minutes by betting multiple TON-native coins.
Fair smart contract draws — honest, simple, and fun.`,
    length: 120,
  })
  botShortDescription: string;

  @Column({
    nullable: false,
    type: 'text',
    default: dedent`Welcome to BET, NOT BAD!

Win every 3 minutes by betting multiple TON-native coins.
Fair smart contract draws — honest, simple, and fun.
Make your day NOT BAD 😎

Open the app! ⚡`,
  })
  botStart: string;

  @Column({
    nullable: false,
    type: 'text',
    default: dedent`Welcome to BET, NOT BAD! 😎

Bet with multiple TON-based coins and spin the fortune wheel every 3 minutes! Smart contracts select winners randomly based on your bets. Winners take it all! 🫰

⚡ Open the app, connect your wallet, and start winning!`,
  })
  botDescription: string;

  @Column({ nullable: false, default: 300000 }) // 5 minutes default
  configCacheTtl: number;

  @Column({
    nullable: false,
    type: 'text',
    default: 'For any questions or assistance, please contact our support team at root@zhdanov.me',
  })
  botHelp: string;

  @Column({ nullable: true, default: 'START 🕹️' })
  botButtonText: string;

  @Column({ nullable: true, default: 'https://t.me/bet_not_bad_bot/App' })
  botButtonUrl: string;

}
