# Busbar & Cables Worksheet

This document describes the **Busbar & Cables** worksheet behavior (`ItemType = 4`) in SmartOffer.

---

## Purpose

`BusbarAndCables` is treated as an **engineering calculation sheet**, not as a normal material row.

Engineers enter lengths and counts, then the backend calculates:

- `Total (mt)` per row
- `Total (Kg)` per row
- section totals in KG
- grand total in KG

---

## API Endpoints

### 1) Calculate worksheet totals (no save)

**`POST /api/PanelItems/busbar-cables/calculate`**

**Authorization:** `TenderingEngineer` policy

**Behavior:**

- accepts worksheet input rows
- returns calculated rows + totals
- does **not** persist data

### 2) Save worksheet as `PanelItem` (`ItemType = 4`)

**`POST /api/PanelItems/busbar-cables/panel/{panelId}`**

**Authorization:** `TenderingEngineer` policy

**Behavior:**

- calculates the worksheet
- creates or updates one `PanelItem` in that panel with:
  - `ItemType = BusbarAndCables (4)`
  - `Quantity = 1`
  - `Notes = JSON payload` containing `Input` and `Result`
- returns the saved `PanelItemDto`

### 3) Get saved worksheet for panel

**`GET /api/PanelItems/busbar-cables/panel/{panelId}`**

Returns the saved worksheet payload:

- `panelItemId`
- `panelId`
- `input`
- `result`

If no worksheet is saved for that panel: `404 Not Found`.

---

## Storage Model

The sheet is stored as a normal `PanelItem` row:

- `PanelId` = target panel
- `ItemType` = `4`
- `MaterialId` = internal system material (`SYS-BUSBAR-CABLES`)
- `Quantity` = `1`
- `Notes` = serialized JSON with full worksheet input + calculated result

This keeps compatibility with current schema while persisting engineer worksheet data.

---

## Worksheet Sections

The sheet contains 3 sections:

1. `MainBusbar`
2. `NeutralEarthBar`
3. `Connection`

---

## Field Definitions

### Common fields

- `Size`: busbar size text (examples: `(25*5)`, `(80*10)`)
- `Bars`: number of bars (`J` in your sheet)

### Main Busbar fields

- `Poles` (`K`)
- `VrMeters` (vertical/riser length, corresponds to your `V/R (mt)` / `L`)
- `HorizontalMeters` (horizontal length, corresponds to your `Horz. (mt)` / `M`)

### Neutral + Earth Bar fields

- `NeutralMeters` (`N (mt)`)
- `EarthMeters` (`E (mt)`)

### Connection fields

- `Poles` (`K`)
- `CustomMeters` (`Cust. (mt)` / `L`)
- `BbMeters` (`BB (mt)` / `M`)

---

## Formulas

### Coefficient used

```text
coefficient = 1.11 * 1.1 = 1.221
```

### Main Busbar

```text
Total (mt) = VrMeters + HorizontalMeters
Total (Kg) = Bars * Poles * Total (mt) * 1.11 * 1.1
```

### Neutral + Earth Bar

```text
Total (mt) = NeutralMeters + EarthMeters
Total (Kg) = Bars * Total (mt) * 1.11 * 1.1
```

> `Poles` is not part of this section in the current API model.

### Connection

```text
Total (mt) = CustomMeters + BbMeters
Total (Kg) = Bars * Poles * Total (mt) * 1.11 * 1.1
```

### Totals

```text
MainBusbarTotalKg   = sum(MainBusbar[].TotalKg)
NeutralEarthTotalKg = sum(NeutralEarthBar[].TotalKg)
ConnectionTotalKg   = sum(Connection[].TotalKg)
GrandTotalKg        = MainBusbarTotalKg + NeutralEarthTotalKg + ConnectionTotalKg
```

### Rounding

All `TotalMeters`, `TotalKg`, and totals are rounded to **2 decimal places**.

---

## Request Model (JSON)

```json
{
  "mainBusbar": [
    {
      "size": "(25*5)",
      "bars": 2,
      "poles": 4,
      "vrMeters": 1.5,
      "horizontalMeters": 2.0
    }
  ],
  "neutralEarthBar": [
    {
      "size": "(25*5)",
      "bars": 1,
      "neutralMeters": 2.0,
      "earthMeters": 1.0
    }
  ],
  "connection": [
    {
      "size": "(50*10)",
      "bars": 2,
      "poles": 3,
      "customMeters": 1.2,
      "bbMeters": 0.8
    }
  ]
}
```

---

## Response Model (JSON)

```json
{
  "mainBusbar": [
    {
      "size": "(25*5)",
      "bars": 2,
      "poles": 4,
      "vrMeters": 1.5,
      "horizontalMeters": 2.0,
      "totalMeters": 3.5,
      "totalKg": 34.19
    }
  ],
  "neutralEarthBar": [
    {
      "size": "(25*5)",
      "bars": 1,
      "neutralMeters": 2.0,
      "earthMeters": 1.0,
      "totalMeters": 3.0,
      "totalKg": 3.66
    }
  ],
  "connection": [
    {
      "size": "(50*10)",
      "bars": 2,
      "poles": 3,
      "customMeters": 1.2,
      "bbMeters": 0.8,
      "totalMeters": 2.0,
      "totalKg": 14.65
    }
  ],
  "mainBusbarTotalKg": 34.19,
  "neutralEarthTotalKg": 3.66,
  "connectionTotalKg": 14.65,
  "grandTotalKg": 52.5
}
```

---

## Notes / Constraints

- Empty sections are allowed (`[]`).
- Zero values are allowed and return zero totals.
- Use decimal values for meters.
- Save endpoint respects lock rules; if project is locked it returns `400`.

---

## Related Code

- `src/SmartOffer.API/Controllers/PanelItemsController.cs`
- `src/SmartOffer.Application/Interfaces/IPanelItemService.cs`
- `src/SmartOffer.Application/Services/PanelItemService.cs`
- `src/SmartOffer.Application/DTOs/PanelItemDto.cs`
- `src/SmartOffer.Domain/Enums/PanelItemType.cs`
