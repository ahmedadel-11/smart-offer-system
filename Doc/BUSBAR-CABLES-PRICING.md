# Busbar & Cables Pricing (Default vs Manual)

This feature allows frontend users to save Busbar & Cables (`ItemType = 4`) using either:

- system default price per KG, or
- manual price per KG entered by engineer.

---

## Endpoint

### Save Busbar & Cables with price option

`POST /api/PanelItems/busbar-cables/panel/{panelId}/save-with-price`

Authorization: `TenderingEngineer`

---

## Request Body

```json
{
  "input": {
    "mainBusbar": [
      {
        "size": "(20*5)",
        "bars": 1,
        "poles": 2,
        "vrMeters": 1.2,
        "horizontalMeters": 3.5
      }
    ],
    "neutralEarthBar": [],
    "connection": []
  },
  "useDefaultPrice": false,
  "manualPricePerKg": 4.75
}
```

### Fields

- `input`: full worksheet rows
- `useDefaultPrice`:
  - `true` => use system default price/KG
  - `false` => use `manualPricePerKg`
- `manualPricePerKg`: required when `useDefaultPrice = false`

---

## Pricing Formula

- `TotalKg = result.grandTotalKg`
- `AppliedPricePerKg = default or manual`
- `TotalCost = TotalKg * AppliedPricePerKg`

All monetary and KG totals are rounded to 2 decimals.

---

## Storage Behavior

Saved as one `PanelItem` in the target panel:

- `ItemType = BusbarAndCables (4)`
- `MaterialId = SYS-BUSBAR-CABLES` (system material)
- `Quantity = 1`
- `Notes` stores JSON payload with:
  - `Input`
  - `Result`
  - `Pricing`

If a Busbar & Cables item already exists for the panel, it is updated.

---

## Read Back

Use:

`GET /api/PanelItems/busbar-cables/panel/{panelId}`

Response now includes pricing snapshot:

```json
{
  "panelItemId": 101,
  "panelId": 12,
  "input": { },
  "result": {
    "grandTotalKg": 125.4
  },
  "pricing": {
    "defaultPricePerKg": 3.5,
    "appliedPricePerKg": 4.75,
    "priceSource": "Manual",
    "totalKg": 125.4,
    "totalCost": 595.65
  }
}
```

---

## Validation Rules

- manual price is required when `useDefaultPrice = false`
- manual price cannot be negative
- default price cannot be negative
- locked project cannot be modified

---

## Backward Compatibility

Old endpoint still works:

`POST /api/PanelItems/busbar-cables/panel/{panelId}`

It now internally saves using default price mode.
