# Frontend Task: User Mobile + Logo/Watermark Integration

Use this document as the exact implementation guide for frontend updates.

## Objective
Add support in frontend for two user profile fields:
- `mobileNumber`
- `logoOrWatermark` (image)

These values must be editable and saved per user, and will be used automatically by backend during PDF offer export.

---

## 1) Update TypeScript Models
Update user-related interfaces:

```ts
interface UserDto {
  id: string;
  fullName: string;
  email: string;
  username: string;
  mobileNumber?: string | null;
  logoOrWatermark?: string | null; // image source (data-url/base64)
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  roles: string[];
  permissions: string[];
}

interface CreateUserDto {
  fullName: string;
  email: string;
  username: string;
  password: string;
  mobileNumber?: string;
  logoOrWatermark?: string; // image source (data-url/base64)
  isActive: boolean;
  roleIds: string[];
}

interface UpdateUserDto {
  fullName: string;
  email: string;
  username: string;
  mobileNumber?: string;
  logoOrWatermark?: string; // image source (data-url/base64)
  isActive: boolean;
}
```

---

## 2) Update User Create/Edit Forms
In admin user management forms:

### Add fields
1. **Mobile Number**
   - text input
   - max length 20
   - optional
   - placeholder: `+201234567890`

2. **Logo / Watermark Image**
   - file input (`accept="image/*"`) OR image URL/base64 input
   - optional
   - if file input is used, convert image to base64 data-url before submit
   - helper text: `Used in generated offers as logo/watermark`

### Validation (frontend)
- `mobileNumber.length <= 20`
- for image uploads, apply reasonable size limit (e.g. 1-2 MB)

---

## 3) Update Profile Page (`/api/users/me` usage)
Where current user profile is shown:
- Display `mobileNumber`
- Display image preview for `logoOrWatermark` when provided

If profile edit is supported, allow updating both fields via existing user update flow.

---

## 4) API Integration
No new endpoints are required. Use existing endpoints:
- `POST /api/users`
- `PUT /api/users/{id}`
- `GET /api/users/{id}`
- `GET /api/users/me`
- `POST /api/auth/login` (user payload now includes these fields)
- `POST /api/auth/refresh` (user payload now includes these fields)

`logoOrWatermark` should be sent as image source string (preferably data-url/base64).

---

## 5) Offer Export UX Note
PDF export endpoints already consume current authenticated user profile on backend:
- `GET /api/projects/{id}/export-technical-offer`
- `GET /api/projects/{id}/export-commercial-offer`

Frontend only needs to ensure user fields are saved correctly.

---

## 6) Suggested UI Copy
- Label: `Mobile Number`
- Label: `Logo / Watermark Image`
- Hint: `This image appears on generated offers.`

---

## 7) Acceptance Criteria (Frontend)
- User create form submits `mobileNumber` and `logoOrWatermark` image source.
- User edit form updates both fields.
- User list/details/profile can render both fields safely when null/empty.
- Login/refresh state can store updated user payload without type errors.
- Export buttons remain unchanged; generated PDFs show saved user mobile and branding image.

---

## Prompt to Send to AI Frontend Agent

```text
Implement support for user profile fields `mobileNumber` and `logoOrWatermark` across SmartOffer frontend.

Requirements:
1) Update all user/auth TypeScript interfaces to include:
   - mobileNumber?: string | null
   - logoOrWatermark?: string | null (image source as data-url/base64)
2) Update Create User and Edit User forms:
   - add Mobile Number input (max 20)
   - add Logo/Watermark image upload (accept image/*), convert selected file to data-url/base64 before submit
3) Update profile screens and user detail rendering to show both fields with image preview.
4) Ensure API payloads for POST /api/users and PUT /api/users/{id} send both fields.
5) Ensure auth state handling for login/refresh accepts these fields on returned user object.
6) Do not change export endpoints. Backend already injects current user profile into PDF generation.

Deliverables:
- updated types
- updated forms
- updated API payload mapping
- updated profile/detail UI
- no TypeScript errors
