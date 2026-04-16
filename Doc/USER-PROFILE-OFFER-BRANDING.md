# User Profile Enhancement: Mobile Number + Logo/Watermark

## Overview
This feature adds two new profile fields to each user:

1. `mobileNumber`
2. `logoOrWatermark` (image)

These fields are saved per user and used during offer generation.

---

## Backend Scope Implemented

### 1) Domain
Updated `User` entity with:
- `MobileNumber` (`string?`)
- `LogoOrWatermark` (`string?`) → image source value (base64/data-url/local path)

### 2) Database
Added EF Core migration:
- `20260415070814_AddUserMobileAndLogoWatermark`

New columns in `Users` table:
- `MobileNumber` → `nvarchar(20)` nullable
- `LogoOrWatermark` → `nvarchar(max)` nullable

### 3) DTOs
Updated user DTOs:
- `UserDto`
- `CreateUserDto`
- `UpdateUserDto`

New properties:
- `mobileNumber?: string`
- `logoOrWatermark?: string` (image source)

### 4) Services
Updated mapping and persistence in:
- `UserService`
- `AuthService`

So the new fields are included in:
- create user
- update user
- user profile responses
- login/refresh response user payload

### 5) PDF Offer Integration
Updated:
- `IPdfExportService`
- `ProjectsController`
- `PdfExportService`

Behavior:
- PDF export endpoints pass current authenticated user id.
- Export service loads that user.
- User data is included in offer output:
  - `MobileNumber` shown as `Mobile`.
  - `LogoOrWatermark` is rendered as an image when valid image data is provided.

Supported `logoOrWatermark` formats in backend rendering:
- Data URL (e.g. `data:image/png;base64,...`)
- Raw base64 image string
- Local file path on server (if exists)

---

## API Impact Summary

### User payloads now include
```json
{
  "mobileNumber": "+201234567890",
  "logoOrWatermark": "data:image/png;base64,iVBORw0KGgoAAA..."
}
```

### Existing endpoints used (no new endpoints required)
- `GET /api/users/{id}`
- `GET /api/users/me`
- `POST /api/users`
- `PUT /api/users/{id}`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/projects/{id}/export-technical-offer`
- `GET /api/projects/{id}/export-commercial-offer`

---

## Validation Rules (Current)
- `mobileNumber`: optional, max length `20`
- `logoOrWatermark`: optional (stored as `nvarchar(max)` image source)

No strict phone pattern validation is enforced yet.

---

## Acceptance Criteria
- User can save `mobileNumber` and image `logoOrWatermark`.
- Returned user/profile/auth responses include both fields.
- Exported technical/commercial PDFs include current user mobile number and image logo/watermark when provided.
- Migration applied successfully and build passes.
