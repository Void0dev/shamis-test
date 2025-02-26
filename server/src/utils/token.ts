export function parseToken(amount: string | number | bigint, decimals?: number | undefined | null): number {
  return Number(amount) / Math.pow(10, decimals || 9);
}

export function formatToken(amount: string | number | bigint, decimals?: number | undefined | null, fractionDigits = 2): string {
  return parseToken(amount, decimals).toFixed(fractionDigits);
}
