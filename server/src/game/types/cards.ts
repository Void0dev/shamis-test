export type Card = typeof cards[number];
export const cards = [
    "AC", "KC", "QC", "JC", "XC", "9C", "8C", "7C", "6C",
    "AD", "KD", "QD", "JD", "XD", "9D", "8D", "7D", "6D",
    "AH", "KH", "QH", "JH", "XH", "9H", "8H", "7H", "6H",
    "AP", "KP", "QP", "JP", "XP", "9P", "8P", "7P", "6P"
] as const;