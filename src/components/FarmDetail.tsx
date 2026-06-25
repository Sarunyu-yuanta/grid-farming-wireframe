import { useState } from "react";
import { Alert, Button, TabGroup, Tag } from "@sarunyu/system-one";
import { ArrowLeft, Info } from "@phosphor-icons/react";
import type { Farm } from "../types";
import FarmOverview from "./FarmOverview";
import FarmModify from "./FarmModify";
import { calcPL, calcMarketValue, formatCurrency, formatNumber } from "../utils";

interface Props {
  farm: Farm;
  onBack: () => void;
  onUpdate: (farm: Farm) => void;
  onClose: (id: string) => void;
}

const TABS = [
  { id: "assets", label: "สินทรัพย์" },
  { id: "manage", label: "จัดการเงิน" },
];

export default function FarmDetail({ farm, onBack, onUpdate, onClose }: Props) {
  const [activeTab, setActiveTab] = useState("assets");

  const outOfRange = farm.marketPrice < farm.priceMin || farm.marketPrice > farm.priceMax;
  const pl         = calcPL(farm);
  const plPositive = pl >= 0;
  const plPct      = farm.capital > 0 ? (pl / farm.capital) * 100 : 0;
  const totalValue = calcMarketValue(farm) + farm.cash;
  const dateStr     = farm.createdAt.toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
  });
  const timeStr     = farm.createdAt.toLocaleTimeString("th-TH", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const lastUpdate  = `${dateStr} - ${timeStr}`;

  return (
    /* Figma 16:9441 – page bg #f9f9f9 */
    /* px-20 (80px) matches PageContainer side padding used by other views */
    <div className="flex-1 farm-detail-root" style={{ background: "#f9f9f9" }}>
      {/* Figma 16:9442 – max-w 996px centred within 80px side padding, gap-[8px] */}
      <div className="flex flex-col w-full" style={{ maxWidth: "996px", margin: "0 auto", gap: "8px" }}>

        {/* ── Sub-header – Figma 16:9443
            h-[44px] gap-[8px] py-[6px] ── */}
        <div className="hidden md:flex items-center shrink-0 w-full" style={{ height: "44px", gap: "8px", padding: "6px 0" }}>
          {/* Back button – Button variant="plain" size="icon-sm" (icon-only) */}
          <Button
            variant="plain"
            size="icon-sm"
            aria-label="กลับ"
            onClick={onBack}
          >
            <ArrowLeft size={18} />
          </Button>

          {/* Title – Figma I16:9443;13116:2416 */}
          <h1
            className="flex-1 min-w-0 overflow-hidden truncate"
            style={{ fontSize: "18px", fontWeight: 700, lineHeight: "28px", color: "#101828" }}
          >
            {farm.ticker} — Grid Farming
          </h1>

          {/* Info action – Button variant="plain-black" + leftIcon */}
          <Button
            variant="plain-black"
            size="md"
            leftIcon={<Info size={20} weight="regular" />}
          >
            รายละเอียดแผนการลงทุน
          </Button>
        </div>

        {/* ── Container card – Figma 16:9444:
            rounded-[12px] overflow-clip ── */}
        <div className="overflow-hidden shrink-0 w-full" style={{ borderRadius: "12px" }}>

          {/* ── Farm summary header – compact white, distinct from main list page ── */}
          <div
            className="flex flex-col w-full farm-detail-header-body"
            style={{ background: "white", borderBottom: "1px solid rgba(0,0,0,0.08)", gap: "16px" }}
          >
            {/* Row 1: ticker + tags + price */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center" style={{ gap: "8px" }}>
                <span style={{ fontSize: "22px", fontWeight: 700, color: "#101828" }}>{farm.ticker}</span>
                <Tag text="Spot Grid" variant="gray" size="small" />
              </div>
              <div className="flex flex-col items-end" style={{ gap: "2px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#101828" }}>
                  ฿{formatNumber(farm.marketPrice, 2)}
                </span>
                <div className="flex items-center" style={{ gap: "4px" }}>
                  <span
                    className={plPositive ? "pl-positive" : "pl-negative"}
                    style={{ fontSize: "13px", fontWeight: 700 }}
                  >
                    {plPositive ? "+" : ""}{formatCurrency(pl)}
                  </span>
                  <div style={{ background: "#f3f4f6", padding: "0 6px", borderRadius: "4px", height: "20px", display: "inline-flex", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "#4a5565", lineHeight: 1 }}>
                      {plPositive ? "+" : ""}{formatNumber(plPct, 2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: key metrics grid — 2 cols on mobile, 4 on desktop */}
            <div className="farm-detail-metrics-grid" style={{ gap: "8px" }}>
              {[
                { label: "มูลค่าสุทธิ (THB)", value: formatCurrency(totalValue) },
                { label: "กำไร/ขาดทุนรวม", value: formatCurrency(pl) },
                { label: "เงินลงทุน", value: formatCurrency(farm.capital) },
                { label: "เงินสด", value: formatCurrency(farm.cash) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center justify-center bg-[var(--fill-blue-50)]"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    gap: "2px",
                    borderRadius: "8px",
                    border: "1px solid rgba(10,110,231,0.12)",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#4a7bbf", whiteSpace: "nowrap" }}>{item.label}</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#101828" }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Row 3: timestamp */}
            <div className="flex items-center" style={{ gap: "4px", color: "#6a7282", fontSize: "11px" }}>
              <span>อัปเดตล่าสุด</span>
              <span>{lastUpdate}</span>
            </div>
          </div>

          {/* ── White content section – bg-white ── */}
          <div className="flex flex-col w-full" style={{ background: "white" }}>

            {/* Alert (out-of-range) – padded */}
            {outOfRange && (
              <div className="farm-detail-alert">
                <Alert
                  status="warning"
                  title="ราคาออกนอก Grid Range"
                  message={
                    farm.marketPrice > farm.priceMax
                      ? `ราคาปัจจุบัน ฿${farm.marketPrice} สูงกว่า Grid สูงสุด ฿${farm.priceMax} — ระบบหยุดวางคำสั่งซื้อชั่วคราว`
                      : `ราคาปัจจุบัน ฿${farm.marketPrice} ต่ำกว่า Grid ต่ำสุด ฿${farm.priceMin} — ระบบหยุดวางคำสั่งขายชั่วคราว`
                  }
                />
              </div>
            )}

            {/* Tab bar – library TabGroup, full width, no side padding */}
            <div className="farm-detail-tabs">
              <TabGroup
                items={TABS.map((t) => ({ id: t.id, title: t.label }))}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id)}
              />
            </div>

            {/* Tab content – padded */}
            <div className="farm-detail-content">
              {activeTab === "assets" && <FarmOverview farm={farm} />}


              {activeTab === "manage" && (
                <FarmModify
                  farm={farm}
                  onUpdate={(updated) => { onUpdate(updated); setActiveTab("assets"); }}
                  onClose={onClose}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
