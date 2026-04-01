import React from 'react';
import { Grid, Box, Pagination } from '@mui/material';
import { MaterialCard } from '../MaterialCard/MaterialCard';
import { Loading, EmptyState } from '../../common';
import { Material } from '../../../types';
import InventoryIcon from '@mui/icons-material/Inventory';

interface MaterialListProps {
  materials: Material[];
  loading?: boolean;
  onAddToPanel?: (material: Material, quantity: number) => void;
  showActions?: boolean;
  pageSize?: number;
  compact?: boolean;
  onEdit?: (material: Material) => void;
  onDelete?: (material: Material) => void;
}

export const MaterialList: React.FC<MaterialListProps> = ({
  materials,
  loading = false,
  onAddToPanel,
  showActions = true,
  pageSize = 12,
  compact = false,
  onEdit,
  onDelete,
}) => {
  const [page, setPage] = React.useState(1);

  if (loading) {
    return <Loading message="Loading materials..." />;
  }

  if (materials.length === 0) {
    return (
      <EmptyState
        icon={<InventoryIcon />}
        title="No Materials Found"
        description="Try adjusting your search filters or add new materials to your catalog."
      />
    );
  }

  const totalPages = Math.ceil(materials.length / pageSize);
  const paginatedMaterials = materials.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Box>
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {paginatedMaterials.map((material) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={material.materialId}>
            <MaterialCard
              material={material}
              onAddToPanel={onAddToPanel}
              showActions={showActions}
              compact={compact}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 4 } }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
            size="small"
          />
        </Box>
      )}
    </Box>
  );
};

export default MaterialList;
