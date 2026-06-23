import { ArrowRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";

const CARD_CLASS =
  "service-menu-card w-full text-left relative overflow-hidden rounded-lg p-4 min-h-32 flex flex-col gap-2 transition-opacity hover:opacity-95";

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
      <div className="flex flex-col gap-2 relative z-10 max-w-[68%]">
        <div className="flex items-start justify-between gap-2 w-full">
          <span className="type-subtitle-1 text-foreground font-bold flex-1">{title}</span>
          <ArrowRight size={24} className="text-primary-action shrink-0" />
        </div>
        <div className="type-body-2 text-muted-foreground">{description}</div>
      </div>
      {illustration}
    </button>
  );
}

function RoboIllustration() {
  return (
    <div className="absolute bottom-0 right-4 w-24 h-24 pointer-events-none" aria-hidden>
      <img
        src="/assets/portfolio-menu/robo-glow.png"
        alt=""
        className="absolute bottom-0 right-0 w-full mix-blend-screen opacity-90"
      />
      <img
        src="/assets/portfolio-menu/robo-base.png"
        alt=""
        className="absolute bottom-0 right-0 w-20"
      />
      <img
        src="/assets/portfolio-menu/robo-mid.png"
        alt=""
        className="absolute bottom-2 right-3 w-20"
      />
      <img
        src="/assets/portfolio-menu/robo-top.png"
        alt=""
        className="absolute bottom-4 right-5 w-16"
      />
    </div>
  );
}

function DefinitIllustration() {
  return (
    <div className="absolute bottom-3 right-2 pointer-events-none" aria-hidden>
      <div className="relative w-24 h-24">
        <img
          src="/assets/portfolio-menu/definit-badge.png"
          alt=""
          className="absolute bottom-0 right-0 w-20 h-20 rounded-full object-cover opacity-80 rotate-12"
        />
        <img
          src="/assets/portfolio-menu/definit-badge.png"
          alt=""
          className="absolute bottom-1 right-8 w-9 h-9 rounded-full object-cover -rotate-12"
        />
      </div>
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
      description={
        <>
          <p className="mb-0">คือบริการลงทุนแบบอัตโนมัติด้วย AI ที่จะช่วยให้บรรลุเป้าหมายการลงทุนได้</p>
          <p>อย่างง่ายดาย</p>
        </>
      }
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
      description={
        <>
          <p className="mb-0">เหมาะกับนักลงทุนในตลาดไทย</p>
          <p className="mb-0">วิเคราะห์ปัจจัยรอบด้านทั้ง พื้นฐาน</p>
          <p>มูลค่า และ เทคนิค</p>
        </>
      }
      gradient="service-menu-card--definit"
      illustration={<DefinitIllustration />}
      className="min-h-36"
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
