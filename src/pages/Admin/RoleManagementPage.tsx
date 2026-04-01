import React, { useState } from 'react';
import { Box, Button as MuiButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SecurityIcon from '@mui/icons-material/Security';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { Loading } from '../../components/common/Loading/Loading';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import { RoleTable } from '../../components/roles/RoleTable';
import { RoleForm } from '../../components/roles/RoleForm';
import { PermissionSelector } from '../../components/roles/PermissionSelector';
import { Modal } from '../../components/common/Modal/Modal';
import { Button } from '../../components/common/Button/Button';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useUpdateSystemRole,
  useDeleteRole,
  useAssignPermissions,
} from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { useUsers } from '../../hooks/useUsers';
import type { RoleDto, CreateRoleDto, UpdateRoleDto } from '../../types';
import toast from 'react-hot-toast';

export const RoleManagementPage: React.FC = () => {
  const { data: roles = [], isLoading } = useRoles();
  const { data: permissions = [] } = usePermissions();
  const { data: users = [] } = useUsers();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const updateSystemRole = useUpdateSystemRole();
  const deleteRole = useDeleteRole();
  const assignPermissions = useAssignPermissions();

  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
  const [managePermsRole, setManagePermsRole] = useState<RoleDto | null>(null);
  const [managePermsIds, setManagePermsIds] = useState<string[]>([]);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<RoleDto | null>(null);

  const handleCreateRole = () => {
    setEditingRole(null);
    setFormOpen(true);
  };

  const handleEditRole = (role: RoleDto) => {
    setEditingRole(role);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: { name: string; description?: string; permissionIds: string[] }) => {
    if (editingRole) {
      if (editingRole.isSystemRole) {
        // Use the dedicated system role endpoint: PUT /api/roles/{id}/system
        updateSystemRole.mutate(
          {
            id: editingRole.id,
            data: {
              description: data.description,
              permissionIds: data.permissionIds,
            },
          },
          {
            onSuccess: () => setFormOpen(false),
            onError: (error: any) => {
              const message = error?.response?.data?.message || 'Failed to update system role';
              toast.error(message);
            },
          }
        );
      } else {
        // Custom role: use PUT /api/roles/{id} + POST /api/roles/{id}/permissions
        updateRole.mutate(
          { id: editingRole.id, data: { name: data.name, description: data.description } as UpdateRoleDto },
          {
            onSuccess: () => {
              assignPermissions.mutate({
                id: editingRole.id,
                data: { permissionIds: data.permissionIds },
              });
              setFormOpen(false);
            },
            onError: (error: any) => {
              const message = error?.response?.data?.message || 'Failed to update role';
              toast.error(message);
            },
          }
        );
      }
    } else {
      createRole.mutate(data as CreateRoleDto, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleManagePermissions = (role: RoleDto) => {
    const permIds = permissions
      .filter((p) => role.permissions.includes(p.name))
      .map((p) => p.id);
    setManagePermsIds(permIds);
    setManagePermsRole(role);
  };

  const handleSavePermissions = () => {
    if (managePermsRole) {
      if (managePermsRole.isSystemRole) {
        // System roles: use PUT /api/roles/{id}/system
        updateSystemRole.mutate(
          {
            id: managePermsRole.id,
            data: {
              description: managePermsRole.description || undefined,
              permissionIds: managePermsIds,
            },
          },
          { onSuccess: () => setManagePermsRole(null) }
        );
      } else {
        // Custom roles: use POST /api/roles/{id}/permissions
        assignPermissions.mutate(
          { id: managePermsRole.id, data: { permissionIds: managePermsIds } },
          { onSuccess: () => setManagePermsRole(null) }
        );
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmRole) {
      deleteRole.mutate(deleteConfirmRole.id, {
        onSuccess: () => setDeleteConfirmRole(null),
      });
    }
  };

  if (isLoading) return <Loading message="Loading roles..." />;

  return (
    <Box>
      <PageHeader
        title="Role Management"
        subtitle="Manage roles and their permissions"
        actions={
          <MuiButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRole}
          >
            Add Role
          </MuiButton>
        }
      />

      {roles.length === 0 ? (
        <EmptyState
          icon={<SecurityIcon sx={{ fontSize: 64 }} />}
          title="No Roles"
          description="Get started by creating your first role."
          action={{ label: 'Add Role', onClick: handleCreateRole }}
        />
      ) : (
        <RoleTable
          roles={roles}
          users={users}
          onEdit={handleEditRole}
          onManagePermissions={handleManagePermissions}
          onDelete={setDeleteConfirmRole}
        />
      )}

      {/* Create/Edit Role Modal */}
      <RoleForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        role={editingRole}
        permissions={permissions}
        isLoading={createRole.isPending || updateRole.isPending || updateSystemRole.isPending}
      />

      {/* Manage Role Permissions Modal */}
      <Modal
        isOpen={!!managePermsRole}
        onClose={() => setManagePermsRole(null)}
        title={`Manage Permissions for ${managePermsRole?.name || ''}`}
        size="md"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="ghost" onClick={() => setManagePermsRole(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePermissions}
              loading={assignPermissions.isPending || updateSystemRole.isPending}
            >
              Save
            </Button>
          </Box>
        }
      >
        <PermissionSelector
          permissions={permissions}
          selectedIds={managePermsIds}
          onChange={setManagePermsIds}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirmRole}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${deleteConfirmRole?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmRole(null)}
        loading={deleteRole.isPending}
      />
    </Box>
  );
};

export default RoleManagementPage;
