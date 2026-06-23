import {
  RoboAdvisoryCard,
  DefinitCard,
  GridFarmingCard,
} from "./ServiceMenuCard";

interface Props {
  onSelectGridFarming: () => void;
}

export default function PortfolioPlanningContent({ onSelectGridFarming }: Props) {
  return (
    <div className="portfolio-planning-content">
      <p className="type-body-2 text-muted-foreground">
        ให้ Yuanta ช่วยคุณบริหารสินทรัพย์ด้วยแผนการลงทุน
        <br />
        Robo Advisory และจากผู้เชี่ยวชาญ
      </p>
      <div className="flex flex-col gap-3 w-full">
        <RoboAdvisoryCard />
        <DefinitCard />
        <GridFarmingCard onClick={onSelectGridFarming} />
      </div>
    </div>
  );
}
