import type { Farm, FarmConfig } from "./types";

export function generateGridLevels(
  priceMin: number,
  priceMax: number,
  spread: number
): number[] {
  const levels: number[] = [];
  for (let p = priceMin; p <= priceMax + 1e-9; p += spread) {
    levels.push(parseFloat(p.toFixed(2)));
  }
  return levels;
}

export function calcGridLevelCount(
  priceMin: number,
  priceMax: number,
  spread: number
): number {
  return Math.floor((priceMax - priceMin) / spread);
}

export function calcNeedInvestment(config: {
  priceMin: number;
  priceMax: number;
  spread: number;
  commission: number;
  mode: "volume" | "value";
  volumePerLevel: number;
  valuePerLevel: number;
}): number {
  const levels = calcGridLevelCount(
    config.priceMin,
    config.priceMax,
    config.spread
  );
  let need =
    config.mode === "volume"
      ? config.volumePerLevel * config.priceMax * levels
      : config.valuePerLevel * levels;
  return need * (1 + config.commission / 100);
}

export function calcFirstBuyOrder(
  priceMin: number,
  priceMax: number,
  spread: number,
  marketPrice: number
): number {
  const levels = generateGridLevels(priceMin, priceMax, spread);
  return levels.find((l) => l > marketPrice) ?? priceMax;
}

export function calcPL(farm: Farm): number {
  const marketValue = farm.marketPrice * farm.shares;
  return marketValue + farm.cash - farm.capital;
}

export function calcMarketValue(farm: Farm): number {
  return farm.marketPrice * farm.shares;
}

export function calcCostValue(farm: Farm): number {
  return farm.costPerShare * farm.shares;
}

export function isConfigValid(config: FarmConfig): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!config.ticker.trim()) errors.ticker = "กรุณากรอก Ticker";

  const min = Number(config.priceMin);
  const max = Number(config.priceMax);
  const spread = Number(config.spread);
  const commission = Number(config.commission);

  if (!config.priceMin && config.priceMin !== 0)
    errors.priceMin = "กรุณากรอกราคาต่ำสุด";
  else if (min <= 0) errors.priceMin = "ราคาต่ำสุดต้องมากกว่า 0";

  if (!config.priceMax && config.priceMax !== 0)
    errors.priceMax = "กรุณากรอกราคาสูงสุด";
  else if (max <= min) errors.priceMax = "ราคาสูงสุดต้องมากกว่าราคาต่ำสุด";

  if (!config.spread && config.spread !== 0)
    errors.spread = "กรุณากรอก Spread";
  else if (spread <= 0) errors.spread = "Spread ต้องมากกว่า 0";
  else if (min > 0 && max > min && spread >= max - min)
    errors.spread = "Spread ต้องน้อยกว่าช่วงราคา";

  if (config.commission === "" || commission < 0)
    errors.commission = "กรุณากรอก Commission";

  if (config.mode === "volume") {
    const vol = Number(config.volumePerLevel);
    if (!config.volumePerLevel && config.volumePerLevel !== 0)
      errors.volumePerLevel = "กรุณากรอกจำนวนหุ้น";
    else if (vol <= 0) errors.volumePerLevel = "จำนวนหุ้นต้องมากกว่า 0";
  } else {
    const val = Number(config.valuePerLevel);
    if (!config.valuePerLevel && config.valuePerLevel !== 0)
      errors.valuePerLevel = "กรุณากรอกจำนวนเงิน";
    else if (val <= 0) errors.valuePerLevel = "จำนวนเงินต้องมากกว่า 0";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(value: number): string {
  return `฿${formatNumber(value)}`;
}

/** Seed-based mock OHLC for a ticker */
export function generateMockOHLC(
  ticker: string,
  priceMin: number,
  priceMax: number,
  count = 28
): { open: number; high: number; low: number; close: number }[] {
  const mid = (priceMin + priceMax) / 2;
  const range = (priceMax - priceMin) * 0.6;
  let seed = ticker
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  function rand(): number {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  }

  const candles: { open: number; high: number; low: number; close: number }[] =
    [];
  let prev = mid;

  for (let i = 0; i < count; i++) {
    const change = (rand() - 0.48) * range * 0.08;
    const open = prev;
    const close = Math.max(priceMin * 0.8, Math.min(priceMax * 1.2, open + change));
    const high = Math.max(open, close) + rand() * range * 0.03;
    const low = Math.min(open, close) - rand() * range * 0.03;
    candles.push({
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });
    prev = close;
  }
  return candles;
}

/** Simulated backtest numbers */
export function calcBacktest(config: {
  priceMin: number;
  priceMax: number;
  spread: number;
  commission: number;
  mode: "volume" | "value";
}): { farmReturn: number; benchmark: number; turnover: number } {
  const range = config.priceMax - config.priceMin;
  const levels = calcGridLevelCount(
    config.priceMin,
    config.priceMax,
    config.spread
  );
  const turnoversPerMonth = Math.min(30, Math.round(levels * 0.8));
  const profitPerRound =
    (config.spread / config.priceMin) * 100 - config.commission * 2;
  const farmReturn = parseFloat(
    (turnoversPerMonth * profitPerRound * 0.12).toFixed(2)
  );
  const benchmark = parseFloat(
    ((range / config.priceMin) * 100 * 0.3).toFixed(2)
  );
  return { farmReturn, benchmark, turnover: turnoversPerMonth };
}

export function createMockFarm(
  config: FarmConfig,
  id: string,
  marketPrice: number
): Farm {
  const min = Number(config.priceMin);
  const max = Number(config.priceMax);
  const spread = Number(config.spread);
  const commission = Number(config.commission);
  const capital = Number(config.capital) || 0;
  const levels = calcGridLevelCount(min, max, spread);
  const volPerLevel =
    config.mode === "volume"
      ? Number(config.volumePerLevel)
      : Number(config.valuePerLevel) / max;
  const shares = Math.floor(levels * volPerLevel * 0.5);
  const costPerShare = marketPrice * 0.98;
  const cash = capital - shares * costPerShare;

  return {
    id,
    ticker: config.ticker.toUpperCase(),
    status: "active",
    priceMin: min,
    priceMax: max,
    spread,
    commission,
    mode: config.mode,
    volumePerLevel: Number(config.volumePerLevel) || 0,
    valuePerLevel: Number(config.valuePerLevel) || 0,
    capital,
    shares,
    costPerShare,
    cash,
    marketPrice,
    sharesForSale: Math.floor(shares * 0.3),
    sharesBidding: Math.floor(levels * volPerLevel * 0.2),
    plToday: parseFloat(((Math.random() - 0.4) * capital * 0.002).toFixed(2)),
    plTotal: parseFloat(((Math.random() * 0.05 + 0.01) * capital).toFixed(2)),
    createdAt: new Date(),
  };
}
