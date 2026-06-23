# Grid Farming — Feature Specification

> เอกสารนี้ใช้เป็น input สำหรับการพัฒนา Grid Farming feature ครอบคลุมทุก Journey, Business Logic, Data Model, และ Edge Cases

---

## 1. ภาพรวม (Overview)

**Grid Farming** คือระบบซื้อ-ขายหุ้นอัตโนมัติในช่วงราคาที่ผู้ใช้กำหนด โดยระบบแบ่งช่วงราคานั้นออกเป็นระดับย่อย ๆ (Grid Levels) แล้ววางคำสั่งซื้อ-ขายไว้ล่วงหน้าทุกระดับ เมื่อราคาหุ้นขึ้น-ลงในกรอบนั้น ระบบจะจับคู่คำสั่งซื้อ-ขายโดยอัตโนมัติ สะสมกำไรต่อเนื่องโดยไม่ต้องนั่งจับจอ

### เหมาะกับ

- หุ้นที่ราคาเคลื่อนไหวในกรอบ (Sideways Market)
- นักลงทุนที่ต้องการ Passive Income จากการเทรด
- ผู้ที่ต้องการลด Emotional Trading

### ไม่เหมาะกับ

- หุ้นที่มีแนวโน้มขาลงชัดเจน (Downtrend)
- ช่วงราคาออกนอก Grid Range ที่ตั้งไว้ → ระบบหยุดทำงาน

---

## 2. User Journeys

### Journey 1 — เปิดฟาร์มใหม่ (Create Farm)

```
Farming Main Page (Empty State)
  → กดปุ่ม "+ เพิ่มฟาร์ม"
  → กรอกฟอร์มตั้งค่าฟาร์ม
  → ระบบคำนวณ Need Investment
    → [ERROR] เงินไม่พอ (Need > Capital) → แสดง Warning สีแดง (ยังกด เริ่มฟาร์ม ได้)
    → [ERROR] Price Range ไม่ถูกต้อง (Min >= Max) → block ปุ่ม เริ่มฟาร์ม
    → [ERROR] Spread = 0 หรือ Volume/Value = 0 → block ปุ่ม เริ่มฟาร์ม
  → ติ๊ก Consent checkbox
  → กด "เริ่มฟาร์ม"
  → [SUCCESS] สร้างฟาร์มสำเร็จ → Farm chip ใหม่ปรากฏ → เปิด Overview tab
```

### Journey 2 — ติดตามฟาร์ม (Monitor Farm)

```
Farming Main Page (มีฟาร์มอยู่แล้ว)
  → กดที่ Farm chip ชื่อหุ้น
  → เข้า Farm Detail → Tab: Overview
    → ดู Portfolio Summary (Capital, Cost/Share, Amount, Cost Value, Market Value, Cash, P/L)
    → ดู Trade Statistics (วางขาย, วางซื้อ, P/L รายวัน, P/L ตั้งแต่เริ่ม)
    → [WARNING STATE] ราคาปัจจุบันออกนอก Grid Range → แสดง banner เตือน
```

### Journey 3 — ปรับปรุงฟาร์ม (Modify Farm)

```
Farm Detail → Tab: ปรับปรุงฟาร์ม
  → แก้ไขการตั้งค่า (Price Range, Spread, Commission, Volume/Value)
  → ระบบคำนวณ Need Investment ใหม่ + เปรียบเทียบกับ Current Investment
    → Need > Current → แสดง "ต้องเพิ่มเงิน X บาท" (สีส้ม)
    → Need < Current → แสดง "ถอนเงินได้ X บาท" (สีเขียว)
    → [ERROR] Config ไม่ valid → block ปุ่ม ปรับปรุงฟาร์ม
  → ติ๊ก Consent checkbox
  → กด "ปรับปรุงฟาร์ม"
  → [SUCCESS] Config ใหม่ถูกใช้งาน → กลับ Overview tab
```

### Journey 4 — ปิดฟาร์ม (Close Farm)

```
Farm Detail → Tab: ปรับปรุงฟาร์ม → Section: ปิดฟาร์ม
  → เลือกวิธีปิดฟาร์ม:
    → Option A: "ขายหุ้นและโอนเงินออก" — ขายหุ้นทั้งหมดที่ราคาตลาด แล้วโอนเงินกลับ
    → Option B: "โอนหุ้นเข้าพอร์ตปกติ" — หยุดระบบ Grid แต่เก็บหุ้นไว้ในพอร์ตปกติ
  → ระบบแสดง ราคา ณ วันปิด + ประมาณการ P/L
  → ติ๊ก Consent checkbox
  → กด "ปิดฟาร์ม"
  → [SUCCESS] ฟาร์มปิดแล้ว → ลบ Farm chip → กลับ Farming Main Page
```

---

## 3. Data Model

### Farm Object

```typescript
interface Farm {
  id: string;
  ticker: string; // ชื่อหุ้น เช่น "PTT", "AOT"
  status: "active" | "closed";

  // Config
  priceMin: number; // ราคาต่ำสุดของ Grid
  priceMax: number; // ราคาสูงสุดของ Grid
  spread: number; // ส่วนต่างกำไรต่อรอบ (บาท)
  commission: number; // ค่าธรรมเนียม (%)
  mode: "volume" | "value"; // วิธีคำนวณต่อระดับราคา
  volumePerLevel: number; // จำนวนหุ้นต่อระดับ (ใช้เมื่อ mode = "volume")
  valuePerLevel: number; // จำนวนเงินต่อระดับ (ใช้เมื่อ mode = "value")

  // Portfolio
  capital: number; // เงินลงทุนเริ่มต้น
  shares: number; // จำนวนหุ้นที่ถืออยู่
  costPerShare: number; // ราคาเฉลี่ยต้นทุน
  cash: number; // เงินสดคงเหลือ
  marketPrice: number; // ราคาตลาดปัจจุบัน

  // Trade Stats
  sharesForSale: number; // จำนวนหุ้นที่วางขายอยู่
  sharesBidding: number; // จำนวนหุ้นที่วางซื้ออยู่
  plToday: number; // P/L จับคู่รายวัน
  plTotal: number; // P/L จับคู่ตั้งแต่เริ่ม

  // Metadata
  createdAt: Date;
}
```

### Computed Fields (ไม่ต้อง store — คำนวณ real-time)

```typescript
const costValue = farm.costPerShare * farm.shares; // มูลค่าต้นทุน
const marketValue = farm.marketPrice * farm.shares; // มูลค่าตลาด
const pl = marketValue + farm.cash - farm.capital; // P/L รวม
const gridLevels = Math.floor((farm.priceMax - farm.priceMin) / farm.spread); // จำนวนระดับ Grid
```

### Need Investment Calculation

```typescript
// mode = "volume"
const needInvestment = farm.volumePerLevel * farm.priceMax * gridLevels;

// mode = "value"
const needInvestment = farm.valuePerLevel * gridLevels;

// เพิ่ม buffer commission
const needWithCommission = needInvestment * (1 + farm.commission / 100);
```

### Est. 1st Buy Order

```typescript
// ระบบวางคำสั่งซื้อแรกที่ระดับถัดไปจากราคาปัจจุบัน (ขึ้นไป)
const levels = [];
for (let price = farm.priceMin; price <= farm.priceMax; price += farm.spread) {
  levels.push(parseFloat(price.toFixed(2)));
}
const firstBuy = levels.find((l) => l > farm.marketPrice) ?? farm.priceMax;
```

---

## 4. หน้าจอและ Components

### 4.1 Farming Main Page

**State: Empty (ยังไม่มีฟาร์ม)**

- แสดงข้อความ Empty State + ปุ่ม "+ เพิ่มฟาร์ม"

**State: มีฟาร์ม**

- Farm Chips แถวบน — แต่ละ chip แสดง: Ticker, จุดสีเขียว (Active) / สีเทา (Closed)
- ปุ่ม "+ เพิ่มฟาร์ม" มุมขวาบนเสมอ
- คลิก chip → เปิด Farm Detail

---

### 4.2 New Farm Form

Layout: 2 คอลัมน์ (ซ้าย = ฟอร์มตั้งค่า, ขวา = สรุปก่อนเริ่ม)

#### ฝั่งซ้าย — ฟอร์มตั้งค่า

| Field                  | Type                   | Validation                        |
| ---------------------- | ---------------------- | --------------------------------- |
| Ticker                 | text input             | required                          |
| Price Min              | number                 | required, > 0, < Price Max        |
| Price Max              | number                 | required, > Price Min             |
| Profit Spread Range    | number                 | required, > 0, < (Max - Min)      |
| Commission             | number (%)             | required, >= 0                    |
| Per Price Level (Mode) | toggle: Volume / Value | required                          |
| Volume per Level       | number (หุ้น)          | required เมื่อ mode = volume, > 0 |
| Value per Level        | number (บาท)           | required เมื่อ mode = value, > 0  |

**Tooltip ที่ต้องมี:**

- Profit Spread Range: "ยิ่งน้อย ระบบจบเร็ว แต่กำไรต่อรอบน้อย"
- Volume: "ซื้อขายด้วยจำนวนหุ้นที่เท่ากันในทุกระดับราคา — ช่วยให้คุมปริมาณหุ้นได้แม่นยำ"
- Value: "ซื้อขายด้วยจำนวนเงินที่เท่ากันในทุกระดับราคา — ราคาถูกได้หุ้นมาก ราคาสูงได้หุ้นน้อย"

#### ฝั่งขวา — สรุปก่อนเริ่ม

| แสดง                   | รายละเอียด                                                     |
| ---------------------- | -------------------------------------------------------------- |
| Need Investment        | คำนวณจาก formula — readonly                                    |
| Warning (ถ้าเงินไม่พอ) | สีแดง: "เงินลงทุนต่ำกว่า ฿500,000 อาจมีความเสี่ยงสูง"          |
| Est. 1st Buy Order     | ระดับราคาแรกที่ระบบจะส่งคำสั่งซื้อ                             |
| Est. Remaining Cash    | Capital - Need Investment                                      |
| Backtest Performance   | (ดูหัวข้อ 4.3)                                                 |
| Candlestick Chart      | (ดูหัวข้อ 4.4)                                                 |
| Consent checkbox       | "ข้าพเจ้ารับทราบและยอมรับความเสี่ยง..." — required ก่อน submit |
| ปุ่ม "เริ่มฟาร์ม"      | disabled ถ้า validation ไม่ผ่านหรือยังไม่ tick consent         |

---

### 4.3 Backtest Performance Section

แสดงผลประมาณการจากข้อมูลย้อนหลัง (Simulated)

| Metric                  | ความหมาย                                     |
| ----------------------- | -------------------------------------------- |
| Farm Return             | ผลตอบแทนที่คาดว่าจะได้จาก Grid Farming (%)   |
| Benchmark               | ผลตอบแทนจากการถือหุ้นธรรมดา Buy & Hold (%)   |
| อัตราการเทรด (Turnover) | จำนวนรอบซื้อ-ขายที่เกิดขึ้นโดยเฉลี่ยต่อเดือน |

---

### 4.4 Candlestick Chart

แสดงราคาหุ้นย้อนหลัง + เส้น Grid ระดับซื้อ/ขาย

**Chart Spec:**

- แสดง OHLC (Open, High, Low, Close) ย้อนหลัง ~28 แท่ง
- แท่งสีเขียว = ราคาปิดสูงกว่าเปิด (Bullish)
- แท่งสีแดง = ราคาปิดต่ำกว่าเปิด (Bearish)
- เส้น Grid Level แนวนอน — ทุก Spread — แสดง label ว่าระดับนั้นเป็น "ซื้อ" หรือ "ขาย"
- เส้น Grid อยู่ภายในช่วง Price Min ถึง Price Max เท่านั้น

---

### 4.5 Farm Detail — Tab: Overview

**Section 1 — Portfolio Summary (7 fields)**

| Field                       | สูตร / ที่มา                                             |
| --------------------------- | -------------------------------------------------------- |
| เงินลงทุนเริ่มต้น (Capital) | farm.capital                                             |
| ต้นทุน/หุ้น (Cost/Share)    | farm.costPerShare                                        |
| จำนวนหุ้น (Amount)          | farm.shares                                              |
| มูลค่าต้นทุน (Cost Value)   | farm.costPerShare × farm.shares                          |
| มูลค่าตลาด (Market Value)   | farm.marketPrice × farm.shares                           |
| เงินสด (Cash)               | farm.cash                                                |
| กำไร/ขาดทุน (P/L)           | Market Value + Cash - Capital — สีเขียวถ้าบวก สีแดงถ้าลบ |

**Section 2 — Trade Statistics**

| Field                       | ที่มา              |
| --------------------------- | ------------------ |
| จำนวนหุ้นที่วางขาย          | farm.sharesForSale |
| จำนวนหุ้นที่วางซื้อ         | farm.sharesBidding |
| P/L จับคู่รายวัน            | farm.plToday       |
| P/L จับคู่ตั้งแต่เริ่มลงทุน | farm.plTotal       |

---

### 4.6 Farm Detail — Tab: ปรับปรุงฟาร์ม

**Section 1 — แก้ไขการตั้งค่า**

- ฟอร์มเหมือนหน้า New Farm ทุกอย่าง แต่ pre-fill ด้วยค่าปัจจุบันของฟาร์ม

**Section 2 — สรุปการเปลี่ยนแปลงเงิน**

| Field                | รายละเอียด                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| Need Investment ใหม่ | คำนวณจาก config ใหม่ — readonly                                                                  |
| เงินลงทุนปัจจุบัน    | farm.capital — readonly                                                                          |
| Diff                 | Need - Current → ถ้า > 0 = "ต้องเพิ่มเงิน X บาท" (สีส้ม), ถ้า < 0 = "ถอนเงินได้ X บาท" (สีเขียว) |

**Section 3 — Consent + Submit**

- Consent checkbox: "ข้าพเจ้ายืนยันการปรับปรุงฟาร์ม..."
- ปุ่ม "ปรับปรุงฟาร์ม" — disabled จนกว่าจะ tick consent และ validation ผ่าน

**Section 4 — ปิดฟาร์ม**

แสดงอยู่ด้านล่างสุดของ Config tab แยกออกมาชัดเจน

| Field                 | รายละเอียด                                             |
| --------------------- | ------------------------------------------------------ |
| ราคาปัจจุบัน ณ วันปิด | farm.marketPrice — readonly                            |
| ประมาณการ P/L         | คำนวณเหมือน Overview P/L — readonly                    |
| เลือกวิธีปิด          | Radio: "ขายหุ้นและโอนเงินออก" / "โอนหุ้นเข้าพอร์ตปกติ" |
| Consent checkbox      | "ข้าพเจ้ายืนยันการปิดฟาร์ม..."                         |
| ปุ่ม "ปิดฟาร์ม"       | สีแดง — disabled จนกว่าจะ tick consent                 |

---

## 5. Business Rules & Validation

### New Farm / Modify Farm

| Rule            | เงื่อนไข                                               | Action                                  |
| --------------- | ------------------------------------------------------ | --------------------------------------- |
| Price Range     | Min >= Max                                             | Block submit, แสดง error ใต้ field      |
| Spread          | spread <= 0 หรือ spread >= (Max - Min)                 | Block submit                            |
| Volume          | volumePerLevel <= 0 เมื่อ mode=volume                  | Block submit                            |
| Value           | valuePerLevel <= 0 เมื่อ mode=value                    | Block submit                            |
| Capital Warning | Need Investment > 500,000 บาท — ไม่ block แต่ต้อง warn | แสดง Warning box สีแดง ยังกด submit ได้ |
| Consent         | ยังไม่ tick                                            | Block submit                            |

### Grid Level Generation

```typescript
function generateGridLevels(
  priceMin: number,
  priceMax: number,
  spread: number,
): number[] {
  const levels: number[] = [];
  for (let p = priceMin; p <= priceMax; p += spread) {
    levels.push(parseFloat(p.toFixed(2)));
  }
  return levels;
}
```

### Farm Status Logic

- ฟาร์ม Active: ราคาปัจจุบันอยู่ภายใน [priceMin, priceMax]
- ฟาร์ม Warning: ราคาปัจจุบันออกนอก range → แสดง banner เตือน แต่ยังไม่ปิดอัตโนมัติ
- ฟาร์ม Closed: ผู้ใช้กด ปิดฟาร์ม เอง

---

## 6. UI/UX Requirements

### Breakpoints

| Breakpoint | Range         | พฤติกรรม                         |
| ---------- | ------------- | -------------------------------- |
| Mobile     | ≤ 600px       | Single column, bottom-focused UX |
| Tablet     | 601px – 900px | Single column, spacing กว้างขึ้น |
| Desktop    | > 900px       | 2-column layout                  |

---

### Responsive Layout — แต่ละหน้า

#### New Farm Form

- **Desktop**: ฟอร์มซ้าย / สรุป (Need Investment + Chart) ขวา — `grid-template-columns: 1fr 1fr`
- **Mobile/Tablet**: Single column — สรุป (Chart + Need Investment) อยู่บน, ฟอร์มอยู่ล่าง
- **ห้ามใช้ inline style สำหรับ grid layout** — ต้องใช้ CSS class เท่านั้น เพื่อให้ media query override ได้

```css
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .two-col {
    grid-template-columns: 1fr !important;
  }
  .two-col .col-right {
    order: -1; /* สรุปขึ้นมาบน */
  }
}
```

#### Farm Detail (Overview / Config)

- **Desktop**: Tab content full width, metrics แสดงเป็น row
- **Mobile**: Metrics grid เปลี่ยนเป็น 2 คอลัมน์ (ไม่ใช่ 3)

```css
@media (max-width: 600px) {
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

#### Form Rows

- **Desktop**: หลาย field ต่อแถว เช่น Price Min | Price Max ใน row เดียว
- **Mobile**: แต่ละ field แยกบรรทัด

```css
.form-row {
  display: flex;
  gap: 12px;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
  }
}
```

---

### Navigation — Responsive

#### Top Navbar

- **Desktop**: Logo + เมนู text (Portfolio, Farming, History, Settings) + Avatar
- **Mobile**: Logo + Avatar เท่านั้น — ซ่อนเมนู text (`display: none` ที่ class `.hide-mobile`)

#### Farm Chips

- **Desktop**: flex-wrap — chip ขึ้นบรรทัดใหม่ถ้าเกิน
- **Mobile**: `overflow-x: auto; flex-wrap: nowrap` — scroll แนวนอน, ไม่ขึ้นบรรทัด

```css
@media (max-width: 900px) {
  .farm-chips {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

#### Toggle Buttons (Volume / Value)

- **Desktop + Mobile**: เหมือนกัน — flex row ทั้งคู่ fit ใน container

---

### Touch & Mobile UX

- Tap target ขั้นต่ำ **44×44px** ทุก interactive element
- Input font-size ขั้นต่ำ **16px** บน mobile (ป้องกัน iOS auto-zoom)
- Candlestick chart ต้องใช้ `width: 100%` และ responsive canvas — อย่า hardcode width เป็น pixel
- Scroll ในแนวตั้งปกติ — ห้าม lock scroll

---

### States ที่ต้องมีครบ

- Empty State (ยังไม่มีฟาร์ม)
- Loading State (กำลังโหลดข้อมูล)
- Warning State (ราคาออกนอก range)
- Error State (Validation fail)
- Success State (สร้าง/อัพเดท/ปิดฟาร์มสำเร็จ)

### Color Tokens

| Token       | Hex     | ใช้สำหรับ                    |
| ----------- | ------- | ---------------------------- |
| `--blue`    | #185FA5 | Primary action, active state |
| `--green`   | #0F6E56 | P/L บวก, Success             |
| `--red`     | #993C1D | P/L ลบ, Error, ปุ่มปิดฟาร์ม  |
| `--amber`   | #BA7517 | Warning, ต้องเพิ่มเงิน       |
| `--text`    | #1a1a18 | เนื้อหาหลัก                  |
| `--text2`   | #5f5e5a | Label, subtitle              |
| `--bg`      | #f5f5f0 | Background                   |
| `--surface` | #ffffff | Card background              |

---

## 7. Edge Cases

| Scenario                           | Behavior                                                               |
| ---------------------------------- | ---------------------------------------------------------------------- |
| ราคาปัจจุบัน > priceMax            | แสดง Warning "ราคาสูงกว่า Grid สูงสุด — ระบบหยุดวางคำสั่งซื้อชั่วคราว" |
| ราคาปัจจุบัน < priceMin            | แสดง Warning "ราคาต่ำกว่า Grid ต่ำสุด — ระบบหยุดวางคำสั่งขายชั่วคราว"  |
| shares = 0                         | Cost Value = 0, Cost/Share = N/A                                       |
| Need Investment = 0                | block submit — config ไม่ครบ                                           |
| ปิดฟาร์มระหว่างที่มีคำสั่งค้างอยู่ | แสดง note "คำสั่งที่ค้างอยู่จะถูกยกเลิกทั้งหมด" ก่อน consent           |
| แก้ config ให้ Grid Levels น้อยลง  | ต้องขายหุ้นส่วนเกินออกก่อน — แสดง note อธิบาย                          |

---

## 8. สรุป Scope ที่ต้องพัฒนา

- [ ] Farming Main Page (Empty + With Farms state)
- [ ] Farm Chip component (Active indicator, scroll)
- [ ] New Farm Form (validation, real-time calculation)
- [ ] Backtest Performance Section (simulated data)
- [ ] Candlestick Chart + Grid Lines overlay
- [ ] Farm Detail — Tab: Overview (7 fields + trade stats)
- [ ] Farm Detail — Tab: Config (pre-fill form + diff calculation)
- [ ] Close Farm flow (2 options + consent)
- [ ] Warning Banner (ราคาออกนอก range)
- [ ] Responsive layout (mobile breakpoint ≤900px)
- [ ] All error/warning/success states
