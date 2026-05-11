# Enclosure Feature - Integration Example

This document shows practical examples of how to integrate the Enclosure feature into your panel designer.

## Example 1: Simple Button to Add Enclosure

### In your Panel Designer component:

```tsx
import React from 'react';
import { Button, Box } from '@mui/material';
import { useEnclosureManager } from '../components/enclosures';

function PanelDesigner({ panelId }: { panelId: number }) {
  const { openEnclosureManager } = useEnclosureManager();

  return (
    <Box sx={{ p: 2 }}>
      <Button 
        variant="contained" 
        color="warning"
        onClick={() => openEnclosureManager(panelId)}
      >
        + Add Enclosure
      </Button>
    </Box>
  );
}

export default PanelDesigner;
```

## Example 2: Show Existing Enclosure with Edit/Delete

### Display existing enclosure in panel items:

```tsx
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableRow, 
  Button,
  Box,
  Paper 
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PanelItem, PanelItemType } from '../types';
import { useEnclosureManager } from '../components/enclosures';

function PanelItemsTable({ 
  panelId, 
  items, 
  onItemDeleted 
}: { 
  panelId: number;
  items: PanelItem[];
  onItemDeleted: (id: number) => void;
}) {
  const { openEnclosureManager } = useEnclosureManager();

  // Find enclosure items
  const enclosureItems = items.filter(
    item => item.itemType === PanelItemType.Enclosure
  );

  // Separate enclosure from other items
  const otherItems = items.filter(
    item => item.itemType !== PanelItemType.Enclosure
  );

  const handleEditEnclosure = (panelItemId: number) => {
    openEnclosureManager(panelId, panelItemId);
  };

  const handleDeleteEnclosure = async (panelItemId: number) => {
    if (window.confirm('Delete this enclosure?')) {
      try {
        // Call your delete API
        // await panelItemService.deletePanelItem(panelItemId);
        onItemDeleted(panelItemId);
      } catch (error) {
        alert('Failed to delete enclosure');
      }
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          {/* Enclosure Section */}
          {enclosureItems.length > 0 && (
            <>
              <TableRow sx={{ bgcolor: '#ffe0b2' }}>
                <TableCell colSpan={6} sx={{ fontWeight: 700, py: 2 }}>
                  Enclosure
                </TableCell>
              </TableRow>

              {enclosureItems.map(item => (
                <TableRow key={item.panelItemId}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditEnclosure(item.panelItemId)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteEnclosure(item.panelItemId)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}

          {/* Other Items */}
          {otherItems.map(item => (
            <TableRow key={item.panelItemId}>
              <TableCell>{item.description}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">{item.totalPrice.toFixed(2)}</TableCell>
              <TableCell>
                {/* Other item actions */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PanelItemsTable;
```

## Example 3: Enclosure Status Card

### Show enclosure status in panel summary:

```tsx
import React from 'react';
import { Card, CardContent, CardActions, Button, Box, Typography } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { PanelDetail, PanelItemType } from '../types';
import { useEnclosureManager } from '../components/enclosures';

function PanelEnclosureCard({ 
  panel 
}: { 
  panel: PanelDetail;
}) {
  const { openEnclosureManager } = useEnclosureManager();

  const enclosure = panel.enclosureItems?.[0];

  return (
    <Card sx={{ mb: 3, border: '2px solid #FF9800' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Enclosure
        </Typography>

        {enclosure ? (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Description:</strong> {enclosure.description}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Price:</strong> EGP {enclosure.totalPrice.toFixed(2)}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No enclosure selected
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ pt: 0 }}>
        {enclosure ? (
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => openEnclosureManager(panel.panelId, enclosure.panelItemId)}
          >
            Edit
          </Button>
        ) : (
          <Button
            size="small"
            color="warning"
            startIcon={<AddIcon />}
            onClick={() => openEnclosureManager(panel.panelId)}
          >
            Add Enclosure
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

export default PanelEnclosureCard;
```

## Example 4: Wrap App with Provider

### In your main App.tsx or layout:

```tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { EnclosureProvider } from './components/enclosures';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import PanelDesigner from './pages/PanelDesigner';
import Dashboard from './pages/Dashboard';

function App() {
  const handleEnclosureAdded = () => {
    // Called after enclosure is successfully added/updated
    // Use this to refresh panel data if needed
    console.log('Enclosure operation completed');
    // You could also dispatch a Redux action or use a refetch pattern here
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <EnclosureProvider onEnclosureAdded={handleEnclosureAdded}>
          {/* Your routes and components */}
          <PanelDesigner />
          <Dashboard />
        </EnclosureProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
```

## Example 5: Complete Panel Designer Integration

### Full working example:

```tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Paper
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PanelDetail, PanelItemType } from '../types';
import { usePanels, useEnclosureManager } from '../hooks';
import PanelItemsTable from '../components/PanelItemsTable';
import PanelEnclosureCard from '../components/PanelEnclosureCard';

function PanelDesigner({ panelId }: { panelId: number }) {
  const { openEnclosureManager } = useEnclosureManager();
  const { panels, isLoading, error, refetch } = usePanels();
  const [tabValue, setTabValue] = useState(0);

  const panel = panels.find((p) => p.panelId === panelId);

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!panel) return <Alert severity="warning">Panel not found</Alert>;

  const enclosureItem = panel.enclosureItems?.[0];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{panel.panelName}</h1>
        {!enclosureItem && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<AddIcon />}
            onClick={() => openEnclosureManager(panel.panelId)}
          >
            Add Enclosure
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Panel Items" />
          <Tab label="Enclosure Details" />
          <Tab label="Summary" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <PanelItemsTable 
              panelId={panel.panelId}
              items={panel.items}
              onItemDeleted={() => refetch()}
            />
          )}

          {tabValue === 1 && (
            <PanelEnclosureCard panel={panel} />
          )}

          {tabValue === 2 && (
            <Box>
              <div>Total Items: {panel.summary.totalItems}</div>
              <div>Total Price: EGP {panel.summary.totalPrice.toFixed(2)}</div>
              <div>
                Enclosure: {enclosureItem ? enclosureItem.description : 'Not selected'}
              </div>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default PanelDesigner;
```

## Example 6: Using the useEnclosure Hook Directly

### Advanced usage for custom UI:

```tsx
import React, { useEffect } from 'react';
import { useEnclosure } from '../hooks';
import { EnclosureComponent } from '../types';

function CustomEnclosureUI({ panelId }: { panelId: number }) {
  const {
    state,
    components,
    isLoading,
    error,
    loadComponents,
    addComponent,
    removeComponent,
    updateComponentQty,
    updateComponentNotes,
    saveEnclosure,
    validateEnclosure
  } = useEnclosure({ panelId });

  useEffect(() => {
    loadComponents();
  }, []);

  const handleSave = async () => {
    const validation = validateEnclosure();
    if (!validation.valid) {
      alert(`Errors:\n${validation.errors.join('\n')}`);
      return;
    }

    try {
      await saveEnclosure();
      alert('Enclosure saved successfully!');
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div>
      <h2>Custom Enclosure Builder</h2>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {isLoading && <p>Loading...</p>}

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Catalog */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '10px' }}>
          <h3>Available Components</h3>
          {components.map((comp) => (
            <div
              key={comp.enclosureComponentId}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                marginBottom: '5px',
                cursor: 'pointer'
              }}
              onClick={() => addComponent(comp)}
            >
              <div>{comp.reference} - {comp.description}</div>
              <div style={{ fontSize: '0.9em', color: '#999' }}>
                EGP {comp.totalPriceList}
              </div>
              <button>+ Add</button>
            </div>
          ))}
        </div>

        {/* Selected Components */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '10px' }}>
          <h3>Selected ({state.components.length})</h3>
          {state.components.length === 0 ? (
            <p>No components selected</p>
          ) : (
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {state.components.map((comp, idx) => (
                  <tr key={idx}>
                    <td>{comp.description}</td>
                    <td>
                      <input
                        type="number"
                        value={comp.qty}
                        onChange={(e) => updateComponentQty(idx, Number(e.target.value))}
                        style={{ width: '50px' }}
                      />
                    </td>
                    <td>EGP {comp.totalPriceList}</td>
                    <td>
                      <input
                        type="text"
                        value={comp.notesName || ''}
                        onChange={(e) => updateComponentNotes(idx, e.target.value)}
                      />
                    </td>
                    <td>
                      <button onClick={() => removeComponent(idx)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: '15px', fontWeight: 'bold' }}>
            Total: EGP {state.totalPrice.toFixed(2)}
          </div>

          <button 
            onClick={handleSave}
            disabled={state.components.length === 0 || !state.isDirty}
            style={{ marginTop: '10px', padding: '10px 20px' }}
          >
            {state.panelItemId ? 'Update' : 'Save'} Enclosure
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomEnclosureUI;
```

## Integration Points

### 1. In PanelDesigner Page
- Add button to open EnclosureManager
- Display enclosure in panel items list
- Handle edit/delete actions

### 2. In Panel Summary/Overview
- Show enclosure status
- Quick edit link
- Price contribution to total

### 3. In Admin Dashboard
- Show enclosure statistics
- Component popularity
- Usage patterns

### 4. In Offer/Quote Generation
- Include enclosure details
- Show component breakdown option
- Calculate total with enclosure

## Data Flow

```
User clicks "Add Enclosure"
        ↓
EnclosureManager opens
        ↓
User chooses Ready or Custom
        ↓
Ready: Material selected → Panel item created
        ↓
Custom: Components selected → Full snapshot saved → Panel item created
        ↓
Panel refreshes
        ↓
Enclosure visible in panel items
```

## State Management Flow

```
useEnclosure Hook initialized
        ↓
Components loaded from API
        ↓
User adds/removes/edits components
        ↓ (each change: isDirty = true, total recalculated)
        ↓
User clicks Save
        ↓
Validation checks run
        ↓
If valid: API call saves enclosure
        ↓
If new: panelItemId updated
        ↓
isDirty = false
        ↓
Dialog closes, callback triggers
```

## Tips & Tricks

1. **Auto-refresh panel after save:**
   ```tsx
   onEnclosureAdded={() => refetch()}
   ```

2. **Show loading state:**
   ```tsx
   {isLoading && <Skeleton variant="rect" height={200} />}
   ```

3. **Conditional rendering:**
   ```tsx
   {enclosure && <EnclosureDetails data={enclosure} />}
   {!enclosure && <AddEnclosureButton />}
   ```

4. **Handle errors gracefully:**
   ```tsx
   catch (err) {
     setError(err instanceof Error ? err.message : 'Unknown error');
     setTimeout(() => setError(null), 5000);
   }
   ```

---

For more information, see the main implementation guide.
