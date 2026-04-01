import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  Grid,
  MenuItem,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  PageHeader,
  Button,
  MaterialSearch,
  MaterialList,
  CategoryTabs,
  Modal,
  ConfirmDialog,
} from '../../components';
import {
  useMaterials,
  useCategories,
  useBrands,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from '../../hooks';
import { Material, MaterialSearchFilters, CreateMaterial, UpdateMaterial } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import toast from 'react-hot-toast';

interface MaterialFormData {
  itemCode: string;
  description: string;
  brand: string;
  ratedCurrent: string;
  isc: string;
  noOfPoles: string;
  reference: string;
  basePrice: string;
  defaultDiscount: string;
  category: string;
}

const emptyForm: MaterialFormData = {
  itemCode: '',
  description: '',
  brand: '',
  ratedCurrent: '',
  isc: '',
  noOfPoles: '',
  reference: '',
  basePrice: '',
  defaultDiscount: '0',
  category: '',
};

export const MaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canCreate = hasPermission('Materials.Create');
  const canEdit = hasPermission('Materials.Edit');
  const canDelete = hasPermission('Materials.Delete');
  const canImport = hasPermission('Materials.Import');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFilters, setSearchFilters] = useState<MaterialSearchFilters>({});
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(emptyForm);

  const { data: materials, isLoading } = useMaterials();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const createMaterialMutation = useCreateMaterial();
  const updateMaterialMutation = useUpdateMaterial();
  const deleteMaterialMutation = useDeleteMaterial();

  // Filter materials based on search and category
  const filteredMaterials = useMemo(() => {
    if (!materials) return [];

    return materials.filter((material) => {
      if (selectedCategory !== 'all' && material.category !== selectedCategory) {
        return false;
      }
      if (searchFilters.searchTerm) {
        const term = searchFilters.searchTerm.toLowerCase();
        const matchesTerm =
          material.itemCode.toLowerCase().includes(term) ||
          material.description.toLowerCase().includes(term) ||
          material.brand.toLowerCase().includes(term) ||
          (material.reference?.toLowerCase().includes(term) ?? false);
        if (!matchesTerm) return false;
      }
      if (searchFilters.brand && material.brand !== searchFilters.brand) {
        return false;
      }
      if (searchFilters.ratedCurrent && material.ratedCurrent !== searchFilters.ratedCurrent) {
        return false;
      }
      if (searchFilters.isc && material.isc !== searchFilters.isc) {
        return false;
      }
      return true;
    });
  }, [materials, selectedCategory, searchFilters]);

  const categoryCounts = useMemo(() => {
    if (!materials) return {};
    return materials.reduce((acc, material) => {
      acc[material.category] = (acc[material.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [materials]);

  const handleSearch = (filters: MaterialSearchFilters) => {
    setSearchFilters(filters);
  };

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setFormData(emptyForm);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      itemCode: material.itemCode,
      description: material.description,
      brand: material.brand,
      ratedCurrent: material.ratedCurrent || '',
      isc: material.isc || '',
      noOfPoles: material.noOfPoles?.toString() || '',
      reference: material.reference || '',
      basePrice: material.basePrice.toString(),
      defaultDiscount: material.defaultDiscount.toString(),
      category: material.category,
    });
    setIsFormModalOpen(true);
  };

  const handleFormChange = (field: keyof MaterialFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.itemCode || !formData.description || !formData.basePrice || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingMaterial) {
        const updateData: UpdateMaterial = {
          itemCode: formData.itemCode,
          description: formData.description,
          brand: formData.brand,
          ratedCurrent: formData.ratedCurrent || undefined,
          isc: formData.isc || undefined,
          noOfPoles: formData.noOfPoles ? parseInt(formData.noOfPoles) : undefined,
          reference: formData.reference || undefined,
          basePrice: parseFloat(formData.basePrice),
          defaultDiscount: parseFloat(formData.defaultDiscount || '0'),
          category: formData.category,
          isActive: editingMaterial.isActive,
        };
        await updateMaterialMutation.mutateAsync({
          id: editingMaterial.materialId,
          data: updateData,
        });
        toast.success('Material updated successfully');
      } else {
        const createData: CreateMaterial = {
          itemCode: formData.itemCode,
          description: formData.description,
          brand: formData.brand,
          ratedCurrent: formData.ratedCurrent || undefined,
          isc: formData.isc || undefined,
          noOfPoles: formData.noOfPoles ? parseInt(formData.noOfPoles) : undefined,
          reference: formData.reference || undefined,
          basePrice: parseFloat(formData.basePrice),
          defaultDiscount: parseFloat(formData.defaultDiscount || '0'),
          category: formData.category,
        };
        await createMaterialMutation.mutateAsync(createData);
        toast.success('Material created successfully');
      }
      setIsFormModalOpen(false);
      setFormData(emptyForm);
      setEditingMaterial(null);
    } catch {
      toast.error(editingMaterial ? 'Failed to update material' : 'Failed to create material');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMaterialMutation.mutateAsync(deleteId);
      toast.success('Material deleted successfully');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete material');
    }
  };

  const materialBeingDeleted = materials?.find((m) => m.materialId === deleteId);

  return (
    <Box>
      <PageHeader
        title="Materials"
        subtitle={`Browse and manage your material catalog (${materials?.length || 0} total)`}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canImport && (
              <Button
                variant="outline"
                icon={<UploadFileIcon />}
                onClick={() => navigate('/import')}
              >
                Import
              </Button>
            )}
            {canCreate && (
              <Button
                variant="primary"
                icon={<AddIcon />}
                onClick={handleOpenCreate}
              >
                Add Material
              </Button>
            )}
          </Box>
        }
      />

      {/* Search */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
        <MaterialSearch
          onSearch={handleSearch}
          categories={categories || []}
          brands={brands || []}
          showAdvanced
        />
      </Paper>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories || []}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      {/* Materials Grid */}
      <MaterialList
        materials={filteredMaterials}
        loading={isLoading}
        showActions={canEdit || canDelete}
        onEdit={canEdit ? handleOpenEdit : undefined}
        onDelete={canDelete ? (material: Material) => setDeleteId(material.materialId) : undefined}
      />

      {/* Create/Edit Material Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingMaterial(null);
          setFormData(emptyForm);
        }}
        title={editingMaterial ? 'Edit Material' : 'Add New Material'}
        size="md"
      >
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Item Code *"
                value={formData.itemCode}
                onChange={handleFormChange('itemCode')}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category *"
                value={formData.category}
                onChange={handleFormChange('category')}
                fullWidth
                size="small"
                select={!!(categories && categories.length > 0)}
              >
                {categories?.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description *"
                value={formData.description}
                onChange={handleFormChange('description')}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Brand"
                value={formData.brand}
                onChange={handleFormChange('brand')}
                fullWidth
                size="small"
                select={!!(brands && brands.length > 0)}
              >
                {brands?.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Reference"
                value={formData.reference}
                onChange={handleFormChange('reference')}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Rated Current"
                value={formData.ratedCurrent}
                onChange={handleFormChange('ratedCurrent')}
                fullWidth
                size="small"
                placeholder="e.g., 63A"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Isc (Short Circuit)"
                value={formData.isc}
                onChange={handleFormChange('isc')}
                fullWidth
                size="small"
                placeholder="e.g., 6kA"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="No. of Poles"
                value={formData.noOfPoles}
                onChange={handleFormChange('noOfPoles')}
                fullWidth
                size="small"
                type="number"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
                Pricing
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Base Price *"
                value={formData.basePrice}
                onChange={handleFormChange('basePrice')}
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Default Discount (%)"
                value={formData.defaultDiscount}
                onChange={handleFormChange('defaultDiscount')}
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button
              variant="ghost"
              onClick={() => {
                setIsFormModalOpen(false);
                setEditingMaterial(null);
                setFormData(emptyForm);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={createMaterialMutation.isPending || updateMaterialMutation.isPending}
            >
              {editingMaterial ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Material"
        message={`Are you sure you want to delete "${materialBeingDeleted?.description || ''}" (${materialBeingDeleted?.itemCode || ''})? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteMaterialMutation.isPending}
      />
    </Box>
  );
};

export default MaterialsPage;
