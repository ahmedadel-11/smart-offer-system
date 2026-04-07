# Offer Data Endpoints

This document describes the newly added endpoints to retrieve technical and commercial offer structures in JSON format. These endpoints share the same business logic and formatting as their PDF export counterparts but provide raw data for frontend integration or external API consumers.

## 1. Get Technical Offer Data

Retrieves the structured technical details for a specific project. This includes project details and a list of all panels along with their materials (items), formatted specifically for a technical offer presentation.

**Endpoint:**
`GET /api/Projects/{id}/technical-offer`

**Authorization:**
Requires authentication and authorization (Policy: `TenderingEngineer` or proper project access).

**Parameters:**
- `id` (integer, path): The ID of the project.

**Response (200 OK):**
```json
{
  "projectName": "Sample Project",
  "customer": "John Doe",
  "panels": [
    {
      "panelName": "Main Distribution Board",
      "items": [
        {
          "itemCode": "CBP-001",
          "description": "Circuit Breaker 100A",
          "brand": "Schneider",
          "ratedCurrent": "100A",
          "isc": "25kA",
          "poles": 3,
          "reference": "NSX100N",
          "quantity": 2
        }
      ]
    }
  ]
}
```

**Errors:**
- `403 Forbidden`: User does not have access to the project.
- `404 Not Found`: Project with the specified `id` does not exist.

---

## 2. Get Commercial Offer Data

Retrieves the structured commercial details for a specific project. This includes project metadata, summarized pricing, cost, margin per panel, and total project commercial details (grand totals).

**Endpoint:**
`GET /api/Projects/{id}/commercial-offer`

**Authorization:**
Requires authentication and authorization (Policy: `TenderingEngineer` or proper project access).

**Parameters:**
- `id` (integer, path): The ID of the project.

**Response (200 OK):**
```json
{
  "projectName": "Sample Project",
  "customer": "John Doe",
  "currency": "USD",
  "date": "2024-05-20",
  "status": "InTendering",
  "panels": [
    {
      "name": "Main Distribution Board",
      "items": 15,
      "totalCost": 12500.00,
      "marginAmount": 2500.00,
      "totalPrice": 15000.00
    }
  ],
  "grandTotalItems": 15,
  "grandTotalCost": 12500.00,
  "grandTotalMargin": 2500.00,
  "grandTotalPrice": 15000.00
}
```

**Errors:**
- `403 Forbidden`: User does not have access to the project.
- `404 Not Found`: Project with the specified `id` does not exist.

---

## Data Transfer Objects (DTOs)

### `TechnicalOfferDto`
Represents the core container for the technical offer.
- `projectName` (string): The overall project name.
- `customer` (string): The assigned customer for the project.
- `panels` (List of `TechnicalOfferPanelDto`): The technical composition of each panel.

### `TechnicalOfferPanelDto`
Represents technical data grouped by panel.
- `panelName` (string): The specific name of the panel.
- `items` (List of `TechnicalOfferItemDto`): The bill of materials for this specific panel.

### `TechnicalOfferItemDto`
Represents individual material items with their technical specifications.
- `itemCode` (string): Material code.
- `description` (string): Item description.
- `brand` (string, optional): Associated brand.
- `ratedCurrent` (string, optional): The rated current measurement (e.g., "100A").
- `isc` (string, optional): Short circuit breaking capacity.
- `poles` (int, optional): The number of poles.
- `reference` (string, optional): Manufacturer reference code.
- `quantity` (int): Required quantity for the given panel.

### `CommercialOfferDto`
Represents the core financial and commercial summary.
- `projectName` (string): Project name.
- `customer` (string): Customer name.
- `currency` (string): The configured currency (e.g., USD, EUR).
- `date` (string): The date the offer is generated (UTC formatted component `yyyy-MM-dd`).
- `status` (string): Current project status text.
- `panels` (List of `CommercialOfferPanelDto`): Aggregate commercial data broken down per panel.
- `grandTotalItems` (int): Sum of all panel item quantities.
- `grandTotalCost` (decimal): Overall project cost calculation.
- `grandTotalMargin` (decimal): Overall project margin amount calculation.
- `grandTotalPrice` (decimal): Final combined valid technical selling price.

### `CommercialOfferPanelDto`
Represents the commercial costings associated with an individual panel.
- `name` (string): The name of the respective panel.
- `items` (int): The amount total calculated quantity of equipment enclosed.
- `totalCost` (decimal): Base total cost for this panel.
- `marginAmount` (decimal): Total margin amount obtained from this respective panel.
- `totalPrice` (decimal): Combined end-user total price associated.
