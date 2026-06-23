export interface Farm {
  id: string;
  ticker: string;
  status: "active" | "closed";

  // Config
  priceMin: number;
  priceMax: number;
  spread: number;
  commission: number;
  mode: "volume" | "value";
  volumePerLevel: number;
  valuePerLevel: number;

  // Portfolio
  capital: number;
  shares: number;
  costPerShare: number;
  cash: number;
  marketPrice: number;

  // Trade stats
  sharesForSale: number;
  sharesBidding: number;
  plToday: number;
  plTotal: number;

  createdAt: Date;
}

export interface FarmConfig {
  ticker: string;
  priceMin: number | "";
  priceMax: number | "";
  spread: number | "";
  commission: number | "";
  mode: "volume" | "value";
  volumePerLevel: number | "";
  valuePerLevel: number | "";
  capital: number | "";
}

export type CloseMethod = "sell-and-transfer" | "transfer-to-portfolio";

export type AppView = "asset-menu" | "farming" | "new-farm" | "farm-detail";
