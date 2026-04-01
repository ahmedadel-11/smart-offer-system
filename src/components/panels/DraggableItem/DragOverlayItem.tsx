import React from 'react';
import { Box, Typography } from '@mui/material';
import { PanelItem } from '../../../types';

interface DragOverlayItemProps {
  item: PanelItem;
}

export const DragOverlayItem: React.FC<DragOverlayItemProps> = ({ item }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: { xs: 1.5, sm: 2 },
        backgroundColor: 'white',
        borderRadius: 1,
        border: '2px solid',
        borderColor: 'primary.main',
        boxShadow: 4,
        cursor: 'grabbing',
        minWidth: { xs: 200, sm: 300 },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {item.itemCode}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {item.description}
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          fontWeight: 500,
          fontSize: 12,
        }}
      >
        x{item.quantity}
      </Box>
    </Box>
  );
};

export default DragOverlayItem;
