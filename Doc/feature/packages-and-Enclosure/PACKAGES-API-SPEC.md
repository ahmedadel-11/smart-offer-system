# Packages API Specification

## Overview

This document provides detailed API specifications for the Packages feature endpoints.

**Base URL**: `/api/packages`  
**Authentication**: Bearer Token (JWT)  
**Content-Type**: `application/json`

---

## Endpoints

### 1. GET /api/packages

**Description**: Retrieve all active packages

**Authentication**: Required (`packages:view` permission)

**Request**
```http
GET /api/packages HTTP/1.1
Authorization: Bearer <token>
```

**Query Parameters**: None

**Response 200 OK**
```json
[
  {
    "packageId": 1,
    "packageName": "Panel Enclosure 1",
    "description": "Standard panel enclosure with DIN rail",
    "isActive": true,
    "createdAt": "2025-04-20T10:00:00Z",
    "updatedAt": null,
    "createdByUserId": "550e8400-e29b-41d4-a716-446655440000",
    "updatedByUserId": null,
    "items": [
      {
        "packageItemId": 1,
        "packageId": 1,
        "materialId": 5,
        "quantity": 2,
        "materialCode": "DIN-RAIL-35MM",
        "materialDescription": "DIN Rail 35mm",
        "materialBasePrice": 25.50
      }
    ]
  }
]
```

**Response 403 Forbidden**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403,
  "detail": "Insufficient permissions to view packages"
}
```

**Response 401 Unauthorized**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.3.1",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Missing or invalid authentication token"
}
```

---

### 2. GET /api/packages/{packageId}

**Description**: Retrieve a specific package by ID

**Authentication**: Required (`packages:view` permission)

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| packageId | integer | Yes | The package ID |

**Request**
```http
GET /api/packages/1 HTTP/1.1
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{
  "packageId": 1,
  "packageName": "Panel Enclosure 1",
  "description": "Standard panel enclosure with DIN rail",
  "isActive": true,
  "createdAt": "2025-04-20T10:00:00Z",
  "updatedAt": null,
  "createdByUserId": "550e8400-e29b-41d4-a716-446655440000",
  "updatedByUserId": null,
  "items": [
    {
      "packageItemId": 1,
      "packageId": 1,
      "materialId": 5,
      "quantity": 2,
      "materialCode": "DIN-RAIL-35MM",
      "materialDescription": "DIN Rail 35mm",
      "materialBasePrice": 25.50
    },
    {
      "packageItemId": 2,
      "packageId": 1,
      "materialId": 12,
      "quantity": 1,
      "materialCode": "BUSBAR-CONN",
      "materialDescription": "Busbar Connector",
      "materialBasePrice": 15.00
    }
  ]
}
```

**Response 404 Not Found**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Package with ID 999 not found"
}
```

---

### 3. GET /api/packages/search

**Description**: Search packages by name or description

**Authentication**: Required (`packages:view` permission)

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| term | string | Yes | Search term (min 1 char) |

**Request**
```http
GET /api/packages/search?term=enclosure HTTP/1.1
Authorization: Bearer <token>
```

**Response 200 OK**
```json
[
  {
    "packageId": 1,
    "packageName": "Panel Enclosure 1",
    "description": "Standard panel enclosure with DIN rail",
    "isActive": true,
    "createdAt": "2025-04-20T10:00:00Z",
    "updatedAt": null,
    "createdByUserId": "550e8400-e29b-41d4-a716-446655440000",
    "updatedByUserId": null,
    "items": []
  }
]
```

---

### 4. POST /api/packages

**Description**: Create a new package

**Authentication**: Required (`packages:create` permission)

**Request Headers**
```http
POST /api/packages HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "packageName": "Panel Enclosure 1",
  "description": "Standard panel enclosure with DIN rail and connectors",
  "items": [
    {
      "materialId": 5,
      "quantity": 2
    },
    {
      "materialId": 12,
      "quantity": 1
    },
    {
      "materialId": 18,
      "quantity": 3
    }
  ]
}
```

**Request Body Schema**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| packageName | string | Yes | Max 200 chars, must be unique |
| description | string | No | Max 500 chars |
| items | array | Yes | Min 1 item, each with materialId and quantity |
| items[].materialId | integer | Yes | Must exist in Materials table |
| items[].quantity | integer | Yes | Must be > 0 |

**Response 201 Created**
```json
{
  "packageId": 1,
  "packageName": "Panel Enclosure 1",
  "description": "Standard panel enclosure with DIN rail and connectors",
  "isActive": true,
  "createdAt": "2025-04-20T10:00:00Z",
  "updatedAt": null,
  "createdByUserId": "550e8400-e29b-41d4-a716-446655440000",
  "updatedByUserId": null,
  "items": [
    {
      "packageItemId": 1,
      "packageId": 1,
      "materialId": 5,
      "quantity": 2,
      "materialCode": "DIN-RAIL-35MM",
      "materialDescription": "DIN Rail 35mm",
      "materialBasePrice": 25.50
    },
    {
      "packageItemId": 2,
      "packageId": 1,
      "materialId": 12,
      "quantity": 1,
      "materialCode": "BUSBAR-CONN",
      "materialDescription": "Busbar Connector",
      "materialBasePrice": 15.00
    },
    {
      "packageItemId": 3,
      "packageId": 1,
      "materialId": 18,
      "quantity": 3,
      "materialCode": "CABLE-GLAND-M20",
      "materialDescription": "Cable Gland M20",
      "materialBasePrice": 5.00
    }
  ]
}
```

**Response 400 Bad Request** - Duplicate name
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Package with name 'Panel Enclosure 1' already exists."
}
```

**Response 400 Bad Request** - Invalid material
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Material with ID 999 not found."
}
```

**Response 403 Forbidden**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403,
  "detail": "Insufficient permissions to create packages"
}
```

---

### 5. PUT /api/packages/{packageId}

**Description**: Update an existing package

**Authentication**: Required (`packages:edit` permission)

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| packageId | integer | Yes | The package ID |

**Request Headers**
```http
PUT /api/packages/1 HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "packageName": "Panel Enclosure 1 - Updated",
  "description": "Updated description",
  "items": [
    {
      "materialId": 5,
      "quantity": 2
    },
    {
      "materialId": 12,
      "quantity": 2
    }
  ]
}
```

**Response 200 OK**
```json
{
  "packageId": 1,
  "packageName": "Panel Enclosure 1 - Updated",
  "description": "Updated description",
  "isActive": true,
  "createdAt": "2025-04-20T10:00:00Z",
  "updatedAt": "2025-04-21T15:30:00Z",
  "createdByUserId": "550e8400-e29b-41d4-a716-446655440000",
  "updatedByUserId": "660e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "packageItemId": 1,
      "packageId": 1,
      "materialId": 5,
      "quantity": 2,
      "materialCode": "DIN-RAIL-35MM",
      "materialDescription": "DIN Rail 35mm",
      "materialBasePrice": 25.50
    },
    {
      "packageItemId": 2,
      "packageId": 1,
      "materialId": 12,
      "quantity": 2,
      "materialCode": "BUSBAR-CONN",
      "materialDescription": "Busbar Connector",
      "materialBasePrice": 15.00
    }
  ]
}
```

**Response 404 Not Found**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Package with ID 999 not found."
}
```

**Response 400 Bad Request** - Name conflict
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Package with name 'Existing Name' already exists."
}
```

---

### 6. DELETE /api/packages/{packageId}/deactivate

**Description**: Deactivate a package (soft delete)

**Authentication**: Required (`packages:deactivate` permission)

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| packageId | integer | Yes | The package ID |

**Request**
```http
DELETE /api/packages/1/deactivate HTTP/1.1
Authorization: Bearer <token>
```

**Response 204 No Content**
```
(empty response body)
```

**Response 404 Not Found**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Package with ID 999 not found."
}
```

---

### 7. DELETE /api/packages/{packageId}

**Description**: Permanently delete a package

**Authentication**: Required (`packages:delete` permission - Admin only)

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| packageId | integer | Yes | The package ID |

**Request**
```http
DELETE /api/packages/1 HTTP/1.1
Authorization: Bearer <token>
```

**Response 204 No Content**
```
(empty response body)
```

**Response 404 Not Found**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Package with ID 999 not found."
}
```

**Response 403 Forbidden**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403,
  "detail": "Insufficient permissions to delete packages"
}
```

---

## Data Models

### PackageDto

```json
{
  "packageId": 1,
  "packageName": "string (max 200)",
  "description": "string or null (max 500)",
  "isActive": true,
  "createdAt": "2025-04-20T10:00:00Z",
  "updatedAt": "2025-04-21T15:30:00Z or null",
  "createdByUserId": "550e8400-e29b-41d4-a716-446655440000 or null",
  "updatedByUserId": "550e8400-e29b-41d4-a716-446655440000 or null",
  "items": [
    {
      "packageItemId": 1,
      "packageId": 1,
      "materialId": 5,
      "quantity": 2,
      "materialCode": "DIN-RAIL-35MM",
      "materialDescription": "DIN Rail 35mm",
      "materialBasePrice": 25.50
    }
  ]
}
```

### CreatePackageRequest

```json
{
  "packageName": "string (required, max 200, unique)",
  "description": "string or null (max 500)",
  "items": [
    {
      "materialId": 5,
      "quantity": 2
    }
  ]
}
```

### UpdatePackageRequest

```json
{
  "packageName": "string (required, max 200)",
  "description": "string or null (max 500)",
  "items": [
    {
      "materialId": 5,
      "quantity": 2
    }
  ]
}
```

### PackageItemDto

```json
{
  "packageItemId": 1,
  "packageId": 1,
  "materialId": 5,
  "quantity": 2,
  "materialCode": "DIN-RAIL-35MM",
  "materialDescription": "DIN Rail 35mm",
  "materialBasePrice": 25.50
}
```

---

## Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET or PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error or duplicate name |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Package or material not found |
| 500 | Internal Server Error | Server error |

---

## Error Response Format

All error responses follow this format:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Error Title",
  "status": 400,
  "detail": "Detailed error message"
}
```

---

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token should be obtained from the `/api/auth/login` endpoint.

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding:

- 100 requests per minute per user
- 1000 requests per hour per API key

---

## Examples

### Example 1: Create a Package

**Request**
```bash
curl -X POST http://localhost:5000/api/packages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "packageName": "Enclosure Kit",
    "description": "Complete enclosure package",
    "items": [
      {"materialId": 5, "quantity": 1},
      {"materialId": 10, "quantity": 2}
    ]
  }'
```

**Response** (201 Created)
```json
{
  "packageId": 1,
  "packageName": "Enclosure Kit",
  "description": "Complete enclosure package",
  "isActive": true,
  "createdAt": "2025-04-20T10:00:00Z",
  "updatedAt": null,
  "createdByUserId": "550e8400-e29b-41d4-a716-446655440000",
  "updatedByUserId": null,
  "items": [
    {
      "packageItemId": 1,
      "packageId": 1,
      "materialId": 5,
      "quantity": 1,
      "materialCode": "DIN-RAIL",
      "materialDescription": "DIN Rail",
      "materialBasePrice": 25.00
    },
    {
      "packageItemId": 2,
      "packageId": 1,
      "materialId": 10,
      "quantity": 2,
      "materialCode": "CONNECTOR",
      "materialDescription": "Connector",
      "materialBasePrice": 15.00
    }
  ]
}
```

### Example 2: Search Packages

**Request**
```bash
curl -X GET "http://localhost:5000/api/packages/search?term=enclosure" \
  -H "Authorization: Bearer <token>"
```

**Response** (200 OK)
```json
[
  {
    "packageId": 1,
    "packageName": "Enclosure Kit",
    "description": "Complete enclosure package",
    "isActive": true,
    "createdAt": "2025-04-20T10:00:00Z",
    "updatedAt": null,
    "createdByUserId": "550e8400-e29b-41d4-a716-446655440000",
    "updatedByUserId": null,
    "items": []
  }
]
```

### Example 3: Update Package

**Request**
```bash
curl -X PUT http://localhost:5000/api/packages/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "packageName": "Enclosure Kit v2",
    "description": "Updated enclosure package",
    "items": [
      {"materialId": 5, "quantity": 2}
    ]
  }'
```

**Response** (200 OK)
```json
{
  "packageId": 1,
  "packageName": "Enclosure Kit v2",
  "description": "Updated enclosure package",
  "isActive": true,
  "createdAt": "2025-04-20T10:00:00Z",
  "updatedAt": "2025-04-21T15:30:00Z",
  "createdByUserId": "550e8400-e29b-41d4-a716-446655440000",
  "updatedByUserId": "660e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "packageItemId": 1,
      "packageId": 1,
      "materialId": 5,
      "quantity": 2,
      "materialCode": "DIN-RAIL",
      "materialDescription": "DIN Rail",
      "materialBasePrice": 25.00
    }
  ]
}
```

---

## Versioning

Current API Version: **v1**

Future versions will use:
- `/api/v2/packages` for breaking changes
- Backward compatibility maintained for one major version

---

## Changelog

### v1.0 (Initial Release - 2025-04-20)
- Create packages
- Read packages
- Update packages
- Delete packages
- Search packages
- Deactivate packages
- Permission-based access control
