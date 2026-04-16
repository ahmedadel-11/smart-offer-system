# Multi-Currency Offers + Currency Rate Management

## Overview
This feature enables SmartOffer to generate commercial offer values in different currencies (for example `USD`, `EUR`) while keeping `EGP` as the base pricing currency.

Material prices and pricing calculations are still computed in base EGP, then converted at output time using configurable rates.

---

## What Was Added

### 1) New Currency Rate Entity
Added `CurrencyRate` with fields:
- `Id`
- `CurrencyCode` (unique, uppercase)
- `RateToEgp` (decimal)
- `UpdatedAt`
- `UpdatedByUserId`

Meaning of `RateToEgp`:
- `1 <CurrencyCode> = RateToEgp EGP`
- Example: `USD=50` means `1 USD = 50 EGP`

Conversion used by the system:
- `AmountInTargetCurrency = AmountInEgp / RateToEgp`

---

### 2) New API Endpoints
Controller: `CurrencyRatesController`

- `GET /api/CurrencyRates`
  - Returns all configured currency rates.

- `GET /api/CurrencyRates/{currencyCode}`
  - Returns one currency rate by code (`EGP`, `USD`, `EUR`, ...).

- `PUT /api/CurrencyRates/{currencyCode}`
  - Upsert a currency rate.
  - Requires permission: `System.Configure`.
  - Body:
    ```json
    {
      "rateToEgp": 50
    }
    ```

Notes:
- `EGP` is always treated as base (rate forced to `1`).
- Rate must be greater than `0`.

---

### 3) Project Currency Validation
When creating/updating a project, currency is validated against configured currencies.

If currency is not configured, API returns `400 BadRequest` with an explanatory message.

---

### 4) Multi-Currency Offer Output
Commercial values are converted using configured rates in:

- `GET /api/Projects/{id}/commercial-offer`
- `GET /api/Projects/{id}/export-commercial-offer` (PDF)
- `GET /api/Projects/{id}/export-offer` (Excel)

Additionally, project price/material list endpoints now return monetary values in project currency as well:
- `GET /api/Projects/{id}/total-price`
- `GET /api/Projects/{id}/material-list`

---

## Defaults Seeded
On startup, seeding ensures these base rates exist if missing:
- `EGP = 1`
- `USD = 50`
- `EUR = 54`

You can update them at any time using `PUT /api/CurrencyRates/{currencyCode}`.

---

## Database Changes
Migration added:
- `20260415090236_AddCurrencyRatesAndConversionSupport`

Creates table:
- `CurrencyRates`

Run:
```bash
dotnet ef database update --project src/SmartOffer.Infrastructure --startup-project src/SmartOffer.API
```

---

## Example Flow
1. Set rate:
   - `PUT /api/CurrencyRates/USD` with `{ "rateToEgp": 50 }`
2. Create/update project with `currency = "USD"`
3. Generate commercial offer endpoints
4. Returned totals/prices are automatically converted from EGP to USD
