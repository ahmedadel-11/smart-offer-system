# Offer Data Endpoints Implementation Guide

## Summary of Changes

I've integrated the **Technical and Commercial Offer Data Endpoints** into your frontend application based on the OFFER-DATA-ENDPOINTS.md specification.

---

## 1. **New Type Definitions** (src/types/index.ts)

Added four new DTOs that match the API specification:

### Technical Offer DTOs:
- **`TechnicalOfferDto`** - Main response object containing projectName, customer, and panels array
- **`TechnicalOfferPanelDto`** - Panel data with panelName and items array
- **`TechnicalOfferItemDto`** - Individual item with technical specs (code, description, brand, ratedCurrent, isc, poles, reference, quantity)

### Commercial Offer DTOs:
- **`CommercialOfferDto`** - Main response object with financial data (projectName, customer, currency, date, status, panels, grand totals)
- **`CommercialOfferPanelDto`** - Panel commercial data (name, items count, totalCost, marginAmount, totalPrice)

---

## 2. **API Service Methods** (src/services/offerService.ts)

Added two new async methods to `offerService`:

```typescript
// Fetch technical offer data
getTechnicalOfferData(projectId: number): Promise<TechnicalOfferDto>
// Endpoint: GET /api/Projects/{id}/technical-offer

// Fetch commercial offer data  
getCommercialOfferData(projectId: number): Promise<CommercialOfferDto>
// Endpoint: GET /api/Projects/{id}/commercial-offer
```

Both methods automatically handle authentication (Bearer token) via the existing `apiClient` which has interceptors.

---

## 3. **React Hooks** (src/hooks/useOfferData.ts)

Created three custom hooks for seamless component integration:

### `useTechnicalOfferData(projectId: number)`
```typescript
const { data, isLoading, error } = useTechnicalOfferData(projectId);
```
- Automatically fetches technical offer data when projectId changes
- Returns loading state and error handling
- Data is cached in component state

### `useCommercialOfferData(projectId: number)`
```typescript
const { data, isLoading, error } = useCommercialOfferData(projectId);
```
- Automatically fetches commercial offer data
- Same pattern as technical hook

### `useOfferData(projectId: number)`
```typescript
const { technical, commercial, isLoading, error } = useOfferData(projectId);
```
- Fetches both datasets in parallel
- Returns combined loading/error states

---

## Usage Examples

### In Components:

```typescript
import { useTechnicalOfferData, useCommercialOfferData } from '../../hooks';

export const MyOfferComponent: React.FC = () => {
  const projectId = 123;
  
  // Fetch technical offer data
  const { data: technicalOffer, isLoading, error } = useTechnicalOfferData(projectId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>{technicalOffer?.projectName}</h2>
      <p>Customer: {technicalOffer?.customer}</p>
      
      {technicalOffer?.panels.map((panel) => (
        <div key={panel.panelName}>
          <h3>{panel.panelName}</h3>
          <ul>
            {panel.items.map((item) => (
              <li key={item.itemCode}>
                {item.itemCode} - {item.description} (Qty: {item.quantity})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
```

### Direct Service Usage:

```typescript
import { offerService } from '../../services/offerService';

// Direct API call
const technicalData = await offerService.getTechnicalOfferData(projectId);
const commercialData = await offerService.getCommercialOfferData(projectId);
```

---

## Integration Points

These new endpoints can be integrated into:

1. **OfferGeneratorPage** - Use hooks to fetch fresh data before PDF generation
2. **Offers Page** - Display offer data tables before generating PDFs or exports
3. **Export Features** - Use API data for more accurate exports
4. **Dashboard** - Show offer summaries and commercial data

---

## API Response Structure

### Technical Offer Response:
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

### Commercial Offer Response:
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

---

## Error Handling

Both hooks automatically handle errors:
- Network errors trigger error state
- Logged to console for debugging
- Returns null for data if error occurs
- Components can check `error` property

---

## Next Steps

1. **Update OfferGeneratorPage** to use the new hooks for real-time data
2. **Create offer display components** to show technical and commercial data
3. **Integrate with PDF generation** to use fresh API data
4. **Add export options** using the new DTOs
5. **Create dashboard views** showing offer summary data
