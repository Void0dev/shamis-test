export const ranks = ['A', 'K', 'Q', 'J', 'X', '9', '8', '7', '6'] as const;;
export type Rank = (typeof ranks)[number];