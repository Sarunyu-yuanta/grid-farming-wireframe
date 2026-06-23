import { useState, useMemo } from "react";
import {
  Button,
  Input,
  Checkbox,
  Alert,
  Card,
  Chip,
  NavSubHeader,
  PageContainer,
  Tag,
  ListItem,
} from "@sarunyu/system-one";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import InfoTooltip from "./InfoTooltip";
import type { FarmConfig, Farm } from "../types";
import {
  calcNeedInvestment,
  calcFirstBuyOrder,
  calcGridLevelCount,
  calcBacktest,
  isConfigValid,
  formatCurrency,
  formatNumber,
  createMockFarm,
} from "../utils";
import CandlestickChart from "./CandlestickChart";

interface Props {
  onCancel: () => void;
  onSubmit: (farm: Farm) => void;
  initialConfig?: Partial<FarmConfig>;
}

const DEFAULT_CONFIG: FarmConfig = {
  ticker: "",
  priceMin: "",
  priceMax: "",
  spread: "",
  commission: 0.15,
  mode: "volume",
  volumePerLevel: "",
  valuePerLevel: "",
  capital: "",
};

function simulatedMarketPrice(min: number, max: number): number {
  return parseFloat(((min + max) / 2).toFixed(2));
}

export default function NewFarmForm({ onCancel, onSubmit, initialConfig }: Props) {
  const [config, setConfig] = useState<FarmConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { valid, errors } = useMemo(() => isConfigValid(config), [config]);

  const numMin = Number(config.priceMin) || 0;
  const numMax = Number(config.priceMax) || 0;
  const numSpread = Number(config.spread) || 0;
  const numCommission = Number(config.commission) || 0;

  const hasValidRange =
    numMin > 0 && numMax > numMin && numSpread > 0 && numSpread < numMax - numMin;

  const gridLevels = hasValidRange ? calcGridLevelCount(numMin, numMax, numSpread) : 0;

  const needInvestment = hasValidRange
    ? calcNeedInvestment({
        priceMin: numMin,
        priceMax: numMax,
        spread: numSpread,
        commission: numCommission,
        mode: config.mode,
        volumePerLevel: Number(config.volumePerLevel) || 0,
        valuePerLevel: Number(config.valuePerLevel) || 0,
      })
    : 0;

  const marketPrice = hasValidRange ? simulatedMarketPrice(numMin, numMax) : 0;
  const firstBuy = hasValidRange ? calcFirstBuyOrder(numMin, numMax, numSpread, marketPrice) : 0;
  const capital = Number(config.capital) || 0;
  const remainingCash = capital > 0 && needInvestment > 0 ? capital - needInvestment : null;

  const profitPerGridPct =
    hasValidRange && numSpread > 0 && numMin > 0
      ? (numSpread / numMin) * 100 - numCommission * 2
      : 0;

  const backtest = hasValidRange
    ? calcBacktest({
        priceMin: numMin,
        priceMax: numMax,
        spread: numSpread,
        commission: numCommission,
        mode: config.mode,
      })
    : null;

  const capitalWarning = needInvestment > 0 && capital > 0 && capital < needInvestment;
  const canSubmit = valid && consent;

  function set<K extends keyof FarmConfig>(key: K, value: FarmConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitted(true);
    if (!canSubmit) return;
    onSubmit(createMockFarm(config, `farm-${Date.now()}`, marketPrice));
  }

  return (
    <>
      <NavSubHeader title="สร้างฟาร์มใหม่" onBack={onCancel} />

      <PageContainer className="py-6 max-w-[1200px]">
        <div className="two-col">
          {/* LEFT — form */}
          <div className="col-left flex flex-col gap-4">
            <Card size="desktop">
              <Input
                label="หุ้น (Ticker)"
                placeholder="เช่น PTT, AOT"
                value={config.ticker}
                onChange={(v) => set("ticker", v.toUpperCase())}
                forceState={submitted && errors.ticker ? "error" : "default"}
                errorMessage={errors.ticker}
              />
            </Card>

            <Card size="desktop">
              <div className="flex flex-col gap-4">
                <SectionTitle number={1} title="Price Range" />
                <div className="form-row">
                  <div className="flex-1">
                    <Input
                      label="ราคาต่ำสุด"
                      placeholder="0.00"
                      type="number"
                      unit="฿"
                      value={config.priceMin === "" ? "" : String(config.priceMin)}
                      onChange={(v) => set("priceMin", v === "" ? "" : Number(v))}
                      forceState={submitted && errors.priceMin ? "error" : "default"}
                      errorMessage={errors.priceMin}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="ราคาสูงสุด"
                      placeholder="0.00"
                      type="number"
                      unit="฿"
                      value={config.priceMax === "" ? "" : String(config.priceMax)}
                      onChange={(v) => set("priceMax", v === "" ? "" : Number(v))}
                      forceState={submitted && errors.priceMax ? "error" : "default"}
                      errorMessage={errors.priceMax}
                    />
                  </div>
                </div>
                {hasValidRange && (
                  <div className="flex justify-between items-center">
                    <span className="type-body-2 text-muted-foreground">จำนวน Grid</span>
                    <Tag text={`${gridLevels} ระดับ`} variant="blue" size="small" />
                  </div>
                )}
              </div>
            </Card>

            <Card size="desktop">
              <div className="flex flex-col gap-4">
                <SectionTitle number={2} title="Grid Settings" />
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="type-subtitle-1 text-foreground">Profit Spread (บาท)</span>
                    <InfoTooltip content="ส่วนต่างกำไรต่อรอบ — ยิ่งน้อย ระบบจบเร็วแต่กำไรต่อรอบน้อยลง" />
                  </div>
                  <Input
                    placeholder="0.00"
                    type="number"
                    unit="฿"
                    value={config.spread === "" ? "" : String(config.spread)}
                    onChange={(v) => set("spread", v === "" ? "" : Number(v))}
                    forceState={submitted && errors.spread ? "error" : "default"}
                    errorMessage={errors.spread}
                  />
                </div>

                {hasValidRange && profitPerGridPct > 0 && (
                  <Alert
                    status="success"
                    message={`Profit/Grid (หักค่าคอม): +${formatNumber(profitPerGridPct, 2)}%`}
                  />
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span className="type-subtitle-1 text-foreground">ต่อระดับราคา</span>
                    <InfoTooltip
                      content={
                        config.mode === "volume"
                          ? "ซื้อขายด้วยจำนวนหุ้นที่เท่ากันในทุกระดับ — คุมปริมาณหุ้นได้แม่นยำ"
                          : "ซื้อขายด้วยจำนวนเงินที่เท่ากันในทุกระดับ — ราคาถูกได้หุ้นมาก ราคาสูงได้หุ้นน้อย"
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      label="Volume (หุ้น)"
                      selected={config.mode === "volume"}
                      onClick={() => set("mode", "volume")}
                    />
                    <Chip
                      label="Value (บาท)"
                      selected={config.mode === "value"}
                      onClick={() => set("mode", "value")}
                    />
                  </div>
                </div>

                {config.mode === "volume" ? (
                  <Input
                    label="จำนวนหุ้นต่อระดับ"
                    placeholder="100"
                    type="number"
                    unit="หุ้น"
                    value={config.volumePerLevel === "" ? "" : String(config.volumePerLevel)}
                    onChange={(v) => set("volumePerLevel", v === "" ? "" : Number(v))}
                    forceState={submitted && errors.volumePerLevel ? "error" : "default"}
                    errorMessage={errors.volumePerLevel}
                  />
                ) : (
                  <Input
                    label="จำนวนเงินต่อระดับ"
                    placeholder="10000"
                    type="number"
                    unit="฿"
                    value={config.valuePerLevel === "" ? "" : String(config.valuePerLevel)}
                    onChange={(v) => set("valuePerLevel", v === "" ? "" : Number(v))}
                    forceState={submitted && errors.valuePerLevel ? "error" : "default"}
                    errorMessage={errors.valuePerLevel}
                  />
                )}
              </div>
            </Card>

            <Card size="desktop">
              <div className="flex flex-col gap-4">
                <SectionTitle number={3} title="Investment" />
                <Input
                  label="เงินลงทุนตั้งต้น"
                  placeholder="500000"
                  type="number"
                  unit="฿"
                  value={config.capital === "" ? "" : String(config.capital)}
                  onChange={(v) => set("capital", v === "" ? "" : Number(v))}
                />

                {needInvestment > 0 && (
                  <div className="flex flex-col gap-2 rounded-lg border border-border p-3 bg-default-secondary">
                    <SummaryRow label="ต้องการทั้งหมด" value={formatCurrency(needInvestment)} />
                    {capital > 0 && (
                      <SummaryRow
                        label="เงินสดคงเหลือ"
                        value={formatCurrency(remainingCash ?? 0)}
                        highlight={remainingCash !== null && remainingCash < 0 ? "red" : "green"}
                      />
                    )}
                  </div>
                )}

                {capitalWarning && (
                  <Alert
                    status="critical"
                    message="เงินลงทุนต่ำกว่าที่ต้องการ — อาจมีความเสี่ยงสูง กรุณาเพิ่มเงินหรือปรับ Config"
                  />
                )}

                <div className="border border-border rounded-lg overflow-hidden">
                  <ListItem
                    label="Advanced (Optional)"
                    trailing={
                      showAdvanced ? (
                        <CaretUp weight="regular" />
                      ) : (
                        <CaretDown weight="regular" />
                      )
                    }
                    onClick={() => setShowAdvanced((v) => !v)}
                    className={showAdvanced ? undefined : "border-b-0"}
                  />
                  {showAdvanced && (
                    <div className="flex flex-col gap-3 p-4">
                      <Input
                        label="Commission (%)"
                        type="number"
                        unit="%"
                        value={config.commission === "" ? "" : String(config.commission)}
                        onChange={(v) => set("commission", v === "" ? "" : Number(v))}
                        forceState={submitted && errors.commission ? "error" : "default"}
                        errorMessage={errors.commission}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT — summary */}
          <div className="col-right flex flex-col gap-4">
            <Card size="desktop">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="type-caption-bold text-muted-foreground">
                    {config.ticker || "STOCK"} · กราฟ + Grid Levels
                  </p>
                  {config.ticker && <Tag text="Spot Grid" variant="gray" size="small" />}
                </div>
                {marketPrice > 0 && (
                  <p className="type-body-2 text-foreground font-semibold">
                    ฿{formatNumber(marketPrice)}{" "}
                    <span className="text-muted-foreground font-normal">(ราคาตลาด est.)</span>
                  </p>
                )}
                <CandlestickChart
                  ticker={config.ticker || "STOCK"}
                  priceMin={numMin}
                  priceMax={numMax}
                  spread={numSpread}
                  marketPrice={marketPrice}
                />
                <div className="flex gap-4 type-caption text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 border-t-2 border-dashed border-primary-action" />
                    ซื้อ
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block w-3 border-t-2 border-dashed border-warning"
                    />
                    ขาย
                  </span>
                </div>
              </div>
            </Card>

            {hasValidRange && (
              <Card size="desktop">
                <div className="flex flex-col gap-3">
                  <p className="type-caption-bold text-muted-foreground">Details</p>
                  <div className="flex flex-col gap-2">
                    <DetailRow
                      label="Price Range"
                      value={`฿${formatNumber(numMin)} – ฿${formatNumber(numMax)}`}
                    />
                    <DetailRow label="จำนวน Grid" value={`${gridLevels} ระดับ`} />
                    <DetailRow
                      label="Mode"
                      value={config.mode === "volume" ? "Volume" : "Value"}
                    />
                    {profitPerGridPct > 0 && (
                      <DetailRow
                        label="Profit/Grid (est.)"
                        value={`+${formatNumber(profitPerGridPct, 2)}%`}
                        highlight="green"
                      />
                    )}
                    {firstBuy > 0 && (
                      <DetailRow label="คำสั่งซื้อแรก (est.)" value={formatCurrency(firstBuy)} />
                    )}
                  </div>

                  {backtest && (
                    <div className="pt-3 border-t border-divider flex flex-col gap-2">
                      <p className="type-caption text-muted-foreground">Backtest (จำลอง)</p>
                      <div className="grid grid-cols-3 gap-2">
                        <BacktestStat
                          label="Farm Return"
                          value={`${formatNumber(backtest.farmReturn, 1)}%`}
                          positive={backtest.farmReturn > 0}
                        />
                        <BacktestStat
                          label="Buy & Hold"
                          value={`${formatNumber(backtest.benchmark, 1)}%`}
                          positive={backtest.benchmark > 0}
                        />
                        <BacktestStat label="Turnover/เดือน" value={`${backtest.turnover}x`} />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Card size="desktop">
              <div className="flex flex-col gap-4">
                <Checkbox
                  checked={consent}
                  onChange={setConsent}
                  label="ข้าพเจ้ารับทราบและยอมรับความเสี่ยงจากการลงทุนในระบบ Grid Farming และเข้าใจว่าผลตอบแทนในอดีตไม่ได้เป็นการรับประกันผลตอบแทนในอนาคต"
                />
                <Button
                  variant={canSubmit ? "primary" : "disabled"}
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  เริ่มฟาร์ม
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  );
}

function SectionTitle({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 h-6 rounded-full bg-primary-action text-on-primary-action text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </span>
      <span className="type-subtitle-1 text-foreground">{title}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "red" | "green";
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="type-caption text-muted-foreground">{label}</span>
      <span
        className={`type-body-2 font-medium ${
          highlight === "red" ? "pl-negative" : highlight === "green" ? "pl-positive" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "green" | "red";
}) {
  return (
    <div className="flex justify-between items-center border-b border-divider pb-1.5">
      <span className="type-body-2 text-muted-foreground">{label}</span>
      <span
        className={`type-body-2 font-medium ${
          highlight === "green" ? "pl-positive" : highlight === "red" ? "pl-negative" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function BacktestStat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 bg-default-secondary rounded p-2 text-center">
      <span className="type-caption text-muted-foreground">{label}</span>
      <span
        className={`type-subtitle-1 ${
          positive === true ? "pl-positive" : positive === false ? "pl-negative" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
