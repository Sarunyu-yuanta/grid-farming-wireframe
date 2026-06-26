import { useState } from "react";
import {
  NavHeader,
  NavHeaderIconButton,
  NavHeaderAvatarSlot,
  NavSubHeader,
  YSinvestLogo,
  Avatar,
  PageContainer,
  NavBottom,
  YSINVEST_NAV_BOTTOM_ITEMS_TH,
  type NavBottomTabId,
} from "@sarunyu/system-one";
import { MagnifyingGlass, ChatCircle, Bell, Info } from "@phosphor-icons/react";
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

type NavId = "portfolio" | "feed" | "invest" | "farming" | "wallet";

const NAV_ITEMS: { id: NavId; label: string }[] = [
  { id: "portfolio", label: "หน้าหลัก" },
  { id: "feed",      label: "ฟีด" },
  { id: "invest",    label: "ลงทุน" },
  { id: "farming",   label: "สินทรัพย์" },
  { id: "wallet",    label: "วอลเล็ต" },
];

const BOTTOM_TAB_TO_NAV: Partial<Record<NavBottomTabId, NavId>> = {
  home: "portfolio",
  feed: "feed",
  markets: "invest",
  asset: "farming",
  wallet: "wallet",
};

const NAV_TO_BOTTOM_TAB: Record<NavId, NavBottomTabId> = {
  portfolio: "home",
  feed: "feed",
  invest: "markets",
  farming: "asset",
  wallet: "wallet",
};

export default function App() {
  const [activeNav, setActiveNav] = useState<NavId>("farming");
  const [bottomTab, setBottomTab] = useState<NavBottomTabId>("asset");
  const [view, setView] = useState<AppView>("asset-menu");
  const [farms, setFarms] = useState<Farm[]>(DEMO_FARMS);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId) ?? null;
  const showBottomNav = view === "asset-menu" || view === "farming" || view === "farm-detail";

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
    } else if (id === "invest") {
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
    setView("farming"); // close modal first
    setIsLoading(true);
    setTimeout(() => {
      setView("farm-detail");
      setIsLoading(false);
    }, 700);
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
    setIsLoading(true);
    setTimeout(() => {
      setView("farm-detail");
      setIsLoading(false);
    }, 600);
  }

  const mainPadding = showBottomNav ? "pb-28 md:pb-8" : "";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f9f9f9" }}>
      {/* Mobile: NavSubHeader on farming pages */}
      {(view === "farming" || view === "new-farm") && (
        <div className="block md:hidden">
          <NavSubHeader
            title="สร้างการเติบโตของเงินทุน"
            onBack={() => setView("asset-menu")}
            rightIcon={<Info size={20} weight="regular" />}
            rightIconAriaLabel="รายละเอียดแผนการลงทุน"
          />
        </div>
      )}

      {/* Mobile: NavSubHeader on farm-detail page */}
      {view === "farm-detail" && selectedFarm && (
        <div className="block md:hidden">
          <NavSubHeader
            title={selectedFarm.ticker}
            onBack={() => { setView("farming"); setSelectedFarmId(null); }}
            rightIcon={<Info size={20} weight="regular" />}
            rightIconAriaLabel="รายละเอียดแผนการลงทุน"
          />
        </div>
      )}

      {/* Desktop: always show NavHeader */}
      <div className={`hidden md:block`}>
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
              <NavHeaderIconButton aria-label="แจ้งเตือน">
                <Bell weight="regular" />
              </NavHeaderIconButton>
              <NavHeaderAvatarSlot>
                <Avatar type="text" initials="Y" size="m" status />
              </NavHeaderAvatarSlot>
            </>
          }
        />
      </div>

      {/* Mobile: NavHeader on non-farming/farm-detail pages */}
      {view !== "farming" && view !== "new-farm" && view !== "farm-detail" && (
        <div className="block md:hidden">
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
                <NavHeaderIconButton aria-label="แจ้งเตือน">
                  <Bell weight="regular" />
                </NavHeaderIconButton>
                <NavHeaderAvatarSlot>
                  <Avatar type="text" initials="Y" size="m" status />
                </NavHeaderAvatarSlot>
              </>
            }
          />
        </div>
      )}

      {view === "asset-menu" && (
        <PageContainer as="main" className={`flex-1 py-8 ${mainPadding}`}>
          <AssetMenuPage onOpenGridFarming={enterGridFarming} />
        </PageContainer>
      )}

      {(view === "farming" || view === "new-farm") && (
        <main
          className={`flex-1 farming-main ${mainPadding}`}
          style={{ paddingBottom: "32px", paddingLeft: 0, paddingRight: 0 }}
        >
          <FarmingMainPage
            farms={farms}
            selectedFarmId={selectedFarmId}
            onSelectFarm={handleSelectFarm}
            onAddFarm={() => setView("new-farm")}
            onBack={() => setView("asset-menu")}
          />
        </main>
      )}

      {view === "new-farm" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setView("farming")}
        >
          <div
            className="relative bg-background shadow-xl"
            style={{ width: "min(1100px, 95vw)", maxHeight: "92vh", borderRadius: "16px", overflowY: "auto", scrollbarWidth: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <NewFarmForm
              isModal
              onCancel={() => setView("farming")}
              onSubmit={handleAddFarm}
            />
          </div>
        </div>
      )}

      {view === "farm-detail" && selectedFarm && (
        <FarmDetail
          farm={selectedFarm}
          onBack={() => { setView("farming"); setSelectedFarmId(null); }}
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

      {isLoading && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-3"
          style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(2px)" }}
          role="status"
          aria-label="กำลังโหลด"
        >
          <div className="loading-spinner" />
          <span style={{ fontSize: "13px", color: "#5f5e5a" }}>กำลังโหลด...</span>
        </div>
      )}
    </div>
  );
}
