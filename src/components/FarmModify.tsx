import { useState, useMemo } from "react";
import {
  Button,
  Input,
  Checkbox,
  Alert,
  Radio,
  Card,
  Chip,
} from "@sarunyu/system-one";
import { Warning } from "@phosphor-icons/react";
import InfoTooltip from "./InfoTooltip";
import type { Farm, FarmConfig, CloseMethod } from "../types";
import {
  calcNeedInvestment,
  calcGridLevelCount,
  isConfigValid,
  formatCurrency,
  calcPL,
} from "../utils";

interface Props {
  farm: Farm;
  onUpdate: (farm: Farm) => void;
  onClose: (id: string) => void;
}

function farmToConfig(farm: Farm): FarmConfig {
  return {
    ticker: farm.ticker,
    priceMin: farm.priceMin,
    priceMax: farm.priceMax,
    spread: farm.spread,
    commission: farm.commission,
    mode: farm.mode,
    volumePerLevel: farm.volumePerLevel,
    valuePerLevel: farm.valuePerLevel,
    capital: farm.capital,
  };
}

export default function FarmModify({ farm, onUpdate, onClose }: Props) {
  const [config, setConfig] = useState<FarmConfig>(farmToConfig(farm));
  const [modifyConsent, setModifyConsent] = useState(false);
  const [closeConsent, setCloseConsent] = useState(false);
  const [closeMethod, setCloseMethod] = useState<CloseMethod>("sell-and-transfer");
  const [modifySubmitted, setModifySubmitted] = useState(false);

  const { valid, errors } = useMemo(() => isConfigValid(config), [config]);

  const numMin = Number(config.priceMin) || 0;
  const numMax = Number(config.priceMax) || 0;
  const numSpread = Number(config.spread) || 0;
  const numCommission = Number(config.commission) || 0;

  const hasValidRange =
    numMin > 0 && numMax > numMin && numSpread > 0 && numSpread < numMax - numMin;

  const newNeedInvestment = hasValidRange
    ? calcNeedInvestment({
        priceMin: numMin,
        priceMax: numMax,
        spread: numSpread,
        commission: numCommission,
        mode: config.mode,
        volumePerLevel: Number(config.volumePerLevel) || 0,
        valuePerLevel: Number(config.valuePerLevel) || 0,
      })
    : 0;

  const diff = newNeedInvestment - farm.capital;
  const gridLevels = hasValidRange ? calcGridLevelCount(numMin, numMax, numSpread) : 0;
  const originalGridLevels = calcGridLevelCount(farm.priceMin, farm.priceMax, farm.spread);
  const gridLevelsDecreased = gridLevels > 0 && gridLevels < originalGridLevels;

  const estimatedPL = calcPL(farm);
  const plPositive = estimatedPL >= 0;

  function set<K extends keyof FarmConfig>(key: K, value: FarmConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handleModify() {
    setModifySubmitted(true);
    if (!valid || !modifyConsent) return;
    const updated: Farm = {
      ...farm,
      priceMin: numMin,
      priceMax: numMax,
      spread: numSpread,
      commission: numCommission,
      mode: config.mode,
      volumePerLevel: Number(config.volumePerLevel) || farm.volumePerLevel,
      valuePerLevel: Number(config.valuePerLevel) || farm.valuePerLevel,
      capital: Number(config.capital) || farm.capital,
    };
    onUpdate(updated);
  }

  function handleClose() {
    if (!closeConsent) return;
    onClose(farm.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card size="desktop">
        <div className="flex flex-col gap-5">
          <h2 className="type-h5 text-foreground">แก้ไขการตั้งค่า</h2>

          <div className="form-row">
            <div className="flex-1">
              <Input
                label="ราคาต่ำสุด (บาท)"
                placeholder="0.00"
                type="number"
                value={config.priceMin === "" ? "" : String(config.priceMin)}
                onChange={(v) => set("priceMin", v === "" ? "" : Number(v))}
                forceState={modifySubmitted && errors.priceMin ? "error" : "default"}
                errorMessage={errors.priceMin}
              />
            </div>
            <div className="flex-1">
              <Input
                label="ราคาสูงสุด (บาท)"
                placeholder="0.00"
                type="number"
                value={config.priceMax === "" ? "" : String(config.priceMax)}
                onChange={(v) => set("priceMax", v === "" ? "" : Number(v))}
                forceState={modifySubmitted && errors.priceMax ? "error" : "default"}
                errorMessage={errors.priceMax}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="type-subtitle-1 text-foreground">Profit Spread Range (บาท)</span>
              <InfoTooltip content="ยิ่งน้อย ระบบจบเร็ว แต่กำไรต่อรอบน้อย" />
            </div>
            <Input
              placeholder="0.00"
              type="number"
              value={config.spread === "" ? "" : String(config.spread)}
              onChange={(v) => set("spread", v === "" ? "" : Number(v))}
              forceState={modifySubmitted && errors.spread ? "error" : "default"}
              errorMessage={errors.spread}
            />
          </div>

          <Input
            label="Commission (%)"
            type="number"
            unit="%"
            value={config.commission === "" ? "" : String(config.commission)}
            onChange={(v) => set("commission", v === "" ? "" : Number(v))}
            forceState={modifySubmitted && errors.commission ? "error" : "default"}
            errorMessage={errors.commission}
          />

          <div className="flex flex-col gap-2">
            <span className="type-subtitle-1 text-foreground">ต่อระดับราคา</span>
            <div className="flex flex-wrap gap-2">
              <Chip
                label="Volume (หุ้น)"
                selected={config.mode === "volume"}
                onClick={() => set("mode", "volume")}
              />
              <Chip
                label="Value (บาท)"
                selected={config.mode === "value"}
                onClick={() => set("mode", "value")}
              />
            </div>
          </div>

          {config.mode === "volume" ? (
            <Input
              label="จำนวนหุ้นต่อระดับ"
              type="number"
              unit="หุ้น"
              value={config.volumePerLevel === "" ? "" : String(config.volumePerLevel)}
              onChange={(v) => set("volumePerLevel", v === "" ? "" : Number(v))}
              forceState={modifySubmitted && errors.volumePerLevel ? "error" : "default"}
              errorMessage={errors.volumePerLevel}
            />
          ) : (
            <Input
              label="จำนวนเงินต่อระดับ"
              type="number"
              unit="฿"
              value={config.valuePerLevel === "" ? "" : String(config.valuePerLevel)}
              onChange={(v) => set("valuePerLevel", v === "" ? "" : Number(v))}
              forceState={modifySubmitted && errors.valuePerLevel ? "error" : "default"}
              errorMessage={errors.valuePerLevel}
            />
          )}

          {hasValidRange && newNeedInvestment > 0 && (
            <div className="rounded-lg border border-border p-4 flex flex-col gap-2 bg-default-secondary">
                <p className="type-caption-bold text-muted-foreground">สรุปการเปลี่ยนแปลงเงิน</p>
                <div className="flex justify-between type-body-2">
                  <span className="text-muted-foreground">เงินลงทุนที่ต้องการ (ใหม่)</span>
                  <span className="text-foreground font-medium">
                    {formatCurrency(newNeedInvestment)}
                  </span>
                </div>
                <div className="flex justify-between type-body-2">
                  <span className="text-muted-foreground">เงินลงทุนปัจจุบัน</span>
                  <span className="text-foreground font-medium">{formatCurrency(farm.capital)}</span>
                </div>
                <div className="flex justify-between type-body-2 pt-1 border-t border-divider">
                  <span className="text-muted-foreground">ผลต่าง</span>
                  <span
                    className={`font-semibold ${diff > 0 ? "pl-amber" : "pl-positive"}`}
                  >
                    {diff > 0
                      ? `ต้องเพิ่มเงิน ${formatCurrency(diff)}`
                      : `ถอนเงินได้ ${formatCurrency(Math.abs(diff))}`}
                  </span>
                </div>
                {gridLevels > 0 && (
                  <p className="type-caption text-muted-foreground">
                    Grid Levels ใหม่: {gridLevels} ระดับ
                    {gridLevelsDecreased && (
                      <span className="pl-amber"> (ลดลงจาก {originalGridLevels} ระดับ)</span>
                    )}
                  </p>
                )}
            </div>
          )}

          {gridLevelsDecreased && (
            <Alert
              status="warning"
              message={`Grid Levels ลดลงจาก ${originalGridLevels} เป็น ${gridLevels} ระดับ — ระบบอาจต้องขายหุ้นส่วนเกินออกก่อนดำเนินการ กรุณาตรวจสอบพอร์ตก่อนยืนยัน`}
            />
          )}

          <Checkbox
            checked={modifyConsent}
            onChange={setModifyConsent}
            label="ข้าพเจ้ายืนยันการปรับปรุงฟาร์มและรับทราบการเปลี่ยนแปลงที่จะเกิดขึ้น"
          />

          <Button
            variant={valid && modifyConsent ? "primary" : "disabled"}
            size="lg"
            onClick={handleModify}
          >
            ปรับปรุงฟาร์ม
          </Button>
        </div>
      </Card>

      <Card size="desktop">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Warning size={20} className="text-destructive" />
            <h2 className="type-h5 text-foreground">ปิดฟาร์ม</h2>
          </div>

          <Alert
            status="warning"
            message="การปิดฟาร์มจะยกเลิกคำสั่งซื้อ-ขายที่ค้างอยู่ทั้งหมด กรุณาตรวจสอบก่อนดำเนินการ"
          />

          <div className="flex flex-col gap-2">
            <div className="flex justify-between type-body-2">
              <span className="text-muted-foreground">ราคาตลาด ณ วันปิด</span>
              <span className="text-foreground font-medium">
                {formatCurrency(farm.marketPrice)}
              </span>
            </div>
            <div className="flex justify-between type-body-2">
              <span className="text-muted-foreground">ประมาณการ P/L</span>
              <span className={`font-semibold ${plPositive ? "pl-positive" : "pl-negative"}`}>
                {plPositive ? "+" : ""}
                {formatCurrency(estimatedPL)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="type-subtitle-1 text-foreground">เลือกวิธีปิดฟาร์ม</p>
            <div className="flex flex-col gap-2">
              <Radio
                checked={closeMethod === "sell-and-transfer"}
                onChange={() => setCloseMethod("sell-and-transfer")}
                name="close-method"
                value="sell-and-transfer"
                label="ขายหุ้นและโอนเงินออก"
                description="ขายหุ้นทั้งหมดที่ราคาตลาด แล้วโอนเงินกลับเข้าบัญชีหลัก"
              />
              <Radio
                checked={closeMethod === "transfer-to-portfolio"}
                onChange={() => setCloseMethod("transfer-to-portfolio")}
                name="close-method"
                value="transfer-to-portfolio"
                label="โอนหุ้นเข้าพอร์ตปกติ"
                description="หยุดระบบ Grid แต่เก็บหุ้นไว้ในพอร์ตปกติโดยไม่ขาย"
              />
            </div>
          </div>

          <Checkbox
            checked={closeConsent}
            onChange={setCloseConsent}
            label="ข้าพเจ้ายืนยันการปิดฟาร์มและรับทราบว่าคำสั่งที่ค้างอยู่จะถูกยกเลิกทั้งหมด"
          />

          <Button
            variant={closeConsent ? "outline" : "disabled"}
            size="lg"
            onClick={handleClose}
            disabled={!closeConsent}
          >
            ปิดฟาร์ม
          </Button>
        </div>
      </Card>
    </div>
  );
}
