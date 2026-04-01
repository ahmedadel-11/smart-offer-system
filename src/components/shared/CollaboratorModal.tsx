import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Box,
  Typography,
  Button,
  InputAdornment,
  Divider,
  CircularProgress,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { CollaboratorDto, AddCollaboratorDto, UserDto } from '../../types';

interface CollaboratorModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  collaborators: CollaboratorDto[];
  users?: UserDto[];
  onAdd: (dto: AddCollaboratorDto) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  loading?: boolean;
}

export const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
  open,
  onClose,
  title,
  collaborators,
  users = [],
  onAdd,
  onRemove,
  loading: _loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const collaboratorUserIds = new Set(collaborators.map((c) => c.userId));

  const filteredUsers = users.filter((user) => {
    if (collaboratorUserIds.has(user.id)) return false;
    if (!searchTerm) return false;
    const term = searchTerm.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term)
    );
  });

  const handleAdd = async (userId: string) => {
    setAddingUserId(userId);
    try {
      await onAdd({ userId, roleInProject: roleInput || undefined });
      setRoleInput('');
      setSearchTerm('');
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemove = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      await onRemove(userId);
    } finally {
      setRemovingUserId(null);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Search to add users */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users to add..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Search Results */}
        {filteredUsers.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Search Results
            </Typography>
            <List dense disablePadding>
              {filteredUsers.slice(0, 5).map((user) => (
                <ListItem
                  key={user.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>
                      {getInitials(user.fullName)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.fullName}
                    secondary={user.email}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      color="primary"
                      onClick={() => handleAdd(user.id)}
                      disabled={addingUserId === user.id}
                    >
                      {addingUserId === user.id ? (
                        <CircularProgress size={18} />
                      ) : (
                        <PersonAddIcon fontSize="small" />
                      )}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Current Collaborators */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Collaborators ({collaborators.length})
        </Typography>

        {collaborators.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No collaborators yet. Search for users above to add them.
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {collaborators.map((collab) => (
              <ListItem
                key={collab.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'secondary.main' }}>
                    {getInitials(collab.userName)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {collab.userName || 'Unknown User'}
                      </Typography>
                      {collab.roleInProject && (
                        <Chip label={collab.roleInProject} size="small" sx={{ height: 20, fontSize: 11 }} />
                      )}
                    </Box>
                  }
                  secondary={`Added ${new Date(collab.addedAt).toLocaleDateString()}`}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    color="error"
                    onClick={() => handleRemove(collab.userId)}
                    disabled={removingUserId === collab.userId}
                  >
                    {removingUserId === collab.userId ? (
                      <CircularProgress size={18} />
                    ) : (
                      <DeleteIcon fontSize="small" />
                    )}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CollaboratorModal;
