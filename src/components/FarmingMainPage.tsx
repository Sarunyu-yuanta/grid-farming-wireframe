import { Button, Card, StatusTag, Tag } from "@sarunyu/system-one";
import { Plant, Plus, Clock, Info, EyeSlash, ArrowLeft } from "@phosphor-icons/react";
import type { Farm } from "../types";
import { calcPL, calcMarketValue, formatCurrency, formatNumber } from "../utils";

// Figma asset – valid 7 days (fetched 2026-06-25)
const FIGMA_MENU_ICON = "https://www.figma.com/api/mcp/asset/59e9600e-b49b-4ede-874a-a90ee00fbf2f";

interface Props {
  farms: Farm[];
  selectedFarmId: string | null;
  onSelectFarm: (id: string) => void;
  onAddFarm: () => void;
  onBack: () => void;
}

export default function FarmingMainPage({
  farms,
  selectedFarmId,
  onSelectFarm,
  onAddFarm,
  onBack,
}: Props) {
  const activeFarms = farms.filter((f) => f.status === "active");
  const closedFarms = farms.filter((f) => f.status === "closed");

  const totalPL = farms.reduce((sum, f) => sum + calcPL(f), 0);
  const totalPLPositive = totalPL >= 0;
  const totalCapital = farms.reduce((sum, f) => sum + f.capital, 0);
  const totalPortfolioValue = farms.reduce(
    (sum, f) => sum + calcMarketValue(f) + f.cash,
    0
  );
  const totalPLPct = totalCapital > 0 ? (totalPL / totalCapital) * 100 : 0;

  return (
    /* Figma 16:9442 – max-w 996px centred within PageContainer's 80px side padding, gap-[8px] */
    <div className="flex flex-col w-full farming-page-root" style={{ maxWidth: "996px", margin: "0 auto", gap: "8px" }}>

      {/* ── Sub-header – desktop only ── */}
      <div className="hidden md:flex items-center shrink-0 w-full" style={{ height: "44px", gap: "8px", padding: "6px 0" }}>
        <Button variant="plain" size="icon-sm" aria-label="กลับ" onClick={onBack}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="flex-1 min-w-0 overflow-hidden truncate" style={{ fontSize: "18px", fontWeight: 700, lineHeight: "28px", color: "#101828" }}>
          สร้างการเติบโตของเงินทุน
        </h1>
        <Button variant="plain-black" size="md" leftIcon={<Info size={20} weight="regular" />}>
          รายละเอียดแผนการลงทุน
        </Button>
      </div>

      {/* ── Container card – Figma 16:9444: rounded-[12px] overflow-clip ── */}
      <div className="farming-main-card overflow-hidden shrink-0 w-full">

        {/* ── Robo / Farm header – Figma 16:9445 ── */}
        {/* border-b rgba(0,0,0,0.1) wraps the teal section */}
        <div style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>

          {/* Teal wrap – Figma I16:9445;31761:227945
              gap-[12px] pb-[16px] pt-[14px] px-[16px]
              border-b rgba(0,0,0,0.2) */}
          <div
            className="relative flex flex-col items-center justify-center overflow-hidden"
            style={{
              gap: "12px",
              paddingTop: "14px",
              paddingBottom: "16px",
              paddingLeft: "16px",
              paddingRight: "16px",
              borderBottom: "1px solid rgba(0,0,0,0.2)",
              backgroundImage: "url('/assets/portfolio-menu/robo-header.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Text wrap – Figma I16:9445;31761:227953: w-[524px] gap-[12px] */}
            <div
              className="relative z-10 flex flex-col items-start w-full"
              style={{ maxWidth: "524px", gap: "12px" }}
            >
              {/* Account row – "พอร์ต Grid Farming" + tag */}
              <div className="flex items-center w-full" style={{ gap: "4px" }}>
                <span style={{ color: "white", fontSize: "12px", lineHeight: "16px", whiteSpace: "nowrap" }}>
                  พอร์ต Grid Farming
                </span>
                <div
                  className="flex items-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.1)", borderRadius: "999px", padding: "2px 4px", gap: "2px" }}
                >
                  <span style={{ color: "white", fontSize: "9px", lineHeight: "14px" }}>
                    {activeFarms.length} ฟาร์มกำลังทำงาน
                  </span>
                  <EyeSlash size={12} color="white" />
                </div>
              </div>

              {/* Info Card – Figma I16:9445;31761:227954: rounded-[8px] overflow-clip */}
              <div className="flex flex-col items-center overflow-hidden w-full" style={{ borderRadius: "8px" }}>

                {/* Total section – Figma I16:9445;31761:227955
                    bg-white border-b rgba(0,0,0,0.2) gap-[4px] py-[8px] */}
                <div
                  className="flex flex-col items-center w-full"
                  style={{
                    background: "white",
                    borderBottom: "1px solid rgba(0,0,0,0.2)",
                    gap: "4px",
                    paddingTop: "8px",
                    paddingBottom: "8px",
                  }}
                >
                  {/* Label row – Figma I16:9445;31761:227956: gap-[4px] */}
                  <div className="flex items-center justify-center" style={{ gap: "4px" }}>
                    <span style={{ fontSize: "12px", lineHeight: "16px", color: "#6a7282", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      มูลค่าสุทธิ (THB)
                    </span>
                    {/* info icon – Figma I16:9445;31761:227958: size-[16px] */}
                    <span className="overflow-hidden shrink-0" style={{ width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Info size={14} color="#6a7282" />
                    </span>
                  </div>

                  {/* Value section – Figma I16:9445;31761:227959: gap-[4px] */}
                  <div className="flex flex-col items-center justify-center" style={{ gap: "4px" }}>

                    {/* Main value row – Figma I16:9445;31761:227960: gap-[4px] */}
                    <div className="flex items-center justify-center" style={{ gap: "4px" }}>
                      {/* Menu/icon badge – Figma I16:9445;31761:227961:
                          size-[32px] rounded-[125px] border rgba(0,0,0,0.1) p-[5px] bg-white */}
                      <div
                        className="flex items-center justify-center overflow-hidden shrink-0 relative"
                        style={{
                          width: "32px", height: "32px",
                          borderRadius: "125px",
                          border: "1px solid rgba(0,0,0,0.1)",
                          padding: "5px",
                          background: "white",
                        }}
                      >
                        <img
                          alt=""
                          src={FIGMA_MENU_ICON}
                          style={{ position: "absolute", left: "-2.3%", width: "107.91%", height: "107.91%", top: "-7.48%", pointerEvents: "none" }}
                        />
                      </div>
                      {/* H4 value – Figma I16:9445;31761:227963:
                          font-size 24px font-bold leading-[36px] color #101828 */}
                      <span style={{ fontSize: "24px", fontWeight: 700, lineHeight: "36px", color: "#101828", whiteSpace: "nowrap" }}>
                        {formatCurrency(totalPortfolioValue)}
                      </span>
                    </div>

                    {/* P/L row – Figma I16:9445;31761:227964: gap-[4px] justify-end */}
                    <div className="flex items-center justify-end" style={{ gap: "4px" }}>
                      {/* Subtitle-2 P/L – color #4a5565 (secondary) but we override with pl-positive/negative */}
                      <span
                        className={totalPLPositive ? "pl-positive" : "pl-negative"}
                        style={{ fontSize: "14px", fontWeight: 700, lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {totalPLPositive ? "+" : ""}{formatCurrency(totalPL)}
                      </span>
                      {/* Percent badge – Figma I16:9445;31761:227966:
                          bg-[#f3f4f6] px-[4px] py-[2px] rounded-[4px] */}
                      <div
                        className="flex flex-col items-start justify-center overflow-hidden shrink-0"
                        style={{ background: "#f3f4f6", padding: "2px 4px", borderRadius: "4px" }}
                      >
                        <span style={{ fontSize: "9px", lineHeight: "14px", color: "#4a5565", whiteSpace: "nowrap" }}>
                          {totalPLPositive ? "+" : ""}{formatNumber(totalPLPct, 2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamp / stats – Figma I16:9445;31761:227968: gap-[4px] caption white */}
              <div
                className="flex items-center justify-center w-full"
                style={{ gap: "4px", color: "white", fontSize: "12px", lineHeight: "16px", whiteSpace: "nowrap" }}
              >
                <span>ฟาร์มทั้งหมด {farms.length}</span>
                <span style={{ opacity: 0.6 }}>·</span>
                <span>เงินลงทุนรวม {formatCurrency(totalCapital)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── White body – Figma 16:9446:
            bg-white px-[56px] py-[24px] gap-[16px] ── */}
        <div
          className="farming-white-body flex flex-col w-full"
          style={{ background: "white", gap: "16px" }}
        >
          {farms.length === 0 ? (
            <EmptyState onAddFarm={onAddFarm} />
          ) : (
            <>
              {activeFarms.length > 0 && (
                <FarmSection
                  title={`กำลังทำงาน (${activeFarms.length})`}
                  farms={activeFarms}
                  selectedFarmId={selectedFarmId}
                  onSelectFarm={onSelectFarm}
                  onAddFarm={onAddFarm}
                />
              )}
              {closedFarms.length > 0 && (
                <FarmSection
                  title={`ปิดแล้ว (${closedFarms.length})`}
                  farms={closedFarms}
                  selectedFarmId={selectedFarmId}
                  onSelectFarm={onSelectFarm}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FarmSection({
  title,
  farms,
  selectedFarmId,
  onSelectFarm,
  onAddFarm,
}: {
  title: string;
  farms: Farm[];
  selectedFarmId: string | null;
  onSelectFarm: (id: string) => void;
  onAddFarm?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between w-full">
        <h2 className="type-subtitle-1 text-foreground">{title}</h2>
        {onAddFarm && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} weight="bold" />}
            onClick={onAddFarm}
          >
            เริ่มฟาร์ม
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {farms.map((farm) => (
          <FarmCard
            key={farm.id}
            farm={farm}
            selected={farm.id === selectedFarmId}
            onClick={() => onSelectFarm(farm.id)}
          />
        ))}
      </div>
    </div>
  );
}

function FarmCard({
  farm,
  onClick,
}: {
  farm: Farm;
  selected: boolean;
  onClick: () => void;
}) {
  const pl = calcPL(farm);
  const plPct = farm.capital > 0 ? (pl / farm.capital) * 100 : 0;
  const plPositive = pl >= 0;
  const outOfRange =
    farm.marketPrice < farm.priceMin || farm.marketPrice > farm.priceMax;
  const inRange = !outOfRange;

  const rangeSize = farm.priceMax - farm.priceMin;
  const pricePosition =
    rangeSize > 0
      ? Math.max(0, Math.min(1, (farm.marketPrice - farm.priceMin) / rangeSize))
      : 0;

  const runtimeDays = Math.floor(
    (Date.now() - farm.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusType =
    outOfRange && farm.status === "active"
      ? "hold"
      : farm.status === "active"
        ? "success"
        : "stop";

  const statusText =
    outOfRange && farm.status === "active"
      ? "นอกช่วงราคา"
      : farm.status === "active"
        ? "กำลังทำงาน"
        : "ปิดแล้ว";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
    >
      <Card size="desktop" className="farm-card">
        <div className="flex flex-col gap-3">
          {/* Top row: ticker + status / PnL% + market price */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="type-h6 text-foreground">{farm.ticker}</span>
                <Tag text="Spot Grid" variant="gray" size="small" />
              </div>
              <StatusTag type={statusType} text={statusText} />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Tag
                text={`${plPositive ? "▲" : "▼"} ${plPositive ? "+" : ""}${formatNumber(plPct, 2)}%`}
                variant={plPositive ? "green" : "red"}
                size="small"
              />
              <span className="type-caption text-muted-foreground">
                ฿{formatNumber(farm.marketPrice)}
              </span>
            </div>
          </div>

          {/* P/L absolute */}
          <div className="flex flex-col gap-0.5">
            <span className="type-caption text-muted-foreground">กำไร/ขาดทุน</span>
            <span className={`type-subtitle-1 font-bold ${plPositive ? "pl-positive" : "pl-negative"}`}>
              {plPositive ? "+" : ""}{formatCurrency(pl)}
            </span>
          </div>

          {/* Mini grid range bar */}
          <div className="flex flex-col gap-1">
            <div className="grid-range-bar relative h-1 rounded-full overflow-visible">
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 rounded-full ${inRange ? "bg-primary-action" : "bg-destructive"}`}
                style={{ left: `calc(${pricePosition * 100}% - 1px)` }}
              />
            </div>
            <div className="flex justify-between type-caption text-muted-foreground">
              <span>฿{formatNumber(farm.priceMin)}</span>
              <span>฿{formatNumber(farm.priceMax)}</span>
            </div>
          </div>

          {/* Bottom: runtime + capital */}
          <div className="border-t border-divider pt-2.5 flex justify-between type-caption">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock size={12} />
              {runtimeDays === 0 ? "วันนี้" : `${runtimeDays} วัน`}
            </span>
            <span className="text-muted-foreground">{formatCurrency(farm.capital)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function EmptyState({ onAddFarm }: { onAddFarm: () => void }) {
  return (
    <Card size="desktop" className="py-12">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary-action-light flex items-center justify-center">
          <Plant size={32} className="text-primary-action" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center max-w-sm">
          <p className="type-h6 text-foreground">ยังไม่มีฟาร์ม</p>
          <p className="type-body-2 text-muted-foreground">
            เริ่มต้นสร้างฟาร์มแรกของคุณ ระบบจะวางคำสั่งซื้อ-ขายอัตโนมัติในช่วงราคาที่คุณกำหนด
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus size={16} weight="bold" />}
          onClick={onAddFarm}
        >
          เพิ่มฟาร์มแรก
        </Button>
      </div>
    </Card>
  );
}
