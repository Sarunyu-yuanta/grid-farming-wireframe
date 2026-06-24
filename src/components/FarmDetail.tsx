import { useState } from "react";
import { TabGroup, Alert, NavSubHeader, PageContainer, StatusTag, Card, Tag } from "@sarunyu/system-one";
import type { Farm } from "../types";
import FarmOverview from "./FarmOverview";
import FarmModify from "./FarmModify";
import { calcPL, formatCurrency, formatNumber } from "../utils";

interface Props {
  farm: Farm;
  onBack: () => void;
  onUpdate: (farm: Farm) => void;
  onClose: (id: string) => void;
}

const TABS = [
  { id: "overview", title: "ภาพรวม" },
  { id: "config", title: "ปรับปรุงฟาร์ม" },
];

export default function FarmDetail({ farm, onBack, onUpdate, onClose }: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  const outOfRange =
    farm.marketPrice < farm.priceMin || farm.marketPrice > farm.priceMax;

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

  const pl = calcPL(farm);
  const plPositive = pl >= 0;
  const plPct = farm.capital > 0 ? (pl / farm.capital) * 100 : 0;

  const rangeSize = farm.priceMax - farm.priceMin;
  const pricePosition =
    rangeSize > 0
      ? Math.max(0, Math.min(1, (farm.marketPrice - farm.priceMin) / rangeSize))
      : 0;

  return (
    <>
      <NavSubHeader
        title={farm.ticker}
        onBack={onBack}
        rightSlot={
          <div className="flex items-center gap-2">
            <StatusTag type={statusType} text={statusText} />
            <span className="type-caption text-muted-foreground hidden sm:inline">
              #{farm.id.split("-")[1]?.slice(0, 6)}
            </span>
          </div>
        }
      />

      <PageContainer className="py-6 flex flex-col gap-4 max-w-[1200px]">
        {outOfRange && (
          <Alert
            status="warning"
            title="ราคาออกนอก Grid Range"
            message={
              farm.marketPrice > farm.priceMax
                ? `ราคาปัจจุบัน ฿${farm.marketPrice} สูงกว่า Grid สูงสุด ฿${farm.priceMax} — ระบบหยุดวางคำสั่งซื้อชั่วคราว`
                : `ราคาปัจจุบัน ฿${farm.marketPrice} ต่ำกว่า Grid ต่ำสุด ฿${farm.priceMin} — ระบบหยุดวางคำสั่งขายชั่วคราว`
            }
          />
        )}

        {/* Price hero */}
        <Card size="desktop">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex flex-col gap-1">
                <span className="type-caption text-muted-foreground">
                  ราคาตลาด ({farm.ticker})
                </span>
                <span className="type-h4 text-foreground font-bold">
                  ฿{formatNumber(farm.marketPrice)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="type-caption text-muted-foreground">
                  กำไร / ขาดทุน รวม
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`type-h5 font-bold ${plPositive ? "pl-positive" : "pl-negative"}`}
                  >
                    {plPositive ? "+" : ""}
                    {formatCurrency(pl)}
                  </span>
                  <Tag
                    text={`${plPositive ? "▲" : "▼"} ${plPositive ? "+" : ""}${formatNumber(plPct, 2)}%`}
                    variant={plPositive ? "green" : "red"}
                    size="small"
                  />
                </div>
              </div>
            </div>

            {/* Grid range bar */}
            <div className="flex flex-col gap-1.5">
              <div className="grid-range-bar relative h-1 rounded-full overflow-visible">
                <div
                  className={`absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full ${!outOfRange ? "bg-primary-action" : "bg-destructive"}`}
                  style={{ left: `calc(${pricePosition * 100}% - 1px)` }}
                />
              </div>
              <div className="flex justify-between type-caption text-muted-foreground">
                <span>฿{formatNumber(farm.priceMin)}</span>
                <span className={!outOfRange ? "" : "text-destructive"}>฿{formatNumber(farm.marketPrice)}</span>
                <span>฿{formatNumber(farm.priceMax)}</span>
              </div>
            </div>
          </div>
        </Card>

        <TabGroup items={TABS} activeId={activeTab} onChange={setActiveTab} />

        {activeTab === "overview" && <FarmOverview farm={farm} />}
        {activeTab === "config" && (
          <FarmModify
            farm={farm}
            onUpdate={(updated) => {
              onUpdate(updated);
              setActiveTab("overview");
            }}
            onClose={onClose}
          />
        )}
      </PageContainer>
    </>
  );
}
