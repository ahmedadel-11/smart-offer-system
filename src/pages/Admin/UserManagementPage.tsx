import React, { useState } from 'react';
import { Box, Button as MuiButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { Loading } from '../../components/common/Loading/Loading';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import { UserTable } from '../../components/users/UserTable';
import { UserForm } from '../../components/users/UserForm';
import { AssignRolesModal } from '../../components/users/AssignRolesModal';
import { ResetPasswordModal } from '../../components/users/ResetPasswordModal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
  useAssignRoles,
} from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import type { UserDto, CreateUserDto, UpdateUserDto } from '../../types';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export const UserManagementPage: React.FC = () => {
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const assignRoles = useAssignRoles();

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [assignRolesUser, setAssignRolesUser] = useState<UserDto | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserDto | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserDto | null>(null);

  // Handlers
  const handleCreateUser = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const handleEditUser = (user: UserDto) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: Record<string, unknown>) => {
    if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, data: data as unknown as UpdateUserDto },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createUser.mutate(data as unknown as CreateUserDto, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const handleToggleStatus = (user: UserDto) => {
    if (user.isActive) {
      deactivateUser.mutate(user.id);
    } else {
      activateUser.mutate(user.id);
    }
  };

  const handleAssignRoles = (roleIds: string[]) => {
    if (assignRolesUser) {
      assignRoles.mutate(
        { id: assignRolesUser.id, data: { roleIds } },
        { onSuccess: () => setAssignRolesUser(null) }
      );
    }
  };

  const handleResetPassword = (newPassword: string) => {
    if (resetPasswordUser) {
      authService
        .resetPassword({ userId: resetPasswordUser.id, newPassword })
        .then(() => {
          toast.success('Password reset successfully');
          setResetPasswordUser(null);
        })
        .catch(() => {
          toast.error('Failed to reset password');
        });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmUser) {
      deleteUser.mutate(deleteConfirmUser.id, {
        onSuccess: () => setDeleteConfirmUser(null),
      });
    }
  };

  if (isLoading) return <Loading message="Loading users..." />;

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle="Manage system users, roles, and access"
        actions={
          <MuiButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Add User
          </MuiButton>
        }
      />

      {users.length === 0 ? (
        <EmptyState
          icon={<PeopleIcon sx={{ fontSize: 64 }} />}
          title="No Users"
          description="Get started by creating your first user."
          action={{ label: 'Add User', onClick: handleCreateUser }}
        />
      ) : (
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onAssignRoles={setAssignRolesUser}
          onResetPassword={setResetPasswordUser}
          onToggleStatus={handleToggleStatus}
          onDelete={setDeleteConfirmUser}
        />
      )}

      {/* Create/Edit User Modal */}
      <UserForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={editingUser}
        roles={roles}
        isLoading={createUser.isPending || updateUser.isPending}
      />

      {/* Assign Roles Modal */}
      <AssignRolesModal
        isOpen={!!assignRolesUser}
        onClose={() => setAssignRolesUser(null)}
        onSubmit={handleAssignRoles}
        user={assignRolesUser}
        roles={roles}
        isLoading={assignRoles.isPending}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={!!resetPasswordUser}
        onClose={() => setResetPasswordUser(null)}
        onSubmit={handleResetPassword}
        user={resetPasswordUser}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirmUser}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteConfirmUser?.fullName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmUser(null)}
        loading={deleteUser.isPending}
      />
    </Box>
  );
};

export default UserManagementPage;
