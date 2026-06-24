import {
  RoboAdvisoryCard,
  DefinitCard,
  GridFarmingCard,
} from "./ServiceMenuCard";

interface Props {
  onSelectGridFarming: () => void;
  gap?: number;
}

export default function PortfolioPlanningContent({ onSelectGridFarming, gap = 10 }: Props) {
  return (
    <div className="flex flex-col w-full" style={{ gap: `${gap}px` }}>
      <p className="type-body-2 text-muted-foreground m-0">
        ให้ Yuanta ช่วยคุณบริหารสินทรัพย์ด้วยแผนการลงทุน Robo Advisory และจากผู้เชี่ยวชาญ
      </p>
      <div className="flex flex-col gap-3 w-full">
        <RoboAdvisoryCard />
        <DefinitCard />
        <GridFarmingCard onClick={onSelectGridFarming} />
      </div>
    </div>
  );
}
