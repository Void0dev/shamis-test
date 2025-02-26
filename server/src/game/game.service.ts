import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Room } from './room.entity';
import { User } from '../user/user.entity';
import { Card, cards } from './types/cards';
import { Rank } from './types/ranks';
import { Suite } from './types/suites';
import { memoizeAsync } from 'utils-decorators';
import { canAddToTable, canBeat, getCardRank, getCardSuite, compareRanks } from './utils/card-utils';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}
  
  // Find a room by user ID (either as player1 or player2)
  async findRoomByUserId(userId: number): Promise<Room | null> {
    // First, try to find a room where the user is player1
    let room = await this.roomRepository.findOne({
      where: {
        player1: { id: userId },
        finished: false
      },
      relations: ['player1', 'player2']
    });

    // If not found, try to find a room where the user is player2
    if (!room) {
      room = await this.roomRepository.findOne({
        where: {
          player2: { id: userId },
          finished: false
        },
        relations: ['player1', 'player2']
      });
    }

    return room;
  }

  // Create a new room with the first player
  async createRoom(userId: number, trump?: Suite): Promise<Room> {
    // Check if user is already in a room
    const existingRoom = await this.findRoomByUserId(userId);
    if (existingRoom) {
      throw new BadRequestException('User is already in a room');
    }

    // If trump is not specified, randomly select one
    if (!trump) {
      const suites = ['C', 'D', 'H', 'P'] as const;
      trump = suites[Math.floor(Math.random() * suites.length)];
    }

    // Shuffle the deck of cards
    const shuffledDeck = this.shuffleCards([...cards]);
    
    // Deal cards for player1 (first 6 cards)
    const player1hand = shuffledDeck.splice(0, 6);
    
    // Deal cards for player2 (next 6 cards)
    const player2hand = shuffledDeck.splice(0, 6);
    
    // Remaining cards will be available for drawing
    const remainingCards = shuffledDeck;

    // Create a new room
    const room = this.roomRepository.create({
      trump,
      player1: { id: userId } as User,
      tableCards: [],
      unbittenCards: [],
      remainingCards,
      player1hand,
      player2hand: [], // Will be populated when player2 joins
      playedCards: [],
      playerMove: 1, // Player 1 starts
      finished: false,
    });

    return this.roomRepository.save(room);
  }

  // Helper method to shuffle an array (Fisher-Yates algorithm)
  shuffleCards<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i] as T, shuffled[j] as T] = [shuffled[j] as T, shuffled[i] as T];
    }
    return shuffled;
  }

  // Join a room
  async joinRoom(userId: number, roomId: number): Promise<Room> {
    // Find the room
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['player1', 'player2'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if room is already full
    if (room.player2) {
      throw new BadRequestException('Room is already full');
    }

    // Check if user is trying to join their own room
    if (room.player1.id === userId) {
      throw new BadRequestException('You cannot join your own room');
    }

    // Deal cards to player2
    const player2hand = room.remainingCards.splice(0, 6);

    // Set player2
    room.player2 = { id: userId } as User;
    room.player2hand = player2hand;

    // Determine who goes first based on lowest trump card
    const player1TrumpCards = room.player1hand.filter(card => getCardSuite(card) === room.trump);
    const player2TrumpCards = player2hand.filter(card => getCardSuite(card) === room.trump);

    // If one player has trump cards and the other doesn't, the player with trump cards goes first
    if (player1TrumpCards.length > 0 && player2TrumpCards.length === 0) {
      room.playerMove = 1;
    } else if (player2TrumpCards.length > 0 && player1TrumpCards.length === 0) {
      room.playerMove = 2;
    } else if (player1TrumpCards.length > 0 && player2TrumpCards.length > 0) {
      // Both players have trump cards, find the lowest trump card for each
      const lowestPlayer1Trump = player1TrumpCards.reduce((lowest: Card | null, card) => {
        if (!lowest) return card;
        return compareRanks(getCardRank(card), getCardRank(lowest)) > 0 ? card : lowest;
      }, null);
      
      const lowestPlayer2Trump = player2TrumpCards.reduce((lowest: Card | null, card) => {
        if (!lowest) return card;
        return compareRanks(getCardRank(card), getCardRank(lowest)) > 0 ? card : lowest;
      }, null);
      
      if (!lowestPlayer1Trump || !lowestPlayer2Trump) {
        throw new Error('No trump cards in hand');
      }
      // Compare the lowest trump cards
      const comparison = compareRanks(getCardRank(lowestPlayer1Trump), getCardRank(lowestPlayer2Trump));
      room.playerMove = comparison > 0 ? 1 : 2;
    } else {
      // Neither player has trump cards, player1 starts by default
      room.playerMove = 1;
    }

    return this.roomRepository.save(room);
  }

  // Make a move in the game
  async makeMove(userId: number, roomId: number, card: Card): Promise<Room> {
    // Find the room
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['player1', 'player2'],
    });

    if (!room) {
      throw new Error('Room not found');
    }

    // Check if the game is already finished
    if (room.finished) {
      throw new Error('Game is already finished');
    }

    // Check if the user is in the room
    const isPlayer1 = room.player1?.id === userId;
    const isPlayer2 = room.player2?.id === userId;

    if (!isPlayer1 && !isPlayer2) {
      throw new Error('User is not in the room');
    }

    // Check if it's the user's turn
    const isPlayerTurn = 
      (isPlayer1 && room.playerMove === 1) || 
      (isPlayer2 && room.playerMove === 2);

    if (!isPlayerTurn) {
      throw new Error('Not your turn');
    }

    // Get the player's hand
    const playerHand = isPlayer1 ? room.player1hand : room.player2hand;

    // Check if the card is in the player's hand
    if (!playerHand.includes(card)) {
      throw new Error('Card is not in your hand');
    }

    // Determine if this is an attack or defense move
    const isAttackMove = room.unbittenCards.length === 0;

    if (isAttackMove) {
      // This is an attack move
      
      // Check if the card can be added to the table
      if (room.tableCards.length > 0 && !canAddToTable(card, room.tableCards)) {
        throw new Error('This card cannot be played - rank not on table');
      }

      // Add the card to the table and unbitten cards
      room.tableCards.push(card);
      room.unbittenCards.push(card);
      
      // Remove the card from the player's hand
      if (isPlayer1) {
        room.player1hand = room.player1hand.filter(c => c !== card);
      } else {
        room.player2hand = room.player2hand.filter(c => c !== card);
      }

      // Save the updated room
      return await this.roomRepository.save(room);
    } else {
      // This is a defense move
      
      // Get the last unbitten card
      // TODO: Check if card is not null 
      const cardToBeat = room.unbittenCards[0] as Card;
      
      // Check if the card can beat the unbitten card
      if (!canBeat(cardToBeat, card, room.trump)) {
        throw new Error('This card cannot beat the attack card');
      }
      
      // Add the card to the table
      room.tableCards.push(card);
      
      // Remove the card from unbitten cards
      room.unbittenCards.shift();
      
      // Remove the card from the player's hand
      if (isPlayer1) {
        room.player1hand = room.player1hand.filter(c => c !== card);
      } else {
        room.player2hand = room.player2hand.filter(c => c !== card);
      }
      
      // If all cards are beaten, switch turns
      if (room.unbittenCards.length === 0) {
        room.playerMove = isPlayer1 ? 2 : 1;
      }
      
      // Save the updated room
      return await this.roomRepository.save(room);
    }
  }

  // Finish the current move (collect cards from table)
  async finishMove(userId: number, roomId: number): Promise<Room> {
    // Find the room
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['player1', 'player2'],
    });

    if (!room) {
      throw new Error('Room not found');
    }

    // Check if the game is already finished
    if (room.finished) {
      throw new Error('Game is already finished');
    }

    // Check if the user is in the room
    const isPlayer1 = room.player1?.id === userId;
    const isPlayer2 = room.player2?.id === userId;

    if (!isPlayer1 && !isPlayer2) {
      throw new Error('User is not in the room');
    }

    // Check if it's the user's turn
    const isPlayerTurn = 
      (isPlayer1 && room.playerMove === 1) || 
      (isPlayer2 && room.playerMove === 2);

    if (!isPlayerTurn) {
      throw new Error('Not your turn');
    }

    // Check if there are unbitten cards
    if (room.unbittenCards.length > 0) {
      // If there are unbitten cards, the player must take all cards from the table
      const playerHand = isPlayer1 ? room.player1hand : room.player2hand;
      
      // Add all table cards to the player's hand
      if (isPlayer1) {
        room.player1hand = [...playerHand, ...room.tableCards];
      } else {
        room.player2hand = [...playerHand, ...room.tableCards];
      }
    } else {
      // If all cards are beaten, move them to played cards
      room.playedCards = [...room.playedCards, ...room.tableCards];
    }

    // Clear the table
    room.tableCards = [];
    room.unbittenCards = [];

    // Draw cards if needed (each player should have at least 6 cards if possible)
    if (room.remainingCards.length > 0) {
      // First, the attacking player draws
      const attackingPlayer = room.playerMove === 1 ? 2 : 1; // The player who just defended is now attacking
      const attackingHand = attackingPlayer === 1 ? room.player1hand : room.player2hand;
      
      while (attackingHand.length < 6 && room.remainingCards.length > 0) {
        const card = room.remainingCards.pop() as Card;
        if (attackingPlayer === 1) {
          room.player1hand.push(card);
        } else {
          room.player2hand.push(card);
        }
      }
      
      // Then, the defending player draws
      const defendingPlayer = room.playerMove;
      const defendingHand = defendingPlayer === 1 ? room.player1hand : room.player2hand;
      
      while (defendingHand.length < 6 && room.remainingCards.length > 0) {
        const card = room.remainingCards.pop() as Card;
        if (defendingPlayer === 1) {
          room.player1hand.push(card);
        } else {
          room.player2hand.push(card);
        }
      }
    }

    // Switch turns if all cards were beaten
    // If player had to take cards, they don't get to attack next
    if (room.unbittenCards.length === 0) {
      room.playerMove = room.playerMove === 1 ? 2 : 1;
    }

    // Check if game is finished
    if ((room.player1hand.length === 0 || room.player2hand.length === 0) && 
        room.remainingCards.length === 0) {
      room.finished = true;
    }

    return this.roomRepository.save(room);
  }

  // Leave a room
  async leaveRoom(userId: number, roomId: number): Promise<{ success: boolean }> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['player1', 'player2'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is a player in the room
    const isPlayer1 = room.player1.id === userId;
    const isPlayer2 = room.player2?.id === userId;

    if (!isPlayer1 && !isPlayer2) {
      throw new BadRequestException('You are not a player in this room');
    }

    // Mark the room as finished
    room.finished = true;
    await this.roomRepository.save(room);

    return { success: true };
  }

  // Get room details by ID
  async getRoomById(userId: number, roomId: number): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['player1', 'player2'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is a player in the room
    const isPlayer1 = room.player1.id === userId;
    const isPlayer2 = room.player2?.id === userId;

    if (!isPlayer1 && !isPlayer2) {
      throw new BadRequestException('You are not a player in this room');
    }

    return room;
  }

  @memoizeAsync(3000)
  async getEmptyRooms(): Promise<Room[] | null> {
    return this.roomRepository.find({
      where: {
        player2: IsNull(),
        finished: false
      },
      relations: ['player1']
    });
  }
}
