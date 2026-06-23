import { Card, Tag, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@sarunyu/system-one";
import type { Farm } from "../types";
import { calcPL, calcMarketValue, calcCostValue, formatCurrency, formatNumber } from "../utils";

interface Props {
  farm: Farm;
}

export default function FarmOverview({ farm }: Props) {
  const pl = calcPL(farm);
  const marketValue = calcMarketValue(farm);
  const costValue = calcCostValue(farm);
  const plPositive = pl >= 0;
  const plPct = farm.capital > 0 ? (pl / farm.capital) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Portfolio Summary */}
      <Card size="desktop">
        <div className="flex flex-col gap-4">
          <h2 className="type-h5 text-foreground">Portfolio Summary</h2>
          <div className="metrics-grid">
            <MetricCell label="เงินลงทุนเริ่มต้น" value={formatCurrency(farm.capital)} />
            <MetricCell
              label="ต้นทุน/หุ้น"
              value={farm.shares > 0 ? formatCurrency(farm.costPerShare) : "N/A"}
            />
            <MetricCell label="จำนวนหุ้น" value={`${formatNumber(farm.shares, 0)} หุ้น`} />
            <MetricCell
              label="มูลค่าต้นทุน"
              value={farm.shares > 0 ? formatCurrency(costValue) : "฿0.00"}
            />
            <MetricCell
              label="มูลค่าตลาด"
              value={formatCurrency(marketValue)}
              sub={`@ ฿${formatNumber(farm.marketPrice)}`}
            />
            <MetricCell label="เงินสด" value={formatCurrency(farm.cash)} />
          </div>

          <div className="rounded-lg p-4 flex items-center justify-between gap-4 border border-border bg-default-secondary">
            <div className="flex flex-col gap-1">
              <span className="type-caption text-muted-foreground">กำไร / ขาดทุน (P/L รวม)</span>
              <span
                className={`type-h5 font-bold ${plPositive ? "pl-positive" : "pl-negative"}`}
              >
                {plPositive ? "+" : ""}
                {formatCurrency(pl)}
              </span>
            </div>
            <Tag
              text={`${plPositive ? "+" : ""}${formatNumber(plPct, 2)}%`}
              variant={plPositive ? "green" : "red"}
              size="small"
              icon
            />
          </div>
        </div>
      </Card>

      {/* Trade Statistics */}
      <Card size="desktop">
        <div className="flex flex-col gap-4">
          <h2 className="type-h5 text-foreground">สถิติการเทรด</h2>
          <div className="metrics-grid">
            <MetricCell label="วางขายอยู่" value={`${formatNumber(farm.sharesForSale, 0)} หุ้น`} />
            <MetricCell label="วางซื้ออยู่" value={`${formatNumber(farm.sharesBidding, 0)} หุ้น`} />
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
            <MetricCell label="ราคาตลาด" value={formatCurrency(farm.marketPrice)} />
            <MetricCell
              label="Grid Range"
              value={`฿${formatNumber(farm.priceMin)} – ฿${formatNumber(farm.priceMax)}`}
            />
          </div>
        </div>
      </Card>

      {/* Farm config */}
      <Card size="desktop">
        <div className="flex flex-col gap-4">
          <h2 className="type-h5 text-foreground">Config ฟาร์ม</h2>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>รายการ</TableHeaderCell>
                <TableHeaderCell>ค่า</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <ConfigRow label="Ticker" value={farm.ticker} />
              <ConfigRow label="Price Min" value={formatCurrency(farm.priceMin)} />
              <ConfigRow label="Price Max" value={formatCurrency(farm.priceMax)} />
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
                <ConfigRow label="Value/Level" value={formatCurrency(farm.valuePerLevel)} />
              )}
              <ConfigRow
                label="เริ่มต้น"
                value={farm.createdAt.toLocaleDateString("th-TH")}
              />
            </TableBody>
          </Table>
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
    <div className="flex flex-col gap-0.5 p-3 rounded bg-default-secondary">
      <span className="type-caption text-muted-foreground">{label}</span>
      <span className={`type-subtitle-1 font-semibold ${colorClass}`}>
        {prefix}
        {value}
      </span>
      {sub && <span className="type-caption text-muted-foreground">{sub}</span>}
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      <TableCell>{value}</TableCell>
    </TableRow>
  );
}
