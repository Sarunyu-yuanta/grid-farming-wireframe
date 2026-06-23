import { Modal } from "@sarunyu/system-one";
import PortfolioPlanningContent from "./PortfolioPlanningContent";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGridFarming: () => void;
}

export default function PortfolioPlanningModal({
  open,
  onOpenChange,
  onSelectGridFarming,
}: Props) {
  function handleGridFarming() {
    onOpenChange(false);
    onSelectGridFarming();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-[500px] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="บริการวางแผนพอร์ต"
      >
        <Modal
          variant="content"
          actionLayout="none"
          responsive="desktop"
          title="บริการวางแผนพอร์ต"
          onClose={() => onOpenChange(false)}
        >
          <PortfolioPlanningContent onSelectGridFarming={handleGridFarming} />
        </Modal>
      </div>
    </div>
  );
}
