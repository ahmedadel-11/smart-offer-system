# Frontend Integration — Enclosure Category Control

## Goal
Allow the frontend to control which material categories are included when calling:

`GET /api/materials/category/Enclosure`

Instead of returning only materials whose category is exactly `Enclosure`, the backend now returns materials from a managed mapping list.

---

## What Changed
A new backend feature was added:
- persistent enclosure category mappings (`EnclosureCategoryMappings` table)
- APIs to manage mapped categories
- `GET /api/materials/category/Enclosure` now resolves to mapped categories
- enclosure mappings are now restricted to categories that already exist in `Materials.Category`

---

## APIs for Frontend

## 1) Get available categories from Materials table
**GET** `/api/materials/available-categories`

### Response
```json
[
  "Switchboards",
  "Cabinets",
  "MCC",
  "System"
]
```

Use this endpoint to populate the category selector when adding enclosure mappings.

---

## 2) Get mapped enclosure categories
**GET** `/api/materials/enclosure-categories`

### Response
```json
[
  {
    "enclosureCategoryMappingId": 1,
    "categoryName": "Switchboards"
  },
  {
    "enclosureCategoryMappingId": 2,
    "categoryName": "Cabinets"
  }
]
```

---

## 3) Add category to enclosure mapping
**POST** `/api/materials/enclosure-categories`

### Request
```json
{
  "categoryName": "Cabinets"
}
```

### Response
```json
{
  "enclosureCategoryMappingId": 3,
  "categoryName": "Cabinets"
}
```

### Notes
- requires `Materials.Edit` permission
- duplicate category names are rejected
- category must exist in `Materials` table

---

## 4) Remove category from enclosure mapping
**DELETE** `/api/materials/enclosure-categories/{id}`

### Example
`DELETE /api/materials/enclosure-categories/3`

### Notes
- requires `Materials.Edit` permission

---

## 5) Get enclosure materials (final consumer endpoint)
**GET** `/api/materials/category/Enclosure`

### Behavior
- backend loads all mapped categories
- returns active materials whose `Category` is in the mapped list
- if no mappings exist, response is an empty list

---

## Frontend Implementation Steps

1. Add a settings section/page: **Enclosure Categories**.
2. On load, call both:
   - `GET /api/materials/available-categories`
   - `GET /api/materials/enclosure-categories`
3. Show mapped categories table:
   - Mapping Id
   - Category Name
   - Remove action
4. Add selector for new mapping:
   - source options from `available-categories`
   - save button → `POST /api/materials/enclosure-categories`
5. Add remove button per row:
   - call `DELETE /api/materials/enclosure-categories/{id}`
6. In enclosure ready-selection flow, keep using:
   - `GET /api/materials/category/Enclosure`

No frontend change is needed in the ready enclosure picker endpoint itself; only the category mapping management UI is new.

---

## Suggested UI Validation
- categoryName must be selected from available categories
- block empty values
- block duplicate mapped category in UI before submit if possible
- show backend error if category is invalid or duplicate

---

## Suggested UX
- Show success toast after add/remove
- Refresh mapping list after add/remove
- Disable add button while request is in progress
- Confirm before delete

---

## Acceptance Criteria
- User can add enclosure categories from existing Materials categories only
- User can remove enclosure categories from frontend
- `GET /api/materials/category/Enclosure` reflects mapping updates immediately
- Ready Enclosure picker shows materials from mapped categories only
