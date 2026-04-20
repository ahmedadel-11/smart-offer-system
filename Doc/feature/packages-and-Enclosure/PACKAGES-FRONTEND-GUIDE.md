# Packages Feature - Frontend Implementation Guide

## 📋 Overview

This guide provides step-by-step instructions for implementing the Packages feature on the frontend. It covers UI design, component architecture, API integration, and best practices.

---

## 🎯 Feature Requirements

### User Scenarios

**Scenario 1: Create a Package**
- User navigates to Packages section
- Clicks "Create New Package"
- Enters package name and description
- Adds materials with quantities
- Submits form
- Sees success message
- Redirected to package details

**Scenario 2: View Packages**
- User sees list of all active packages
- Can search for packages
- Can filter by name or description
- Can view package details
- Can see all materials and quantities

**Scenario 3: Edit a Package**
- User opens package details
- Clicks Edit button
- Modifies package name/description
- Updates materials and quantities
- Submits changes
- Sees success message

**Scenario 4: Delete a Package**
- User opens package
- Clicks Delete or Deactivate button
- Confirms action
- Package is removed/deactivated
- Sees success message

---

## 🏗️ Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── Packages/
│   │   ├── PackagesList.tsx
│   │   ├── PackageForm.tsx
│   │   ├── PackageDetails.tsx
│   │   ├── PackageSearch.tsx
│   │   ├── PackageItem.tsx
│   │   └── PackageModal.tsx
│   └── Common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorAlert.tsx
│       └── ConfirmDialog.tsx
│
├── pages/
│   ├── Packages/
│   │   ├── PackagesPage.tsx
│   │   ├── PackageDetailPage.tsx
│   │   └── CreatePackagePage.tsx
│
├── services/
│   ├── packageService.ts
│   └── apiClient.ts
│
├── hooks/
│   ├── usePackages.ts
│   ├── usePackageForm.ts
│   └── useFetch.ts
│
├── types/
│   ├── package.ts
│   └── api.ts
│
└── store/
    ├── slices/
    │   └── packageSlice.ts
    └── store.ts
```

---

## 🔗 API Integration

### Service Layer

**File**: `src/services/packageService.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

interface Package {
  packageId: number;
  packageName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdByUserId?: string;
  updatedByUserId?: string;
  items: PackageItem[];
}

interface PackageItem {
  packageItemId: number;
  packageId: number;
  materialId: number;
  quantity: number;
  materialCode?: string;
  materialDescription?: string;
  materialBasePrice?: number;
}

interface CreatePackageRequest {
  packageName: string;
  description?: string;
  items: CreatePackageItemRequest[];
}

interface CreatePackageItemRequest {
  materialId: number;
  quantity: number;
}

interface UpdatePackageRequest extends CreatePackageRequest {}

class PackageService {
  private api: AxiosInstance;

  constructor(apiBaseUrl: string) {
    this.api = axios.create({
      baseURL: `${apiBaseUrl}/api/packages`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Get all active packages
  async getAllPackages(): Promise<Package[]> {
    try {
      const response = await this.api.get<Package[]>('/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch packages');
    }
  }

  // Get package by ID
  async getPackageById(packageId: number): Promise<Package> {
    try {
      const response = await this.api.get<Package>(`/${packageId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch package ${packageId}`);
    }
  }

  // Search packages
  async searchPackages(term: string): Promise<Package[]> {
    try {
      const response = await this.api.get<Package[]>('/search', {
        params: { term },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to search packages');
    }
  }

  // Create package
  async createPackage(request: CreatePackageRequest): Promise<Package> {
    try {
      const response = await this.api.post<Package>('/', request);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create package');
    }
  }

  // Update package
  async updatePackage(
    packageId: number,
    request: UpdatePackageRequest
  ): Promise<Package> {
    try {
      const response = await this.api.put<Package>(
        `/${packageId}`,
        request
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to update package');
    }
  }

  // Deactivate package
  async deactivatePackage(packageId: number): Promise<void> {
    try {
      await this.api.delete(`/${packageId}/deactivate`);
    } catch (error) {
      throw new Error('Failed to deactivate package');
    }
  }

  // Delete package
  async deletePackage(packageId: number): Promise<void> {
    try {
      await this.api.delete(`/${packageId}`);
    } catch (error) {
      throw new Error('Failed to delete package');
    }
  }
}

export default PackageService;
```

---

## ⚛️ State Management (Redux)

### Package Slice

**File**: `src/store/slices/packageSlice.ts`

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import PackageService from '../../services/packageService';

interface Package {
  packageId: number;
  packageName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  items: any[];
}

interface PackageState {
  packages: Package[];
  currentPackage: Package | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: PackageState = {
  packages: [],
  currentPackage: null,
  loading: false,
  error: null,
  success: false,
};

const packageService = new PackageService(
  process.env.REACT_APP_API_URL || 'http://localhost:5000'
);

// Async thunks
export const fetchAllPackages = createAsyncThunk(
  'packages/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const packages = await packageService.getAllPackages();
      return packages;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPackageById = createAsyncThunk(
  'packages/fetchById',
  async (packageId: number, { rejectWithValue }) => {
    try {
      const pkg = await packageService.getPackageById(packageId);
      return pkg;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchPackages = createAsyncThunk(
  'packages/search',
  async (term: string, { rejectWithValue }) => {
    try {
      const packages = await packageService.searchPackages(term);
      return packages;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPackage = createAsyncThunk(
  'packages/create',
  async (request: any, { rejectWithValue }) => {
    try {
      const pkg = await packageService.createPackage(request);
      return pkg;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePackage = createAsyncThunk(
  'packages/update',
  async (
    { packageId, request }: { packageId: number; request: any },
    { rejectWithValue }
  ) => {
    try {
      const pkg = await packageService.updatePackage(packageId, request);
      return pkg;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deactivatePackage = createAsyncThunk(
  'packages/deactivate',
  async (packageId: number, { rejectWithValue }) => {
    try {
      await packageService.deactivatePackage(packageId);
      return packageId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePackage = createAsyncThunk(
  'packages/delete',
  async (packageId: number, { rejectWithValue }) => {
    try {
      await packageService.deletePackage(packageId);
      return packageId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const packageSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentPackage: (state, action: PayloadAction<Package | null>) => {
      state.currentPackage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all packages
    builder
      .addCase(fetchAllPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload;
      })
      .addCase(fetchAllPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single package
    builder
      .addCase(fetchPackageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackageById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPackage = action.payload;
      })
      .addCase(fetchPackageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create package
    builder
      .addCase(createPackage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.loading = false;
        state.packages.push(action.payload);
        state.success = true;
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Update package
    builder
      .addCase(updatePackage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.packages.findIndex(
          (p) => p.packageId === action.payload.packageId
        );
        if (index !== -1) {
          state.packages[index] = action.payload;
        }
        state.currentPackage = action.payload;
        state.success = true;
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });

    // Delete package
    builder
      .addCase(deletePackage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = state.packages.filter(
          (p) => p.packageId !== action.payload
        );
        state.success = true;
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess, setCurrentPackage } =
  packageSlice.actions;
export default packageSlice.reducer;
```

---

## 🎨 UI Components

### PackagesList Component

**File**: `src/components/Packages/PackagesList.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPackages, deletePackage } from '../../store/slices/packageSlice';
import PackageSearch from './PackageSearch';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import ConfirmDialog from '../Common/ConfirmDialog';
import './PackagesList.css';

interface Package {
  packageId: number;
  packageName: string;
  description?: string;
  items: any[];
}

const PackagesList: React.FC = () => {
  const dispatch = useDispatch();
  const { packages, loading, error } = useSelector(
    (state: any) => state.packages
  );
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllPackages() as any);
  }, [dispatch]);

  const handleDelete = async (packageId: number) => {
    dispatch(deletePackage(packageId) as any);
    setConfirmDelete(null);
  };

  const handleEdit = (packageId: number) => {
    // Navigate to edit page
    window.location.href = `/packages/${packageId}/edit`;
  };

  const handleView = (packageId: number) => {
    window.location.href = `/packages/${packageId}`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="packages-list-container">
      <div className="packages-header">
        <h1>Packages</h1>
        <a href="/packages/create" className="btn btn-primary">
          + Create Package
        </a>
      </div>

      <PackageSearch onSearch={setSearchTerm} />

      {error && <ErrorAlert message={error} />}

      <div className="packages-grid">
        {packages.length === 0 ? (
          <p className="no-packages">No packages found</p>
        ) : (
          packages.map((pkg: Package) => (
            <div key={pkg.packageId} className="package-card">
              <div className="package-card-header">
                <h3>{pkg.packageName}</h3>
                <div className="package-actions">
                  <button
                    onClick={() => handleView(pkg.packageId)}
                    className="btn btn-sm btn-outline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(pkg.packageId)}
                    className="btn btn-sm btn-outline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(pkg.packageId)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {pkg.description && (
                <p className="package-description">{pkg.description}</p>
              )}

              <div className="package-info">
                <span className="badge">{pkg.items.length} items</span>
              </div>
            </div>
          ))
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Package"
          message="Are you sure you want to delete this package?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default PackagesList;
```

### PackageForm Component

**File**: `src/components/Packages/PackageForm.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPackage, updatePackage } from '../../store/slices/packageSlice';
import './PackageForm.css';

interface PackageFormProps {
  packageId?: number;
  initialData?: any;
  onSuccess?: (pkg: any) => void;
}

const PackageForm: React.FC<PackageFormProps> = ({
  packageId,
  initialData,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [packageName, setPackageName] = useState(
    initialData?.packageName || ''
  );
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [items, setItems] = useState(initialData?.items || []);
  const [newItemMaterialId, setNewItemMaterialId] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { loading, success, error } = useSelector(
    (state: any) => state.packages
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!packageName.trim()) {
      newErrors.packageName = 'Package name is required';
    }

    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (!newItemMaterialId || !newItemQuantity) {
      setErrors({ ...errors, newItem: 'Please fill in all fields' });
      return;
    }

    const newItem = {
      materialId: parseInt(newItemMaterialId),
      quantity: parseInt(newItemQuantity),
    };

    setItems([...items, newItem]);
    setNewItemMaterialId('');
    setNewItemQuantity('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const request = {
      packageName,
      description,
      items,
    };

    if (packageId) {
      dispatch(
        updatePackage({ packageId, request }) as any
      ).then((result: any) => {
        if (!result.payload.error) {
          onSuccess?.(result.payload);
        }
      });
    } else {
      dispatch(createPackage(request) as any).then((result: any) => {
        if (!result.payload.error) {
          onSuccess?.(result.payload);
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="package-form">
      <h2>{packageId ? 'Edit Package' : 'Create Package'}</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && (
        <div className="alert alert-success">
          Package {packageId ? 'updated' : 'created'} successfully!
        </div>
      )}

      <div className="form-group">
        <label htmlFor="packageName">Package Name *</label>
        <input
          type="text"
          id="packageName"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          className={`form-control ${errors.packageName ? 'is-invalid' : ''}`}
          placeholder="Enter package name"
        />
        {errors.packageName && (
          <span className="error-message">{errors.packageName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-control"
          placeholder="Enter package description"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Items *</label>
        <div className="items-section">
          {items.length > 0 && (
            <table className="items-table">
              <thead>
                <tr>
                  <th>Material ID</th>
                  <th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.materialId}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="btn btn-sm btn-danger"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="add-item-form">
            <h4>Add Item</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="materialId">Material ID</label>
                <input
                  type="number"
                  id="materialId"
                  value={newItemMaterialId}
                  onChange={(e) => setNewItemMaterialId(e.target.value)}
                  className="form-control"
                  placeholder="Material ID"
                />
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  className="form-control"
                  placeholder="Quantity"
                  min="1"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-secondary"
              >
                Add Item
              </button>
            </div>
          </div>

          {errors.items && (
            <span className="error-message">{errors.items}</span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading
            ? 'Saving...'
            : packageId
            ? 'Update Package'
            : 'Create Package'}
        </button>
        <a href="/packages" className="btn btn-secondary">
          Cancel
        </a>
      </div>
    </form>
  );
};

export default PackageForm;
```

### PackageDetails Component

**File**: `src/components/Packages/PackageDetails.tsx`

```typescript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackageById } from '../../store/slices/packageSlice';
import './PackageDetails.css';

interface PackageDetailsProps {
  packageId: number;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ packageId }) => {
  const dispatch = useDispatch();
  const { currentPackage, loading, error } = useSelector(
    (state: any) => state.packages
  );

  useEffect(() => {
    dispatch(fetchPackageById(packageId) as any);
  }, [packageId, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!currentPackage) return <div>Package not found</div>;

  return (
    <div className="package-details-container">
      <div className="details-header">
        <h1>{currentPackage.packageName}</h1>
        <div className="details-actions">
          <a
            href={`/packages/${packageId}/edit`}
            className="btn btn-primary"
          >
            Edit
          </a>
          <a href="/packages" className="btn btn-secondary">
            Back
          </a>
        </div>
      </div>

      {currentPackage.description && (
        <p className="description">{currentPackage.description}</p>
      )}

      <div className="items-section">
        <h2>Items ({currentPackage.items.length})</h2>
        <table className="items-table">
          <thead>
            <tr>
              <th>Material Code</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Base Price</th>
            </tr>
          </thead>
          <tbody>
            {currentPackage.items.map((item: any) => (
              <tr key={item.packageItemId}>
                <td>{item.materialCode}</td>
                <td>{item.materialDescription}</td>
                <td>{item.quantity}</td>
                <td>${item.materialBasePrice?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="details-meta">
        <p>
          <strong>Created:</strong>{' '}
          {new Date(currentPackage.createdAt).toLocaleDateString()}
        </p>
        {currentPackage.updatedAt && (
          <p>
            <strong>Updated:</strong>{' '}
            {new Date(currentPackage.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default PackageDetails;
```

---

## 🎯 Pages

### Packages Page

**File**: `src/pages/Packages/PackagesPage.tsx`

```typescript
import React from 'react';
import PackagesList from '../../components/Packages/PackagesList';
import './PackagesPage.css';

const PackagesPage: React.FC = () => {
  return (
    <div className="packages-page">
      <PackagesList />
    </div>
  );
};

export default PackagesPage;
```

### Create Package Page

**File**: `src/pages/Packages/CreatePackagePage.tsx`

```typescript
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PackageForm from '../../components/Packages/PackageForm';
import './CreatePackagePage.css';

const CreatePackagePage: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useSelector((state: any) => state.packages);

  useEffect(() => {
    if (success) {
      navigate('/packages');
    }
  }, [success, navigate]);

  const handleSuccess = (pkg: any) => {
    // Success message will be shown by the form
    // and useEffect will redirect
  };

  return (
    <div className="create-package-page">
      <PackageForm onSuccess={handleSuccess} />
    </div>
  );
};

export default CreatePackagePage;
```

---

## 🛣️ Routing

**File**: `src/App.tsx` (or your routing configuration)

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PackagesPage from './pages/Packages/PackagesPage';
import CreatePackagePage from './pages/Packages/CreatePackagePage';
import PackageDetailPage from './pages/Packages/PackageDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Packages Routes */}
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/packages/create" element={<CreatePackagePage />} />
        <Route path="/packages/:id" element={<PackageDetailPage />} />
        <Route path="/packages/:id/edit" element={<CreatePackagePage />} />

        {/* Other routes */}
        {/* ... */}
      </Routes>
    </Router>
  );
}

export default App;
```

---

## 🎨 Styling

### PackagesList.css

```css
.packages-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.packages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.packages-header h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.package-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.package-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.package-card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.package-card-header h3 {
  margin: 0;
  flex: 1;
  font-size: 18px;
}

.package-actions {
  display: flex;
  gap: 8px;
}

.package-description {
  color: #666;
  margin: 8px 0;
  font-size: 14px;
}

.package-info {
  display: flex;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.badge {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.no-packages {
  text-align: center;
  color: #999;
  padding: 40px;
}
```

### PackageForm.css

```css
.package-form {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.package-form h2 {
  margin-top: 0;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.form-control.is-invalid {
  border-color: #d32f2f;
}

.error-message {
  display: block;
  color: #d32f2f;
  font-size: 12px;
  margin-top: 4px;
}

.items-section {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.items-table th,
.items-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.items-table th {
  background: #f0f0f0;
  font-weight: 600;
}

.add-item-form {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: #757575;
  color: white;
}

.btn-danger {
  background: #d32f2f;
  color: white;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.alert-danger {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

.alert-success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #66bb6a;
}
```

---

## 📱 Responsive Design

All components should be responsive. Use CSS media queries:

```css
@media (max-width: 768px) {
  .packages-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .packages-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
```

---

## ✅ Form Validation

### Client-Side Validation

- Package name: required, max 200 characters
- Description: optional, max 500 characters
- Items: minimum 1, each with materialId and quantity
- Quantity: positive integer only

### Server-Side Validation

- All validations are performed on the backend
- Duplicate package names prevented
- Material existence verified
- Unique constraint on package names

---

## 🧪 Testing

### Unit Tests for Components

```typescript
// PackagesList.test.tsx
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import PackagesList from './PackagesList';
import store from '../../store/store';

describe('PackagesList', () => {
  test('renders packages list', () => {
    render(
      <Provider store={store}>
        <PackagesList />
      </Provider>
    );

    expect(screen.getByText('Packages')).toBeInTheDocument();
    expect(screen.getByText('+ Create Package')).toBeInTheDocument();
  });

  test('displays loading state', () => {
    render(
      <Provider store={store}>
        <PackagesList />
      </Provider>
    );

    // Assert loading spinner appears
  });
});
```

### Integration Tests

```typescript
// PackagesPage.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PackagesPage from './PackagesPage';

describe('Packages Page Integration', () => {
  test('creates package successfully', async () => {
    render(<PackagesPage />);

    const createBtn = screen.getByText('+ Create Package');
    userEvent.click(createBtn);

    // Fill form and submit
    const input = screen.getByPlaceholderText('Enter package name');
    userEvent.type(input, 'Test Package');

    const submit = screen.getByText('Create Package');
    userEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByText('Package created successfully!')).toBeInTheDocument();
    });
  });
});
```

---

## 🔒 Permission Handling

Check permissions before rendering:

```typescript
interface User {
  permissions: string[];
}

const canCreatePackage = (user: User) =>
  user.permissions.includes('packages:create');

const canEditPackage = (user: User) =>
  user.permissions.includes('packages:edit');

const canDeletePackage = (user: User) =>
  user.permissions.includes('packages:delete');

// In component
{canEditPackage(currentUser) && (
  <button onClick={handleEdit}>Edit</button>
)}
```

---

## 🚀 Performance Optimization

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const PackagesPage = lazy(() => import('./pages/Packages/PackagesPage'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PackagesPage />
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo } from 'react';

const PackageCard = memo(({ pkg }: { pkg: Package }) => {
  return <div>{pkg.packageName}</div>;
});
```

### API Caching

Implement caching strategy for frequently accessed packages:

```typescript
const packageCache = new Map();

async function getCachedPackage(id: number) {
  if (packageCache.has(id)) {
    return packageCache.get(id);
  }

  const pkg = await packageService.getPackageById(id);
  packageCache.set(id, pkg);
  return pkg;
}
```

---

## 🔄 Error Handling

### Global Error Handler

```typescript
// interceptors.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Show permission error
      console.error('Permission denied');
    }
    return Promise.reject(error);
  }
);
```

---

## 📊 State Management Best Practices

1. **Keep state normalized** - Store packages as IDs in lists
2. **Use selectors** - Create memoized selectors for derived state
3. **Avoid deeply nested state** - Flatten your state structure
4. **Use immer** - Redux Toolkit uses Immer for immutable updates

---

## 🎯 Next Steps

1. **Set up the project structure** - Create component directories
2. **Create service layer** - Implement API communication
3. **Set up Redux store** - Configure slices and store
4. **Build components** - Start with list, then form, then details
5. **Add routing** - Configure page routes
6. **Style components** - Apply CSS and make responsive
7. **Write tests** - Unit and integration tests
8. **Test with backend** - Verify API integration
9. **Deploy** - Build and deploy to production

---

## 📚 References

- React: https://react.dev
- Redux Toolkit: https://redux-toolkit.js.org
- React Router: https://reactrouter.com
- Axios: https://axios-http.com
- TypeScript: https://www.typescriptlang.org
