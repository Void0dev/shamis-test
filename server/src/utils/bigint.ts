export function maxBigInt(...values: bigint[]): bigint {
  if (values.length === 0) {
    throw new Error('No values provided to maxBigInt');
  }
  return values.reduce((max, current) => current > max ? current : max);
}
