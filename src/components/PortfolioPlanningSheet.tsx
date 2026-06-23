import { BottomSheet, Button } from "@sarunyu/system-one";
import PortfolioPlanningContent from "./PortfolioPlanningContent";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGridFarming: () => void;
}

export default function PortfolioPlanningSheet({
  open,
  onOpenChange,
  onSelectGridFarming,
}: Props) {
  function handleGridFarming() {
    onOpenChange(false);
    onSelectGridFarming();
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="บริการวางแผนพอร์ต"
      showHeader={false}
      showHandle={false}
      className="gap-0 overflow-hidden px-0 pb-0 pt-0"
      contentClassName="pt-0"
    >
      <div className="flex w-full shrink-0 flex-col items-center gap-2 border-b border-divider px-4 pb-1.5 pt-2">
        <div
          className="h-1 w-10 shrink-0 rounded-full bg-muted"
          aria-hidden
        />
        <div className="flex w-full items-center gap-3 pr-2">
          <p className="min-w-0 flex-1 truncate text-[18px] font-bold leading-normal text-foreground">
            บริการวางแผนพอร์ต
          </p>
          <Button
            variant="plain"
            size="md"
            className="shrink-0 text-base font-bold"
            onClick={() => onOpenChange(false)}
          >
            ปิด
          </Button>
        </div>
      </div>
      <div className="bg-background px-4 pb-20 pt-4">
        <PortfolioPlanningContent onSelectGridFarming={handleGridFarming} />
      </div>
    </BottomSheet>
  );
}
