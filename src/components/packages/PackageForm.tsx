import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { Button, Loading, EmptyState } from '../common';
import { useBrands, useCategories, useMaterials } from '../../hooks';
import { Material } from '../../types';
import toast from 'react-hot-toast';
import MaterialSelectionModal from '../panels/MaterialSelectionModal/MaterialSelectionModal';

export interface PackageFormItemValue {
  materialId: number;
  quantity: number;
}

export interface PackageFormValues {
  packageName: string;
  description: string;
  items: PackageFormItemValue[];
}

interface PackageFormProps {
  initialValues?: Partial<PackageFormValues>;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: PackageFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

const normalizeInitialValues = (values?: Partial<PackageFormValues>): PackageFormValues => ({
  packageName: values?.packageName ?? '',
  description: values?.description ?? '',
  items: values?.items?.map((item) => ({
    materialId: item.materialId,
    quantity: item.quantity,
  })) ?? [],
});

export const PackageForm: React.FC<PackageFormProps> = ({
  initialValues,
  submitLabel,
  loading = false,
  onSubmit,
  onCancel,
}) => {
  const theme = useTheme();
  const { data: materials = [], isLoading: materialsLoading } = useMaterials();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  const [values, setValues] = useState<PackageFormValues>(normalizeInitialValues(initialValues));
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setValues(normalizeInitialValues(initialValues));
  }, [initialValues]);

  const totalQuantity = useMemo(
    () => values.items.reduce((sum, item) => sum + item.quantity, 0),
    [values.items]
  );

  const handleChange = (field: keyof Omit<PackageFormValues, 'items'>) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormError('');
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleAddMaterials = (selections: { material: Material; quantity: number }[]) => {
    setFormError('');

    if (selections.length === 0) {
      return;
    }

    setValues((current) => {
      const currentMaterialIds = new Set(current.items.map((item) => item.materialId));
      const nextItems = [...current.items];

      selections.forEach(({ material, quantity: selectedQuantity }) => {
        if (currentMaterialIds.has(material.materialId)) {
          toast.error(`${material.itemCode} is already in the package`);
          return;
        }

        nextItems.push({
          materialId: material.materialId,
          quantity: selectedQuantity,
        });
        currentMaterialIds.add(material.materialId);
      });

      return {
        ...current,
        items: nextItems,
      };
    });
  };

  const handleQuantityChange = (materialId: number, nextQuantity: string) => {
    const parsedQuantity = Number(nextQuantity);

    setValues((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.materialId === materialId
          ? {
              ...item,
              quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 0,
            }
          : item
      ),
    }));
  };

  const handleRemoveItem = (materialId: number) => {
    setValues((current) => ({
      ...current,
      items: current.items.filter((item) => item.materialId !== materialId),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const packageName = values.packageName.trim();
    const description = values.description.trim();

    if (!packageName) {
      setFormError('Package name is required');
      return;
    }

    if (values.items.length === 0) {
      setFormError('Add at least one material to the package');
      return;
    }

    if (values.items.some((item) => item.quantity <= 0)) {
      setFormError('All item quantities must be greater than zero');
      return;
    }

    await onSubmit({
      packageName,
      description,
      items: values.items,
    });
  };

  if (materialsLoading && materials.length === 0) {
    return <Loading message="Loading materials..." />;
  }

  if (!materialsLoading && materials.length === 0) {
    return (
      <EmptyState
        icon={<Inventory2Icon />}
        title="No materials available"
        description="Create materials first so you can build reusable packages from them."
      />
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.grey[50], 0.98)} 100%)`,
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Package Basics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define the reusable bundle and the materials it contains.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <TextField
                label="Package Name *"
                value={values.packageName}
                onChange={handleChange('packageName')}
                fullWidth
                size="small"
                placeholder="e.g. Panel Enclosure Kit"
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={`${values.items.length} items`} variant="outlined" />
                  <Chip size="small" label={`${totalQuantity} total qty`} variant="outlined" />
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={values.description}
                onChange={handleChange('description')}
                fullWidth
                size="small"
                multiline
                rows={3}
                placeholder="Optional package description"
              />
            </Grid>
          </Grid>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Package Items
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add materials using the shared catalog picker and set the quantity for each item.
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                mb: 2,
                backgroundColor: 'rgba(25, 118, 210, 0.03)',
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                <Button
                  variant="primary"
                  type="button"
                  icon={<AddCircleOutlineIcon />}
                  onClick={() => setMaterialsModalOpen(true)}
                >
                  Add Materials
                </Button>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Open the shared material picker to search, filter, and add one or more materials.
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Stack spacing={1.5}>
              {values.items.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    textAlign: 'center',
                    color: 'text.secondary',
                    backgroundColor: 'rgba(0, 0, 0, 0.01)',
                  }}
                >
                  No items added yet.
                </Paper>
              ) : (
                values.items.map((item) => {
                  const material = materials.find((entry) => entry.materialId === item.materialId);

                  return (
                    <Paper
                      key={item.materialId}
                      variant="outlined"
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2,
                        flexDirection: { xs: 'column', sm: 'row' },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {material?.itemCode || `Material #${item.materialId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {material?.description || 'Material information unavailable'}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <TextField
                          label="Qty"
                          size="small"
                          type="number"
                          value={String(item.quantity)}
                          onChange={(event) => handleQuantityChange(item.materialId, event.target.value)}
                          inputProps={{ min: 1, step: 1, style: { width: 90 } }}
                          sx={{ width: 110 }}
                        />
                        <IconButton
                          aria-label="remove item"
                          color="error"
                          onClick={() => handleRemoveItem(item.materialId)}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    </Paper>
                  );
                })
              )}
            </Stack>
          </Box>

          {formError && (
            <Typography variant="body2" color="error" fontWeight={600}>
              {formError}
            </Typography>
          )}

          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1.5}
            justifyContent="flex-end"
          >
            {onCancel && (
              <Button variant="ghost" type="button" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
            <Button variant="primary" type="submit" loading={loading}>
              {submitLabel}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <MaterialSelectionModal
        open={materialsModalOpen}
        onClose={() => setMaterialsModalOpen(false)}
        title="Add Materials to Package"
        zoneColor={theme.palette.warning.dark}
        materials={materials}
        categories={categories}
        brands={brands}
        onAddMaterials={handleAddMaterials}
      />
    </Box>
  );
};

export default PackageForm;