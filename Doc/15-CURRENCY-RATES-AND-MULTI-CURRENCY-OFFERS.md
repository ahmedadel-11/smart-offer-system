# Frontend Integration: Multi-Currency Offers + Currency Rates

## Goal
Allow users to:
1. Generate commercial offers in selected project currency (`EGP`, `USD`, `EUR`, ...)
2. Manage currency rates through new backend endpoints

---

## New Types

```ts
export interface CurrencyRateDto {
  currencyCode: string;
  rateToEgp: number;
  updatedAt: string;
  updatedByUserId?: string | null;
}

export interface UpdateCurrencyRateDto {
  rateToEgp: number;
}
```

---

## New API Endpoints

- `GET /api/CurrencyRates`
- `GET /api/CurrencyRates/{currencyCode}`
- `PUT /api/CurrencyRates/{currencyCode}` (requires `System.Configure`)

### Example update request
```json
{
  "rateToEgp": 50
}
```

---

## UI Tasks

### 1) Currency Rates Admin Page
Create page like `/settings/currency-rates`:
- table columns: `Currency`, `Rate To EGP`, `Updated At`
- inline edit or modal to update `rateToEgp`
- validation: `rateToEgp > 0`

### 2) Project Create/Edit Forms
- currency field should use uppercase values (`EGP`, `USD`, `EUR`)
- show only supported currencies (from `GET /api/CurrencyRates` + always `EGP`)
- handle backend validation error for unsupported currency

### 3) Offer/Price Screens
No calculation on frontend required.
Backend now returns converted values based on project currency for:
- commercial offer JSON
- commercial PDF export
- offer Excel export
- project total-price/material-list monetary values

---

## Important Conversion Rule (Backend)
Backend stores base amounts in EGP and converts using:

`target = egp / rateToEgp`

Example:
- `rateToEgp(USD)=50`
- `5000 EGP => 100 USD`

---

## Prompt for Frontend AI Agent

```text
Implement currency-rate management and multi-currency offer support in frontend.

Requirements:
1) Add API client methods for:
   - GET /api/CurrencyRates
   - GET /api/CurrencyRates/{currencyCode}
   - PUT /api/CurrencyRates/{currencyCode}
2) Add TS models:
   - CurrencyRateDto
   - UpdateCurrencyRateDto
3) Build settings page for currency rates:
   - list all rates
   - update rateToEgp (must be > 0)
   - protect UI action by permission System.Configure
4) Update project create/edit currency dropdown to use supported currencies from API.
5) Do not recalculate prices on frontend.
   Use backend-returned values for commercial offer and total-price/material-list.
6) Keep all code type-safe and lint-clean.
```
