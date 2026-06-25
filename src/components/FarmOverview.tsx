import { Card } from "@sarunyu/system-one";
import type { Farm } from "../types";
import {
  calcPL,
  calcMarketValue,
  calcCostValue,
  formatCurrency,
  formatNumber,
  calcGridLevelCount,
} from "../utils";
import CandlestickChart from "./CandlestickChart";

interface Props {
  farm: Farm;
}

export default function FarmOverview({ farm }: Props) {
  const pl = calcPL(farm);
  const marketValue = calcMarketValue(farm);
  const costValue = calcCostValue(farm);
  const plPositive = pl >= 0;
  const plPct = farm.capital > 0 ? (pl / farm.capital) * 100 : 0;
  const gridLevels = calcGridLevelCount(farm.priceMin, farm.priceMax, farm.spread);

  // Position of market price within the grid range (0–1)
  const rangeSize = farm.priceMax - farm.priceMin;
  const pricePosition =
    rangeSize > 0
      ? Math.max(0, Math.min(1, (farm.marketPrice - farm.priceMin) / rangeSize))
      : 0;
  const inRange =
    farm.marketPrice >= farm.priceMin && farm.marketPrice <= farm.priceMax;

  return (
    <div className="flex flex-col gap-4">
      {/* Performance + Chart (Binance Bot Details pattern) */}
      <Card size="desktop">
        <div className="flex flex-col gap-4">
          {/* ROI + PnL hero */}
          <div className="flex items-end gap-6">
            <div className="flex flex-col gap-0.5">
              <span className="type-caption text-muted-foreground">ROI</span>
              <span className={`type-h4 font-bold ${plPositive ? "pl-positive" : "pl-negative"}`}>
                {plPositive ? "+" : ""}{formatNumber(plPct, 2)}%
              </span>
            </div>
            <div className="w-px h-8 bg-divider" />
            <div className="flex flex-col gap-0.5">
              <span className="type-caption text-muted-foreground">PnL (฿)</span>
              <span className={`type-h5 font-bold ${plPositive ? "pl-positive" : "pl-negative"}`}>
                {plPositive ? "+" : ""}{formatCurrency(pl)}
              </span>
            </div>
          </div>

          {/* Chart header + legend */}
          <div className="flex items-center justify-between">
            <span className="type-caption text-muted-foreground">กราฟราคา + Grid Levels</span>
            <div className="flex items-center gap-3 type-caption text-muted-foreground">
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-4 rounded"
                  style={{ borderTop: "2px dashed #185fa5", height: 0, verticalAlign: "middle" }}
                />
                ซื้อ
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-4 rounded"
                  style={{ borderTop: "2px dashed #ba7517", height: 0, verticalAlign: "middle" }}
                />
                ขาย
              </span>
            </div>
          </div>
          <CandlestickChart
            ticker={farm.ticker}
            priceMin={farm.priceMin}
            priceMax={farm.priceMax}
            spread={farm.spread}
            marketPrice={farm.marketPrice}
          />
        </div>
      </Card>

      {/* Portfolio */}
      <Card size="desktop">
        <div className="flex flex-col gap-4">
          <span className="type-subtitle-1 text-foreground">พอร์ตฟอลิโอ</span>
          <div className="metrics-grid">
            <MetricCell label="เงินลงทุน" value={formatCurrency(farm.capital)} />
            <MetricCell
              label="มูลค่าตลาด"
              value={formatCurrency(marketValue)}
              sub={`@ ฿${formatNumber(farm.marketPrice)}`}
            />
            <MetricCell
              label="มูลค่าต้นทุน"
              value={farm.shares > 0 ? formatCurrency(costValue) : "฿0.00"}
            />
            <MetricCell label="เงินสด" value={formatCurrency(farm.cash)} />
            <MetricCell
              label="จำนวนหุ้น"
              value={`${formatNumber(farm.shares, 0)} หุ้น`}
            />
            <MetricCell
              label="ต้นทุน/หุ้น"
              value={farm.shares > 0 ? formatCurrency(farm.costPerShare) : "N/A"}
            />
          </div>
        </div>
      </Card>

      {/* Grid info + Trade stats */}
      <Card size="desktop">
        <div className="flex flex-col gap-4">
          <span className="type-subtitle-1 text-foreground">สถิติการเทรด</span>

          {/* Grid range bar */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between type-caption text-muted-foreground">
              <span>Grid Range</span>
              <span>
                ฿{formatNumber(farm.priceMin)} – ฿{formatNumber(farm.priceMax)}
              </span>
            </div>
            <div className="grid-range-bar relative h-1 rounded-full overflow-visible">
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full ${inRange ? "bg-primary-action" : "bg-destructive"}`}
                style={{ left: `calc(${pricePosition * 100}% - 1px)` }}
              />
            </div>
            <div className="flex justify-between type-caption">
              <span className="text-muted-foreground">
                ฿{formatNumber(farm.priceMin)}
              </span>
              <span
                className={`font-medium ${inRange ? "text-muted-foreground" : "text-destructive"}`}
              >
                ฿{formatNumber(farm.marketPrice)}
              </span>
              <span className="text-muted-foreground">
                ฿{formatNumber(farm.priceMax)}
              </span>
            </div>
          </div>

          <div className="metrics-grid">
            <MetricCell
              label="P/L รายวัน"
              value={formatCurrency(farm.plToday)}
              highlight={farm.plToday >= 0 ? "green" : "red"}
              prefix={farm.plToday >= 0 ? "+" : ""}
            />
            <MetricCell
              label="P/L ตั้งแต่เริ่ม"
              value={formatCurrency(farm.plTotal)}
              highlight={farm.plTotal >= 0 ? "green" : "red"}
              prefix={farm.plTotal >= 0 ? "+" : ""}
            />
            <MetricCell
              label="วางขายอยู่"
              value={`${formatNumber(farm.sharesForSale, 0)} หุ้น`}
            />
            <MetricCell
              label="วางซื้ออยู่"
              value={`${formatNumber(farm.sharesBidding, 0)} หุ้น`}
            />
            <MetricCell
              label="Grid Levels"
              value={`${gridLevels} ระดับ`}
            />
            <MetricCell
              label="Spread"
              value={`฿${formatNumber(farm.spread)}`}
            />
          </div>
        </div>
      </Card>

      {/* Config summary */}
      <Card size="desktop">
        <div className="flex flex-col gap-3">
          <span className="type-subtitle-1 text-foreground">Config ฟาร์ม</span>
          <div className="flex flex-col divide-y divide-divider">
            <ConfigRow label="Ticker" value={farm.ticker} />
            <ConfigRow
              label="Price Range"
              value={`฿${formatNumber(farm.priceMin)} – ฿${formatNumber(farm.priceMax)}`}
            />
            <ConfigRow label="Spread" value={`฿${formatNumber(farm.spread)}`} />
            <ConfigRow label="Commission" value={`${farm.commission}%`} />
            <ConfigRow
              label="Mode"
              value={farm.mode === "volume" ? "Volume (หุ้น)" : "Value (บาท)"}
            />
            {farm.mode === "volume" ? (
              <ConfigRow
                label="Volume/Level"
                value={`${formatNumber(farm.volumePerLevel, 0)} หุ้น`}
              />
            ) : (
              <ConfigRow
                label="Value/Level"
                value={formatCurrency(farm.valuePerLevel)}
              />
            )}
            <ConfigRow
              label="เริ่มต้น"
              value={farm.createdAt.toLocaleDateString("th-TH")}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

function MetricCell({
  label,
  value,
  sub,
  highlight,
  prefix = "",
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "green" | "red" | "amber";
  prefix?: string;
}) {
  const colorClass =
    highlight === "green"
      ? "pl-positive"
      : highlight === "red"
        ? "pl-negative"
        : highlight === "amber"
          ? "pl-amber"
          : "text-foreground";

  return (
    <div className="flex flex-col gap-0.5 p-3 rounded bg-bg-default-tertiary">
      <span className="type-caption text-muted-foreground">{label}</span>
      <div className="flex items-baseline justify-between gap-1">
        <span className={`type-subtitle-1 font-semibold ${colorClass}`}>
          {prefix}
          {value}
        </span>
        {sub && <span className="type-caption text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 type-body-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
