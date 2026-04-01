import React from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export interface MenuAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  divider?: boolean;
  color?: 'inherit' | 'primary' | 'error';
  disabled?: boolean;
}

interface ActionMenuProps {
  actions: MenuAction[];
  icon?: React.ReactNode;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  actions,
  icon = <MoreVertIcon />,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: MenuAction) => {
    handleClose();
    action.onClick();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label="actions"
      >
        {icon}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
      >
        {actions.map((action, index) => (
          <React.Fragment key={action.label}>
            {action.divider && index > 0 && <Divider />}
            <MenuItem
              onClick={() => handleAction(action)}
              disabled={action.disabled}
              sx={{ color: action.color === 'error' ? 'error.main' : undefined }}
            >
              {action.icon && (
                <ListItemIcon sx={{ color: 'inherit' }}>{action.icon}</ListItemIcon>
              )}
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          </React.Fragment>
        ))}
      </Menu>
    </>
  );
};

export default ActionMenu;
