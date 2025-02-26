export const suites = ['C', 'D', 'H', 'P'] as const;
export type Suite = (typeof suites)[number];