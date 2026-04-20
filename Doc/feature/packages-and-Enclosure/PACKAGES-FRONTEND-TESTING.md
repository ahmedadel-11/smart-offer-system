# Packages Feature - Frontend Testing Guide

## 🧪 Overview

This guide covers testing strategies for the Packages feature frontend implementation.

---

## 📊 Test Strategy

### Test Pyramid

```
         /\
        /  \     E2E Tests (10%)
       /    \    Selenium, Cypress
      /------\
     /        \
    /   API    \  Integration Tests (20%)
   /  (Mocked)  \ Jest + @testing-library
  /-----------\
 /            \
/  Unit Tests \  Unit Tests (70%)
/ Components  \ Jest + React Testing Library
\  Services   /
 \          /
  \--------/
```

---

## 🧬 Unit Testing

### 1. Component Tests

#### PackagesList Component Test

**File**: `src/components/Packages/__tests__/PackagesList.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PackagesList from '../PackagesList';
import packageReducer from '../../../store/slices/packageSlice';

describe('PackagesList Component', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: { packages: packageReducer },
      preloadedState: {
        packages: {
          packages: [
            {
              packageId: 1,
              packageName: 'Panel Enclosure 1',
              description: 'Test description',
              isActive: true,
              items: [
                { packageItemId: 1, materialId: 5, quantity: 2 }
              ]
            }
          ],
          currentPackage: null,
          loading: false,
          error: null,
          success: false
        }
      }
    });
  });

  test('renders packages list', () => {
    render(
      <Provider store={store}>
        <PackagesList />
      </Provider>
    );

    expect(screen.getByText('Packages')).toBeInTheDocument();
    expect(screen.getByText('+ Create Package')).toBeInTheDocument();
  });

  test('displays package cards', () => {
    render(
      <Provider store={store}>
        <PackagesList />
      </Provider>
    );

    expect(screen.getByText('Panel Enclosure 1')).toBeInTheDocument();
    expect(screen.getByText('1 items')).toBeInTheDocument();
  });

  test('shows loading spinner when loading', () => {
    store = configureStore({
      reducer: { packages: packageReducer },
      preloadedState: {
        packages: {
          packages: [],
          currentPackage: null,
          loading: true,
          error: null,
          success: false
        }
      }
    });

    render(
      <Provider store={store}>
        <PackagesList />
      </Provider>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('displays error message when error occurs', () => {
    store = configureStore({
      reducer: { packages: packageReducer },
      preloadedState: {
        packages: {
          packages: [],
          currentPackage: null,
          loading: false,
          error: 'Failed to fetch packages',
          success: false
        }
      }
    });

    render(
      <Provider store={store}>
        <PackagesList />
      </Provider>
    );

    expect(screen.getByText('Failed to fetch packages')).toBeInTheDocument();
  });

  test('navigates to create page when create button clicked', () => {
    render(
      <Provider store={store}>
        <PackagesList />
      </Provider>
    );

    const createBtn = screen.getByText('+ Create Package');
    expect(createBtn).toHaveAttribute('href', '/packages/create');
  });

  test('opens delete confirmation dialog', async () => {
    render(
      <Provider store={store}>
        <PackagesList />
      </Provider>
    );

    const deleteBtn = screen.getByText('Delete');
    userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByText('Delete Package')).toBeInTheDocument();
    });
  });

  test('displays no packages message when empty', () => {
    store = configureStore({
      reducer: { packages: packageReducer },
      preloadedState: {
        packages: {
          packages: [],
          currentPackage: null,
          loading: false,
          error: null,
          success: false
        }
      }
    });

    render(
      <Provider store={store}>
        <PackagesList />
      </Provider>
    );

    expect(screen.getByText('No packages found')).toBeInTheDocument();
  });
});
```

#### PackageForm Component Test

**File**: `src/components/Packages/__tests__/PackageForm.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PackageForm from '../PackageForm';
import packageReducer from '../../../store/slices/packageSlice';

describe('PackageForm Component', () => {
  let store: any;
  let mockOnSuccess: jest.Mock;

  beforeEach(() => {
    mockOnSuccess = jest.fn();
    store = configureStore({
      reducer: { packages: packageReducer }
    });
  });

  test('renders create form', () => {
    render(
      <Provider store={store}>
        <PackageForm onSuccess={mockOnSuccess} />
      </Provider>
    );

    expect(screen.getByText('Create Package')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter package name')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(
      <Provider store={store}>
        <PackageForm onSuccess={mockOnSuccess} />
      </Provider>
    );

    const submitBtn = screen.getByText('Create Package');
    userEvent.click(submitBtn);

    expect(screen.getByText('Package name is required')).toBeInTheDocument();
    expect(screen.getByText('At least one item is required')).toBeInTheDocument();
  });

  test('adds item to package', async () => {
    render(
      <Provider store={store}>
        <PackageForm onSuccess={mockOnSuccess} />
      </Provider>
    );

    const materialInput = screen.getByPlaceholderText('Material ID');
    const quantityInput = screen.getByPlaceholderText('Quantity');
    const addBtn = screen.getByText('Add Item');

    userEvent.type(materialInput, '5');
    userEvent.type(quantityInput, '2');
    userEvent.click(addBtn);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('removes item from package', async () => {
    const initialData = {
      items: [{ materialId: 5, quantity: 2 }]
    };

    render(
      <Provider store={store}>
        <PackageForm initialData={initialData} onSuccess={mockOnSuccess} />
      </Provider>
    );

    const removeBtn = screen.getByText('Remove');
    userEvent.click(removeBtn);

    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    render(
      <Provider store={store}>
        <PackageForm onSuccess={mockOnSuccess} />
      </Provider>
    );

    const nameInput = screen.getByPlaceholderText('Enter package name');
    const materialInput = screen.getByPlaceholderText('Material ID');
    const quantityInput = screen.getByPlaceholderText('Quantity');

    userEvent.type(nameInput, 'Test Package');
    userEvent.type(materialInput, '5');
    userEvent.type(quantityInput, '2');
    userEvent.click(screen.getByText('Add Item'));

    const submitBtn = screen.getByText('Create Package');
    userEvent.click(submitBtn);

    // Submit should be triggered
    expect(submitBtn).not.toBeDisabled();
  });

  test('disables submit button while loading', async () => {
    store = configureStore({
      reducer: { packages: packageReducer },
      preloadedState: {
        packages: {
          loading: true,
          error: null,
          success: false,
          packages: [],
          currentPackage: null
        }
      }
    });

    render(
      <Provider store={store}>
        <PackageForm onSuccess={mockOnSuccess} />
      </Provider>
    );

    const submitBtn = screen.getByText('Saving...');
    expect(submitBtn).toBeDisabled();
  });

  test('displays success message', () => {
    store = configureStore({
      reducer: { packages: packageReducer },
      preloadedState: {
        packages: {
          loading: false,
          error: null,
          success: true,
          packages: [],
          currentPackage: null
        }
      }
    });

    render(
      <Provider store={store}>
        <PackageForm onSuccess={mockOnSuccess} />
      </Provider>
    );

    expect(screen.getByText(/created successfully/i)).toBeInTheDocument();
  });

  test('displays error message', () => {
    store = configureStore({
      reducer: { packages: packageReducer },
      preloadedState: {
        packages: {
          loading: false,
          error: 'Failed to create package',
          success: false,
          packages: [],
          currentPackage: null
        }
      }
    });

    render(
      <Provider store={store}>
        <PackageForm onSuccess={mockOnSuccess} />
      </Provider>
    );

    expect(screen.getByText('Failed to create package')).toBeInTheDocument();
  });
});
```

### 2. Service Tests

#### PackageService Test

**File**: `src/services/__tests__/packageService.test.ts`

```typescript
import PackageService from '../packageService';
import axios from 'axios';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('PackageService', () => {
  let service: PackageService;

  beforeEach(() => {
    service = new PackageService('http://localhost:5000');
    jest.clearAllMocks();
  });

  test('getAllPackages returns packages list', async () => {
    const mockPackages = [
      {
        packageId: 1,
        packageName: 'Panel Enclosure 1',
        items: []
      }
    ];

    mockAxios.create().get.mockResolvedValueOnce({
      data: mockPackages
    });

    const result = await service.getAllPackages();

    expect(result).toEqual(mockPackages);
  });

  test('getPackageById returns single package', async () => {
    const mockPackage = {
      packageId: 1,
      packageName: 'Panel Enclosure 1',
      items: []
    };

    mockAxios.create().get.mockResolvedValueOnce({
      data: mockPackage
    });

    const result = await service.getPackageById(1);

    expect(result).toEqual(mockPackage);
  });

  test('searchPackages sends search term', async () => {
    const mockResults = [
      {
        packageId: 1,
        packageName: 'Panel Enclosure 1',
        items: []
      }
    ];

    mockAxios.create().get.mockResolvedValueOnce({
      data: mockResults
    });

    const result = await service.searchPackages('enclosure');

    expect(result).toEqual(mockResults);
  });

  test('createPackage sends correct data', async () => {
    const request = {
      packageName: 'Test Package',
      items: [{ materialId: 5, quantity: 2 }]
    };

    const mockResponse = {
      packageId: 1,
      ...request,
      createdAt: new Date().toISOString()
    };

    mockAxios.create().post.mockResolvedValueOnce({
      data: mockResponse
    });

    const result = await service.createPackage(request);

    expect(result).toEqual(mockResponse);
  });

  test('updatePackage sends put request', async () => {
    const request = {
      packageName: 'Updated Package',
      items: []
    };

    mockAxios.create().put.mockResolvedValueOnce({
      data: { packageId: 1, ...request }
    });

    const result = await service.updatePackage(1, request);

    expect(result.packageName).toBe('Updated Package');
  });

  test('deletePackage sends delete request', async () => {
    mockAxios.create().delete.mockResolvedValueOnce({});

    await expect(service.deletePackage(1)).resolves.not.toThrow();
  });

  test('handles API errors', async () => {
    mockAxios.create().get.mockRejectedValueOnce(
      new Error('Failed to fetch packages')
    );

    await expect(service.getAllPackages()).rejects.toThrow(
      'Failed to fetch packages'
    );
  });

  test('adds authorization header', async () => {
    localStorage.setItem('authToken', 'test-token');

    // Create new service to get interceptor
    const newService = new PackageService('http://localhost:5000');

    expect(mockAxios.create).toHaveBeenCalled();
  });
});
```

### 3. Redux Slice Tests

#### Package Slice Test

**File**: `src/store/slices/__tests__/packageSlice.test.ts`

```typescript
import packageReducer, {
  fetchAllPackages,
  createPackage,
  setCurrentPackage,
  clearError
} from '../packageSlice';

describe('packageSlice', () => {
  const initialState = {
    packages: [],
    currentPackage: null,
    loading: false,
    error: null,
    success: false
  };

  test('returns initial state', () => {
    expect(packageReducer(undefined, { type: 'unknown' })).toEqual(
      initialState
    );
  });

  test('handles setCurrentPackage', () => {
    const mockPackage = { packageId: 1, packageName: 'Test' };
    const action = setCurrentPackage(mockPackage);

    const result = packageReducer(initialState, action);

    expect(result.currentPackage).toEqual(mockPackage);
  });

  test('handles clearError', () => {
    const state = { ...initialState, error: 'Test error' };
    const action = clearError();

    const result = packageReducer(state, action);

    expect(result.error).toBeNull();
  });

  test('handles fetchAllPackages.pending', () => {
    const action = { type: fetchAllPackages.pending.type };

    const result = packageReducer(initialState, action);

    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  test('handles fetchAllPackages.fulfilled', () => {
    const mockPackages = [
      { packageId: 1, packageName: 'Test Package' }
    ];
    const action = {
      type: fetchAllPackages.fulfilled.type,
      payload: mockPackages
    };

    const result = packageReducer(initialState, action);

    expect(result.loading).toBe(false);
    expect(result.packages).toEqual(mockPackages);
  });

  test('handles fetchAllPackages.rejected', () => {
    const action = {
      type: fetchAllPackages.rejected.type,
      payload: 'Failed to fetch'
    };

    const result = packageReducer(initialState, action);

    expect(result.loading).toBe(false);
    expect(result.error).toBe('Failed to fetch');
  });
});
```

---

## 🔗 Integration Testing

### API Integration Test

**File**: `src/__tests__/integration/packageAPI.integration.test.ts`

```typescript
import PackageService from '../../services/packageService';

describe('Package API Integration', () => {
  let service: PackageService;

  beforeAll(() => {
    service = new PackageService(process.env.REACT_APP_API_URL);
  });

  test('creates and retrieves package', async () => {
    const createRequest = {
      packageName: `Test Package ${Date.now()}`,
      description: 'Integration test package',
      items: [{ materialId: 1, quantity: 2 }]
    };

    // Create
    const created = await service.createPackage(createRequest);
    expect(created.packageId).toBeDefined();

    // Retrieve
    const retrieved = await service.getPackageById(created.packageId);
    expect(retrieved.packageName).toBe(createRequest.packageName);
  });

  test('updates package', async () => {
    const createRequest = {
      packageName: `Test Update ${Date.now()}`,
      items: [{ materialId: 1, quantity: 2 }]
    };

    const created = await service.createPackage(createRequest);

    const updateRequest = {
      packageName: `Updated ${Date.now()}`,
      items: [{ materialId: 2, quantity: 3 }]
    };

    const updated = await service.updatePackage(created.packageId, updateRequest);
    expect(updated.packageName).toBe(updateRequest.packageName);
  });

  test('searches packages', async () => {
    const createRequest = {
      packageName: `Searchable Package ${Date.now()}`,
      items: [{ materialId: 1, quantity: 2 }]
    };

    await service.createPackage(createRequest);

    const results = await service.searchPackages('Searchable');
    expect(results.length).toBeGreaterThan(0);
  });

  test('deletes package', async () => {
    const createRequest = {
      packageName: `Delete Test ${Date.now()}`,
      items: [{ materialId: 1, quantity: 2 }]
    };

    const created = await service.createPackage(createRequest);
    await service.deletePackage(created.packageId);

    // Try to retrieve deleted package
    try {
      await service.getPackageById(created.packageId);
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
```

---

## 🎯 End-to-End Testing

### E2E Test with Cypress

**File**: `cypress/e2e/packages.cy.ts`

```typescript
describe('Packages Feature E2E', () => {
  beforeEach(() => {
    cy.login('testuser@example.com', 'password');
    cy.visit('/packages');
  });

  it('displays packages list', () => {
    cy.contains('Packages').should('be.visible');
    cy.contains('+ Create Package').should('be.visible');
  });

  it('creates a new package', () => {
    cy.contains('+ Create Package').click();

    cy.get('input[id="packageName"]').type('E2E Test Package');
    cy.get('textarea[id="description"]').type('Test description');

    cy.get('input[id="materialId"]').type('5');
    cy.get('input[id="quantity"]').type('2');
    cy.contains('Add Item').click();

    cy.contains('Create Package').click();

    cy.contains('Package created successfully').should('be.visible');
    cy.url().should('include', '/packages');
  });

  it('edits a package', () => {
    cy.contains('Panel Enclosure 1')
      .parent()
      .contains('Edit')
      .click();

    cy.get('input[id="packageName"]').clear().type('Updated Package');
    cy.contains('Update Package').click();

    cy.contains('Package updated successfully').should('be.visible');
  });

  it('deletes a package', () => {
    cy.contains('Panel Enclosure 1')
      .parent()
      .contains('Delete')
      .click();

    cy.contains('Are you sure').should('be.visible');
    cy.contains('Delete').click();

    cy.contains('Panel Enclosure 1').should('not.exist');
  });

  it('searches packages', () => {
    cy.get('input[placeholder*="Search"]').type('enclosure');
    cy.contains('Panel Enclosure 1').should('be.visible');
  });
});
```

---

## 🏃 Performance Testing

### React Profiler Test

```typescript
describe('PackagesList Performance', () => {
  test('renders without unnecessary re-renders', () => {
    const renderSpy = jest.fn();

    const TestComponent = () => {
      renderSpy();
      return <PackagesList />;
    };

    const { rerender } = render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    expect(renderSpy).toHaveBeenCalledTimes(1);

    rerender(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    // Should not trigger new render with same props
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🧩 Snapshot Testing

```typescript
describe('PackageCard Snapshot', () => {
  test('matches snapshot', () => {
    const mockPackage = {
      packageId: 1,
      packageName: 'Test Package',
      description: 'Test description',
      items: [
        { materialId: 5, quantity: 2 }
      ]
    };

    const { container } = render(
      <PackageCard package={mockPackage} />
    );

    expect(container).toMatchSnapshot();
  });
});
```

---

## ✅ Test Coverage Goals

```
Global Statements:   > 80%
Global Branches:     > 75%
Global Functions:    > 80%
Global Lines:        > 80%

Component Coverage:  > 90%
Service Coverage:    > 95%
Hook Coverage:       > 85%
```

---

## 🚀 Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test PackagesList.test.tsx

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run E2E tests
npx cypress open
npx cypress run

# Run E2E headless
npm run test:e2e:ci
```

---

## 📊 Test Organization

```
src/
├── __tests__/
│   └── integration/
│       └── packageAPI.integration.test.ts
├── components/
│   └── Packages/
│       └── __tests__/
│           ├── PackagesList.test.tsx
│           ├── PackageForm.test.tsx
│           └── PackageDetails.test.tsx
├── services/
│   └── __tests__/
│       └── packageService.test.ts
└── store/
    └── slices/
        └── __tests__/
            └── packageSlice.test.ts

cypress/
└── e2e/
    └── packages.cy.ts
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage --watchAll=false

      - name: Run E2E tests
        run: npm run test:e2e:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## 📋 Testing Checklist

- [ ] All components have unit tests
- [ ] All services have unit tests
- [ ] Redux slices have tests
- [ ] Integration tests for API calls
- [ ] E2E tests for critical flows
- [ ] Accessibility tests
- [ ] Performance tests
- [ ] Snapshot tests
- [ ] Error handling tests
- [ ] Permission-based tests
- [ ] Loading state tests
- [ ] Validation tests
- [ ] Coverage > 80%
- [ ] All tests passing
- [ ] CI/CD integration working
