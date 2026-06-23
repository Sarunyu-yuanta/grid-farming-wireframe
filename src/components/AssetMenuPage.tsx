import { useState } from "react";
import { Button, useIsMobile } from "@sarunyu/system-one";
import PortfolioPlanningModal from "./PortfolioPlanningModal";
import PortfolioPlanningSheet from "./PortfolioPlanningSheet";

interface Props {
  onOpenGridFarming: () => void;
}

export default function AssetMenuPage({ onOpenGridFarming }: Props) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);

  return (
    <>
      {!open && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 max-w-[640px] mx-auto w-full">
          <div className="flex flex-col gap-1 text-center md:text-left w-full">
            <h1 className="type-h4 text-foreground">สินทรัพย์</h1>
            <p className="type-body-2 text-muted-foreground">
              จัดการพอร์ตและบริการลงทุนของคุณ
            </p>
          </div>
          <Button variant="primary" size="lg" onClick={() => setOpen(true)}>
            บริการวางแผนพอร์ต
          </Button>
        </div>
      )}
      {isMobile ? (
        <PortfolioPlanningSheet
          open={open}
          onOpenChange={setOpen}
          onSelectGridFarming={onOpenGridFarming}
        />
      ) : (
        <PortfolioPlanningModal
          open={open}
          onOpenChange={setOpen}
          onSelectGridFarming={onOpenGridFarming}
        />
      )}
    </>
  );
}
