import { useState } from "react";
import {
  NavHeader,
  NavHeaderIconButton,
  NavHeaderAvatarSlot,
  YSinvestLogo,
  Avatar,
  PageContainer,
  NavBottom,
  YSINVEST_NAV_BOTTOM_ITEMS_TH,
  type NavBottomTabId,
} from "@sarunyu/system-one";
import { MagnifyingGlass, ChatCircle } from "@phosphor-icons/react";
import type { AppView, Farm } from "./types";
import AssetMenuPage from "./components/AssetMenuPage";
import FarmingMainPage from "./components/FarmingMainPage";
import NewFarmForm from "./components/NewFarmForm";
import FarmDetail from "./components/FarmDetail";

const DEMO_FARMS: Farm[] = [
  {
    id: "farm-demo-001",
    ticker: "PTT",
    status: "active",
    priceMin: 30,
    priceMax: 50,
    spread: 2,
    commission: 0.15,
    mode: "volume",
    volumePerLevel: 100,
    valuePerLevel: 0,
    capital: 55000,
    marketPrice: 42,
    shares: 800,
    cash: 25000,
    costPerShare: 30,
    plToday: 640,
    plTotal: 3600,
    sharesForSale: 200,
    sharesBidding: 100,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: "farm-demo-002",
    ticker: "AOT",
    status: "active",
    priceMin: 55,
    priceMax: 75,
    spread: 3,
    commission: 0.15,
    mode: "value",
    volumePerLevel: 0,
    valuePerLevel: 15000,
    capital: 80000,
    marketPrice: 51,
    shares: 600,
    cash: 24000,
    costPerShare: 62,
    plToday: -450,
    plTotal: -2100,
    sharesForSale: 0,
    sharesBidding: 300,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

type NavId = "portfolio" | "farming" | "history" | "settings";

const NAV_ITEMS: { id: NavId; label: string }[] = [
  { id: "portfolio", label: "พอร์ตฟอลิโอ" },
  { id: "farming", label: "Farming" },
  { id: "history", label: "ประวัติ" },
  { id: "settings", label: "ตั้งค่า" },
];

const BOTTOM_TAB_TO_NAV: Partial<Record<NavBottomTabId, NavId>> = {
  home: "portfolio",
  feed: "history",
  markets: "farming",
  wallet: "settings",
};

const NAV_TO_BOTTOM_TAB: Record<NavId, NavBottomTabId> = {
  portfolio: "home",
  farming: "asset",
  history: "feed",
  settings: "wallet",
};

export default function App() {
  const [activeNav, setActiveNav] = useState<NavId>("farming");
  const [bottomTab, setBottomTab] = useState<NavBottomTabId>("asset");
  const [view, setView] = useState<AppView>("asset-menu");
  const [farms, setFarms] = useState<Farm[]>(DEMO_FARMS);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) ?? null;
  const showBottomNav = view === "asset-menu" || view === "farming";

  function enterGridFarming() {
    setActiveNav("farming");
    setBottomTab("asset");
    setView("farming");
    setSelectedFarmId(null);
  }

  function setNav(id: NavId) {
    setActiveNav(id);
    setBottomTab(NAV_TO_BOTTOM_TAB[id]);
    setSelectedFarmId(null);
    if (id === "farming") {
      setView("farming");
    } else {
      setView("asset-menu");
    }
  }

  function handleBottomNavChange(tab: NavBottomTabId) {
    setBottomTab(tab);
    setSelectedFarmId(null);

    if (tab === "asset") {
      setActiveNav("farming");
      setView("asset-menu");
      return;
    }

    setActiveNav(BOTTOM_TAB_TO_NAV[tab] ?? "portfolio");
    setView("asset-menu");
  }

  function handleAddFarm(farm: Farm) {
    setFarms((prev) => [...prev, farm]);
    setSelectedFarmId(farm.id);
    setActiveNav("farming");
    setBottomTab("asset");
    setView("farm-detail");
  }

  function handleUpdateFarm(updated: Farm) {
    setFarms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }

  function handleCloseFarm(id: string) {
    setFarms((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "closed" } : f))
    );
    setSelectedFarmId(null);
    setView("farming");
  }

  function handleSelectFarm(id: string) {
    setSelectedFarmId(id);
    setView("farm-detail");
  }

  const mainPadding = showBottomNav ? "pb-28 md:pb-8" : "";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavHeader
        logo={<YSinvestLogo />}
        items={NAV_ITEMS.map((item) => ({
          label: item.label,
          active: activeNav === item.id,
          onClick: () => setNav(item.id),
        }))}
        rightSlot={
          <>
            <NavHeaderIconButton aria-label="ค้นหา">
              <MagnifyingGlass weight="regular" />
            </NavHeaderIconButton>
            <NavHeaderIconButton aria-label="แชท">
              <ChatCircle weight="regular" />
            </NavHeaderIconButton>
            <NavHeaderAvatarSlot>
              <Avatar type="text" initials="SY" size="m" status />
            </NavHeaderAvatarSlot>
          </>
        }
      />

      {view === "asset-menu" && (
        <PageContainer as="main" className={`flex-1 py-8 ${mainPadding}`}>
          <AssetMenuPage onOpenGridFarming={enterGridFarming} />
        </PageContainer>
      )}

      {view === "farming" && (
        <PageContainer as="main" className={`flex-1 py-8 ${mainPadding}`}>
          <FarmingMainPage
            farms={farms}
            selectedFarmId={selectedFarmId}
            onSelectFarm={handleSelectFarm}
            onAddFarm={() => setView("new-farm")}
          />
        </PageContainer>
      )}

      {view === "new-farm" && (
        <NewFarmForm
          onCancel={() => setView("farming")}
          onSubmit={handleAddFarm}
        />
      )}

      {view === "farm-detail" && selectedFarm && (
        <FarmDetail
          farm={selectedFarm}
          onBack={() => setView("farming")}
          onUpdate={handleUpdateFarm}
          onClose={handleCloseFarm}
        />
      )}

      {showBottomNav && (
        <NavBottom
          value={bottomTab}
          onValueChange={handleBottomNavChange}
          items={YSINVEST_NAV_BOTTOM_ITEMS_TH}
          className="md:hidden"
        />
      )}
    </div>
  );
}
