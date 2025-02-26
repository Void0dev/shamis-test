import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { Repository } from 'typeorm';
import { cards } from './types/cards';

describe('GameService', () => {
  let service: GameService;
  let roomRepository: Repository<Room>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: getRepositoryToken(Room),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    roomRepository = module.get<Repository<Room>>(getRepositoryToken(Room));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shuffleCards', () => {
    it('should return an array of the same length as the input', () => {
      const testArray = [1, 2, 3, 4, 5];
      const result = service.shuffleCards(testArray);
      expect(result.length).toBe(testArray.length);
    });

    it('should contain all the same elements as the input array', () => {
      const testArray = [1, 2, 3, 4, 5];
      const result = service.shuffleCards(testArray);
      expect(result).toEqual(expect.arrayContaining(testArray));
      expect(testArray).toEqual(expect.arrayContaining(result));
    });

    it('should not modify the original array', () => {
      const testArray = [1, 2, 3, 4, 5];
      const originalArray = [...testArray];
      service.shuffleCards(testArray);
      expect(testArray).toEqual(originalArray);
    });

    it('should shuffle the array (statistical test)', () => {
      // This test checks if shuffling actually happens
      // We'll run multiple shuffles and check if at least one is different from the original
      const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      let atLeastOneDifferentOrder = false;
      
      // Run multiple shuffles to reduce the chance of false positives
      for (let i = 0; i < 10; i++) {
        const result = service.shuffleCards(testArray);
        
        // Check if the order is different
        const orderChanged = result.some((val, idx) => val !== testArray[idx]);
        if (orderChanged) {
          atLeastOneDifferentOrder = true;
          break;
        }
      }
      
      expect(atLeastOneDifferentOrder).toBe(true);
    });

    it('should handle empty arrays', () => {
      const emptyArray: number[] = [];
      const result = service.shuffleCards(emptyArray);
      expect(result).toEqual([]);
    });

    it('should handle arrays with a single element', () => {
      const singleElementArray = [42];
      const result = service.shuffleCards(singleElementArray);
      expect(result).toEqual([42]);
    });

    it('should handle card arrays properly', () => {
      const result = service.shuffleCards([...cards]);
      
      // Check that all cards are still present
      expect(result.length).toBe(cards.length);
      expect(result).toEqual(expect.arrayContaining(cards));
      expect(cards).toEqual(expect.arrayContaining(result));
      
      // Statistical test for shuffling
      let atLeastOneDifferentOrder = false;
      for (let i = 0; i < 5; i++) {
        const shuffledAgain = service.shuffleCards([...cards]);
        const orderChanged = shuffledAgain.some((val, idx) => val !== result[idx]);
        if (orderChanged) {
          atLeastOneDifferentOrder = true;
          break;
        }
      }
      
      expect(atLeastOneDifferentOrder).toBe(true);
    });
  });
});
