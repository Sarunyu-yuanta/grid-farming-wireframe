import { ArrowRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";

const CARD_CLASS =
  "service-menu-card cursor-pointer w-full text-left relative overflow-hidden rounded-lg p-4 min-h-32 flex flex-col gap-2";

interface Props {
  title: string;
  description: ReactNode;
  gradient: string;
  illustration?: ReactNode;
  onClick?: () => void;
  className?: string;
}

function ServiceMenuCard({
  title,
  description,
  gradient,
  illustration,
  onClick,
  className = "",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${CARD_CLASS} ${gradient} ${className}`.trim()}
    >
      <div className="flex flex-col gap-2 relative z-10 w-full">
        <div className="flex items-center justify-between gap-2 w-full">
          <span className="type-subtitle-1 text-foreground font-bold">{title}</span>
          <ArrowRight size={24} className="text-primary-action shrink-0" />
        </div>
        <div className="type-body-2 text-muted-foreground" style={{ maxWidth: "68%" }}>{description}</div>
      </div>
      {illustration}
    </button>
  );
}

function RoboIllustration() {
  return (
    <img
      src="/assets/portfolio-menu/robo-illustration.png"
      alt=""
      aria-hidden
      className="absolute pointer-events-none"
      style={{ width: 92, height: 129, right: 16, top: 24 }}
    />
  );
}

function DefinitIllustration() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* Large Definit badge — n2 pos=(229,6) size=106×106 */}
      <img
        src="/assets/portfolio-menu/definit-badge-circle.png"
        alt=""
        className="absolute rounded-full object-cover"
        style={{ width: 106, height: 106, right: 8, top: 6 }}
      />
      {/* Small Definit badge — n4 pos=(217,−2) size=40×40 */}
      <img
        src="/assets/portfolio-menu/definit-badge-circle.png"
        alt=""
        className="absolute rounded-full object-cover opacity-90"
        style={{ width: 40, height: 40, right: 86, top: -2 }}
      />
      {/* GLOBAL Select badge — n3 pos=(298,82) size=43×43 */}
      <img
        src="/assets/portfolio-menu/definit-global.png"
        alt=""
        className="absolute rounded-full object-cover"
        style={{ width: 43, height: 43, right: 2, top: 82 }}
      />
      {/* Blue decorative dots */}
      <div className="absolute rounded-full" style={{ width: 15, height: 15, right: 4, top: 6, backgroundColor: '#718ddf' }} />
      <div className="absolute rounded-full" style={{ width: 11, height: 11, right: 110, top: 92, backgroundColor: '#718ddf' }} />
    </div>
  );
}

function GridFarmingIllustration() {
  return (
    <div className="absolute bottom-3 right-3 pointer-events-none" aria-hidden>
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-success-bg opacity-80" />
        <svg
          viewBox="0 0 80 80"
          className="absolute inset-2 w-20 h-20 text-success"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 56 L12 24 L40 12 L68 24 L68 56 L40 68 Z" strokeLinejoin="round" />
          <path d="M12 40 H68" opacity="0.5" />
          <path d="M12 32 H68" opacity="0.35" />
          <path d="M12 48 H68" opacity="0.35" />
          <path d="M28 24 V56" opacity="0.35" />
          <path d="M52 24 V56" opacity="0.35" />
          <circle cx="40" cy="40" r="4" fill="currentColor" stroke="none" />
        </svg>
      </div>
    </div>
  );
}

export function RoboAdvisoryCard({ onClick }: { onClick?: () => void }) {
  return (
    <ServiceMenuCard
      title="Robo Advisory"
      description="คือบริการลงทุนแบบอัตโนมัติด้วย AI ที่จะช่วยให้บรรลุเป้าหมายการลงทุนได้ อย่างง่ายดาย"
      gradient="service-menu-card--robo"
      illustration={<RoboIllustration />}
      onClick={onClick}
    />
  );
}

export function DefinitCard({ onClick }: { onClick?: () => void }) {
  return (
    <ServiceMenuCard
      title="Definit by finnomena."
      description="เหมาะกับนักลงทุนในตลาดไทย วิเคราะห์ปัจจัยรอบด้านทั้ง พื้นฐาน มูลค่า และ เทคนิค"
      gradient="service-menu-card--definit"
      illustration={<DefinitIllustration />}
      onClick={onClick}
    />
  );
}

export function GridFarmingCard({ onClick }: { onClick: () => void }) {
  return (
    <ServiceMenuCard
      title="Grid Farming"
      description="ระบบซื้อ-ขายหุ้นอัตโนมัติในช่วงราคาที่กำหนด วาง Grid ซื้อ-ขายเพื่อเก็บกำไรจากความผันผวนของราคา"
      gradient="service-menu-card--grid-farming"
      illustration={<GridFarmingIllustration />}
      onClick={onClick}
    />
  );
}
