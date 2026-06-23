import { useEffect, useRef } from "react";
import { generateGridLevels, generateMockOHLC } from "../utils";

interface Props {
  ticker: string;
  priceMin: number;
  priceMax: number;
  spread: number;
  marketPrice?: number;
}

export default function CandlestickChart({
  ticker,
  priceMin,
  priceMax,
  spread,
  marketPrice,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const padLeft = 44;
    const padRight = 8;
    const padTop = 12;
    const padBottom = 28;
    const chartW = W - padLeft - padRight;
    const chartH = H - padTop - padBottom;

    const candles = generateMockOHLC(ticker || "STOCK", priceMin, priceMax);
    const n = candles.length;

    const allPrices = candles.flatMap((c) => [c.high, c.low]);
    if (priceMin > 0) allPrices.push(priceMin * 0.97);
    if (priceMax > 0) allPrices.push(priceMax * 1.03);
    const dataMin = Math.min(...allPrices);
    const dataMax = Math.max(...allPrices);
    const dataRange = dataMax - dataMin || 1;

    function toY(price: number): number {
      return padTop + chartH - ((price - dataMin) / dataRange) * chartH;
    }

    // background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // grid lines (horizontal)
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
      const price = dataMin + (dataRange * i) / gridCount;
      const y = toY(price);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(W - padRight, y);
      ctx.stroke();

      ctx.fillStyle = "#9ca3af";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(price.toFixed(0), padLeft - 4, y + 3);
    }

    // candle bars
    const candleW = Math.max(3, Math.floor((chartW / n) * 0.65));
    const candleSpacing = chartW / n;

    for (let i = 0; i < n; i++) {
      const c = candles[i];
      const x = padLeft + i * candleSpacing + candleSpacing / 2;
      const isBull = c.close >= c.open;
      const color = isBull ? "#0f6e56" : "#993c1d";

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      // wick
      ctx.beginPath();
      ctx.moveTo(x, toY(c.high));
      ctx.lineTo(x, toY(c.low));
      ctx.stroke();

      // body
      const bodyTop = toY(Math.max(c.open, c.close));
      const bodyBot = toY(Math.min(c.open, c.close));
      const bodyH = Math.max(1, bodyBot - bodyTop);

      ctx.fillStyle = color;
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
    }

    // grid levels overlay
    if (priceMin > 0 && priceMax > 0 && spread > 0) {
      const levels = generateGridLevels(priceMin, priceMax, spread);
      levels.forEach((level) => {
        if (level < dataMin || level > dataMax) return;
        const y = toY(level);
        const isBuyLevel = marketPrice !== undefined && level > marketPrice;

        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = isBuyLevel ? "#185fa5" : "#ba7517";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(W - padRight, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // label
        const label = isBuyLevel ? "ซื้อ" : "ขาย";
        ctx.fillStyle = isBuyLevel ? "#185fa5" : "#ba7517";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(label, W - padRight + 2, y + 3);
      });
    }

    // market price line
    if (marketPrice !== undefined && marketPrice >= dataMin && marketPrice <= dataMax) {
      const y = toY(marketPrice);
      ctx.setLineDash([6, 3]);
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(W - padRight, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [ticker, priceMin, priceMax, spread, marketPrice]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "220px", display: "block", borderRadius: "4px" }}
    />
  );
}
