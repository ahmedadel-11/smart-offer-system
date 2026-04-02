# Project Lock Features

This document describes the project lock behavior in SmartOffer.

## Overview

A locked project becomes read-only for normal project operations. When a project is locked:

- no project updates are allowed
- no project deletion is allowed
- no status changes are allowed
- no collaborator changes are allowed
- no panel creation, update, delete, or duplicate actions are allowed
- no panel item creation, update, or delete actions are allowed
- the project can still be viewed
- the project lock state is returned in project read endpoints

## Default permission model

The lock actions use the permission:

- `Projects.Lock`

By default, this permission is assigned to:

- `SuperAdmin`
- `TenderingEngineer`

If you want another role or user to lock and unlock projects, assign `Projects.Lock` to that role through the permission management screens or API.

## API behavior

### View lock state

The project read endpoints already return lock information:

- `GET /api/Projects/{id}`
- `GET /api/Projects/{id}/summary`

The project DTO includes:

- `isLocked`
- `lockedAt`
- `lockedByUserId`

### Lock a project

`POST /api/Projects/{id}/lock`

Requires `Projects.Lock`.

Example response:

```json
{
  "projectId": 12,
  "projectName": "Sample Project",
  "customer": "John Doe",
  "currency": "USD",
  "defaultMargin": 20,
  "createdDate": "2024-05-20T10:00:00Z",
  "status": 1,
  "notes": "Tender stage",
  "panelCount": 3,
  "createdByUserId": "11111111-1111-1111-1111-111111111111",
  "isLocked": true,
  "lockedAt": "2024-05-21T09:15:00Z",
  "lockedByUserId": "22222222-2222-2222-2222-222222222222"
}
```

### Unlock a project

`POST /api/Projects/{id}/unlock`

Requires `Projects.Lock`.

Example response:

```json
{
  "projectId": 12,
  "projectName": "Sample Project",
  "customer": "John Doe",
  "currency": "USD",
  "defaultMargin": 20,
  "createdDate": "2024-05-20T10:00:00Z",
  "status": 1,
  "notes": "Tender stage",
  "panelCount": 3,
  "createdByUserId": "11111111-1111-1111-1111-111111111111",
  "isLocked": false,
  "lockedAt": null,
  "lockedByUserId": null
}
```

## What is blocked when locked

### Projects

Blocked endpoints include:

- `PUT /api/Projects/{id}`
- `DELETE /api/Projects/{id}`
- `PUT /api/Projects/{id}/status`
- `POST /api/Projects/{id}/collaborators`
- `DELETE /api/Projects/{id}/collaborators/{collaboratorUserId}`
- `POST /api/Projects/{id}/clone`

### Panels

Blocked endpoints include:

- `POST /api/Panels`
- `PUT /api/Panels/{id}`
- `DELETE /api/Panels/{id}`
- `POST /api/Panels/{id}/duplicate`
- `PUT /api/Panels/{id}/status`
- `POST /api/Panels/{id}/collaborators`
- `DELETE /api/Panels/{id}/collaborators/{collaboratorUserId}`

### Panel items

Blocked endpoints include:

- `POST /api/PanelItems`
- `PUT /api/PanelItems/{id}`
- `DELETE /api/PanelItems/{id}`

## Read-only operations still allowed

These are still allowed for locked projects:

- project details
- project summary
- technical offer data
- commercial offer data
- material list views
- panel views
- panel item views
- dashboards and reports

## Error behavior

When a user tries to modify a locked project, the API returns:

- `400 Bad Request`
- message: `Cannot modify a locked project.` or a more specific panel message

Example:

```json
{
  "message": "Cannot modify a panel in a locked project."
}
```

## Example workflow

### 1. Open the project

Call:

`GET /api/Projects/12`

Response shows `isLocked: true` so the frontend can disable edit controls.

### 2. Try to update a panel

Call:

`PUT /api/Panels/44`

If the parent project is locked, the API returns:

```json
{
  "message": "Cannot modify a panel in a locked project."
}
```

### 3. Unlock the project

Call:

`POST /api/Projects/12/unlock`

After that, normal edit operations are allowed again for users with the proper permissions.

## Frontend recommendation

When loading a project, check `isLocked` and disable:

- save buttons
- add panel buttons
- add item buttons
- duplicate actions
- delete actions
- status change actions
- collaborator management actions

Only keep view/export actions enabled.
