import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  Tooltip,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import type { UserDto, RoleDto } from '../../types';

interface AssignRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleIds: string[]) => void;
  user: UserDto | null;
  roles: RoleDto[];
  isLoading?: boolean;
}

export const AssignRolesModal: React.FC<AssignRolesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  roles,
  isLoading = false,
}) => {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    if (user && roles.length > 0) {
      // Map user role names to role IDs
      const userRoleIds = roles
        .filter((r) => user.roles.includes(r.name))
        .map((r) => r.id);
      setSelectedRoleIds(userRoleIds);
    }
  }, [user, roles]);

  const handleToggle = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedRoleIds);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Roles to ${user?.fullName || ''}`}
      size="xs"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
            Save
          </Button>
        </Box>
      }
    >
      <List dense>
        {roles.map((role) => (
          <ListItem key={role.id} dense disablePadding sx={{ mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Checkbox
                edge="start"
                checked={selectedRoleIds.includes(role.id)}
                onChange={() => handleToggle(role.id)}
                size="small"
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {role.name}
                  </Typography>
                  {role.isSystemRole && (
                    <Tooltip title="System role">
                      <LockIcon sx={{ fontSize: 14, color: '#FF9800' }} />
                    </Tooltip>
                  )}
                </Box>
              }
              secondary={role.description || undefined}
            />
          </ListItem>
        ))}
        {roles.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No roles available
          </Typography>
        )}
      </List>
    </Modal>
  );
};

export default AssignRolesModal;
