import { Card } from '../types/cards';
import { Rank, ranks } from '../types/ranks';
import { Suite } from '../types/suites';

/**
 * Get the rank of a card
 * @param card Card in format 'RS' where R is rank and S is suite
 * @returns The rank of the card
 */
export function getCardRank(card: Card): Rank {
  return card.charAt(0) as Rank;
}

/**
 * Get the suite of a card
 * @param card Card in format 'RS' where R is rank and S is suite
 * @returns The suite of the card
 */
export function getCardSuite(card: Card): Suite {
  return card.charAt(1) as Suite;
}

/**
 * Compare ranks of two cards
 * @param rank1 First rank
 * @param rank2 Second rank
 * @returns 1 if rank1 > rank2, -1 if rank1 < rank2, 0 if equal
 */
export function compareRanks(rank1: Rank, rank2: Rank): number {
  const rank1Index = ranks.indexOf(rank1);
  const rank2Index = ranks.indexOf(rank2);
  
  if (rank1Index < rank2Index) return 1; // Lower index means higher rank in our array
  if (rank1Index > rank2Index) return -1;
  return 0;
}

/**
 * Check if attackCard can be beaten by defenseCard
 * @param attackCard The card being played (attacked with)
 * @param defenseCard The card trying to beat the attack card
 * @param trump The trump suite
 * @returns true if defenseCard can beat attackCard, false otherwise
 */
export function canBeat(attackCard: Card, defenseCard: Card, trump: Suite): boolean {
  const attackSuite = getCardSuite(attackCard);
  const defenseSuite = getCardSuite(defenseCard);
  
  // If defense card is trump and attack card is not, defense wins
  if (defenseSuite === trump && attackSuite !== trump) {
    return true;
  }
  
  // If both cards are trump or both are not trump, compare ranks
  if (defenseSuite === attackSuite) {
    return compareRanks(getCardRank(defenseCard), getCardRank(attackCard)) > 0;
  }
  
  // If attack is trump and defense is not, defense loses
  return false;
}

/**
 * Check if a card can be added to the table
 * @param card The card to add
 * @param tableCards Cards already on the table
 * @returns true if the card can be added, false otherwise
 */
export function canAddToTable(card: Card, tableCards: Card[]): boolean {
  // If table is empty, any card can be added
  if (tableCards.length === 0) {
    return true;
  }
  
  // Get all ranks on the table
  const ranksOnTable = new Set([
    ...tableCards.map(getCardRank)
  ]);
  
  // Card can be added if its rank is already on the table
  return ranksOnTable.has(getCardRank(card));
}
