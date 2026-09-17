export function normalizeCoinbaseCandles(candles) {
  if (!Array.isArray(candles)) {
    return { prices: [], volumesUSD: [] };
  }

  const normalized = candles
    .map((candle) => {
      if (!Array.isArray(candle) || candle[4] == null || candle[5] == null) {
        return null;
      }

      const price = Number(candle[4]);
      const baseVolume = Number(candle[5]);

      if (!Number.isFinite(price) || !Number.isFinite(baseVolume) || price <= 0 || baseVolume < 0) {
        return null;
      }

      return {
        price,
        volumeUSD: price * baseVolume,
      };
    })
    .filter(Boolean)
    .reverse();

  return {
    prices: normalized.map((item) => item.price),
    volumesUSD: normalized.map((item) => item.volumeUSD),
  };
}
