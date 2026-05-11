import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EnclosureManager } from './EnclosureManager';

interface EnclosureContextType {
  openEnclosureManager: (panelId: number, existingEnclosurePanelItemId?: number) => void;
}

const EnclosureContext = createContext<EnclosureContextType | undefined>(undefined);

export interface EnclosureProviderProps {
  children: ReactNode;
  onEnclosureAdded?: () => void; // Callback to refresh panel data
}

/**
 * Provider component for the Enclosure feature
 * Makes EnclosureManager accessible throughout the application
 */
export const EnclosureProvider: React.FC<EnclosureProviderProps> = ({
  children,
  onEnclosureAdded
}) => {
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerPanelId, setManagerPanelId] = useState<number | null>(null);
  const [managerExistingEnclosureId, setManagerExistingEnclosureId] = useState<number | undefined>();

  const openEnclosureManager = (
    panelId: number,
    existingEnclosurePanelItemId?: number
  ) => {
    setManagerPanelId(panelId);
    setManagerExistingEnclosureId(existingEnclosurePanelItemId);
    setManagerOpen(true);
  };

  const handleClose = () => {
    setManagerOpen(false);
    setManagerPanelId(null);
    setManagerExistingEnclosureId(undefined);
  };

  const handleEnclosureAdded = () => {
    onEnclosureAdded?.();
    handleClose();
  };

  return (
    <EnclosureContext.Provider value={{ openEnclosureManager }}>
      {children}

      {/* Global EnclosureManager - shown when needed */}
      {managerPanelId !== null && (
        <EnclosureManager
          open={managerOpen}
          onClose={handleClose}
          onEnclosureAdded={handleEnclosureAdded}
          panelId={managerPanelId}
          existingEnclosurePanelItemId={managerExistingEnclosureId}
        />
      )}
    </EnclosureContext.Provider>
  );
};

/**
 * Hook to use the Enclosure context
 */
export const useEnclosureManager = (): EnclosureContextType => {
  const context = useContext(EnclosureContext);
  if (!context) {
    throw new Error(
      'useEnclosureManager must be used within an EnclosureProvider'
    );
  }
  return context;
};

export default EnclosureProvider;
