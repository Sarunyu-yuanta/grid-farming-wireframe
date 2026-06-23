import { Tooltip } from "@sarunyu/system-one";
import { Info } from "@phosphor-icons/react";

interface Props {
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}

export default function InfoTooltip({ content, side = "top" }: Props) {
  return (
    <Tooltip content={content} side={side}>
      <span
        tabIndex={0}
        role="button"
        aria-label="ข้อมูลเพิ่มเติม"
        className="inline-flex cursor-help text-muted-foreground"
      >
        <Info size={14} />
      </span>
    </Tooltip>
  );
}
