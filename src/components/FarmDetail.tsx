import { useState } from "react";
import { TabGroup, Alert, NavSubHeader, PageContainer, StatusTag } from "@sarunyu/system-one";
import type { Farm } from "../types";
import FarmOverview from "./FarmOverview";
import FarmModify from "./FarmModify";

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

      <PageContainer className="py-6 flex flex-col gap-6 max-w-[1200px]">
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
