import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { EnclosureMode, Material, PanelItem } from '../../types';
import { EnclosureChoice } from './EnclosureChoice';
import { ReadyEnclosurePicker } from './ReadyEnclosurePicker';
import { CustomEnclosureBuilder } from './CustomEnclosureBuilder';
import { panelItemService } from '../../services';
import { PANEL_ITEMS_QUERY_KEY } from '../../hooks/usePanelItems';
import { PANELS_QUERY_KEY } from '../../hooks/usePanels';

interface EnclosureManagerProps {
  open: boolean;
  onClose: () => void;
  onEnclosureAdded: (enclosure: PanelItem) => void;
  panelId: number;
  existingEnclosurePanelItemId?: number;
}

/**
 * Main Enclosure Manager component
 * Orchestrates the complete enclosure workflow:
 * 1. Choose between Ready and Custom
 * 2. Ready: Select from materials
 * 3. Custom: Build from components
 */
export const EnclosureManager: React.FC<EnclosureManagerProps> = ({
  open,
  onClose,
  onEnclosureAdded,
  panelId,
  existingEnclosurePanelItemId
}) => {
  const [mode, setMode] = useState<EnclosureMode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const refreshPanelData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', panelId] }),
      queryClient.invalidateQueries({ queryKey: [PANEL_ITEMS_QUERY_KEY, 'panel', panelId, 'grouped'] }),
      queryClient.invalidateQueries({ queryKey: [PANELS_QUERY_KEY, panelId] }),
    ]);
  };

  // Reset mode when dialog closes
  const handleClose = () => {
    setMode(null);
    onClose();
  };

  // Handle Ready Enclosure selection
  const handleSelectReadyEnclosure = async (material: Material) => {
    try {
      setIsLoading(true);

      // Create panel item with the selected ready enclosure material
      const panelItem = await panelItemService.create({
        panelId,
        materialId: material.materialId,
        quantity: 1,
        itemType: 3 // PanelItemType.Enclosure
      });

      await refreshPanelData();
      onEnclosureAdded(panelItem);
      handleClose();
    } catch (error) {
      console.error('Error adding ready enclosure:', error);
      alert('Failed to add ready enclosure. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Custom Enclosure save
  const handleSaveCustomEnclosure = async (panelItemId?: number) => {
    // Reload the panel or trigger a refresh
    // The component will be added/updated via the API call in CustomEnclosureBuilder
    if (panelItemId) {
      await refreshPanelData();
      onEnclosureAdded({ panelItemId } as PanelItem);
    }
    handleClose();
  };

  return (
    <Box>
      {/* Step 1: Choose between Ready or Custom */}
      <EnclosureChoice
        open={open && mode === null}
        onClose={handleClose}
        onSelectMode={setMode}
        isLoading={isLoading}
      />

      {/* Step 2A: Ready Enclosure Picker */}
      {mode === 'ready' && (
        <ReadyEnclosurePicker
          open={true}
          onClose={() => setMode(null)}
          onSelectEnclosure={handleSelectReadyEnclosure}
          isLoading={isLoading}
        />
      )}

      {/* Step 2B: Custom Enclosure Builder */}
      {mode === 'custom' && (
        <CustomEnclosureBuilder
          open={true}
          onClose={() => setMode(null)}
          onSaveEnclosure={handleSaveCustomEnclosure}
          panelId={panelId}
          panelItemId={existingEnclosurePanelItemId}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
};

export default EnclosureManager;
