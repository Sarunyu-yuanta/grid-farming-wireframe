import type { ReactNode } from "react";
import { Button, Card, StatusTag, Tag, Alert } from "@sarunyu/system-one";
import { Plant, Plus, Clock } from "@phosphor-icons/react";
import type { Farm } from "../types";
import { calcPL, formatCurrency, formatNumber } from "../utils";

interface Props {
  farms: Farm[];
  selectedFarmId: string | null;
  onSelectFarm: (id: string) => void;
  onAddFarm: () => void;
}

export default function FarmingMainPage({
  farms,
  selectedFarmId,
  onSelectFarm,
  onAddFarm,
}: Props) {
  const activeFarms = farms.filter((f) => f.status === "active");
  const closedFarms = farms.filter((f) => f.status === "closed");

  const totalPL = farms.reduce((sum, f) => sum + calcPL(f), 0);
  const totalCapital = farms.reduce((sum, f) => sum + f.capital, 0);

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="type-h4 text-foreground">Grid Farming</h1>
          <p className="type-body-2 text-muted-foreground">
            ระบบซื้อ-ขายหุ้นอัตโนมัติในช่วงราคาที่กำหนด
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus size={16} weight="bold" />}
          onClick={onAddFarm}
        >
          เพิ่มฟาร์ม
        </Button>
      </div>

      {farms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card size="desktop">
            <div className="flex flex-col gap-1">
              <span className="type-caption text-muted-foreground">ฟาร์มทั้งหมด</span>
              <span className="type-h5 text-foreground">{farms.length}</span>
              <span className="type-caption text-muted-foreground">
                กำลังทำงาน {activeFarms.length} · ปิดแล้ว {closedFarms.length}
              </span>
            </div>
          </Card>
          <Card size="desktop">
            <div className="flex flex-col gap-1">
              <span className="type-caption text-muted-foreground">เงินลงทุนรวม</span>
              <span className="type-h5 text-foreground">{formatCurrency(totalCapital)}</span>
            </div>
          </Card>
          <Card size="desktop">
            <div className="flex flex-col gap-1">
              <span className="type-caption text-muted-foreground">P/L รวม</span>
              <span
                className={`type-h5 font-bold ${totalPL >= 0 ? "pl-positive" : "pl-negative"}`}
              >
                {totalPL >= 0 ? "+" : ""}
                {formatCurrency(totalPL)}
              </span>
            </div>
          </Card>
        </div>
      )}

      {farms.length === 0 ? (
        <EmptyState onAddFarm={onAddFarm} />
      ) : (
        <div className="flex flex-col gap-8">
          {activeFarms.length > 0 && (
            <FarmSection
              title={`กำลังทำงาน (${activeFarms.length})`}
              farms={activeFarms}
              selectedFarmId={selectedFarmId}
              onSelectFarm={onSelectFarm}
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
        </div>
      )}
    </div>
  );
}

function FarmSection({
  title,
  farms,
  selectedFarmId,
  onSelectFarm,
}: {
  title: string;
  farms: Farm[];
  selectedFarmId: string | null;
  onSelectFarm: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="type-subtitle-1 text-foreground">{title}</h2>
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
  selected,
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
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-left w-full rounded-lg transition-shadow",
        selected ? "ring-2 ring-primary-action shadow-md" : "hover:shadow-sm",
      ].join(" ")}
    >
      <Card size="desktop">
        <div className="flex flex-col gap-4">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="type-h6 text-foreground">{farm.ticker}</span>
                <Tag text="Spot Grid" variant="gray" size="small" />
              </div>
              <StatusTag type={statusType} text={statusText} />
            </div>

            <Tag
              text={`${plPositive ? "+" : ""}${formatNumber(plPct, 2)}%`}
              variant={plPositive ? "green" : "red"}
              size="small"
              icon
            />
          </div>

          {/* P/L */}
          <div className="flex flex-col gap-0.5">
            <span className="type-caption text-muted-foreground">กำไร/ขาดทุน</span>
            <span
              className={`type-subtitle-1 font-bold ${
                plPositive ? "pl-positive" : "pl-negative"
              }`}
            >
              {plPositive ? "+" : ""}
              {formatCurrency(pl)}
            </span>
          </div>

          {/* Stats */}
          <div className="border-t border-divider pt-3 flex flex-col gap-2">
            <StatRow
              label="Price Range"
              value={`฿${formatNumber(farm.priceMin)} – ฿${formatNumber(farm.priceMax)}`}
            />
            <StatRow label="ทุนเริ่มต้น" value={formatCurrency(farm.capital)} />
            <StatRow
              label={
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Runtime
                </span>
              }
              value={runtimeDays === 0 ? "วันนี้" : `${runtimeDays} วัน`}
            />
          </div>

          {outOfRange && farm.status === "active" && (
            <Alert
              status="warning"
              message="ราคาออกนอก Grid Range"
            />
          )}
        </div>
      </Card>
    </button>
  );
}

function StatRow({
  label,
  value,
}: {
  label: ReactNode;
  value: string;
}) {
  return (
    <div className="flex justify-between type-caption">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
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
