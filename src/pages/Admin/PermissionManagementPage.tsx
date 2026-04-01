import React, { useState } from 'react';
import { Box, Button as MuiButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { Loading } from '../../components/common/Loading/Loading';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import { PermissionTable } from '../../components/permissions/PermissionTable';
import { PermissionForm } from '../../components/permissions/PermissionForm';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import {
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from '../../hooks/usePermissions';
import type { PermissionDto, CreatePermissionDto, UpdatePermissionDto } from '../../types';

export const PermissionManagementPage: React.FC = () => {
  const { data: permissions = [], isLoading } = usePermissions();
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();
  const deletePermission = useDeletePermission();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionDto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<PermissionDto | null>(null);

  const handleCreate = () => {
    setEditingPermission(null);
    setFormOpen(true);
  };

  const handleEdit = (perm: PermissionDto) => {
    setEditingPermission(perm);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: { name: string; description?: string; category: string }) => {
    if (editingPermission) {
      updatePermission.mutate(
        { id: editingPermission.id, data: data as UpdatePermissionDto },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createPermission.mutate(data as CreatePermissionDto, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deletePermission.mutate(deleteConfirm.id, {
        onSuccess: () => setDeleteConfirm(null),
      });
    }
  };

  if (isLoading) return <Loading message="Loading permissions..." />;

  return (
    <Box>
      <PageHeader
        title="Permission Management"
        subtitle="Manage system permissions and categories"
        actions={
          <MuiButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add Permission
          </MuiButton>
        }
      />

      {permissions.length === 0 ? (
        <EmptyState
          icon={<VpnKeyIcon sx={{ fontSize: 64 }} />}
          title="No Permissions"
          description="Get started by creating your first permission."
          action={{ label: 'Add Permission', onClick: handleCreate }}
        />
      ) : (
        <PermissionTable
          permissions={permissions}
          onEdit={handleEdit}
          onDelete={setDeleteConfirm}
        />
      )}

      <PermissionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        permission={editingPermission}
        isLoading={createPermission.isPending || updatePermission.isPending}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Permission"
        message={`Are you sure you want to delete the permission "${deleteConfirm?.name}"? This may affect roles using it.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        loading={deletePermission.isPending}
      />
    </Box>
  );
};

export default PermissionManagementPage;
