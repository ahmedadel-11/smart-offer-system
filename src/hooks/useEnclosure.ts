import { useState, useCallback, useEffect } from 'react';
import {
  EnclosureComponentSnapshot,
  CustomEnclosureState,
  EnclosureComponent
} from '../types';
import { enclosureService } from '../services';

interface UseEnclosureOptions {
  panelId: number;
  panelItemId?: number;
}

interface UseEnclosureReturn {
  state: CustomEnclosureState;
  components: EnclosureComponent[];
  isLoading: boolean;
  error: string | null;
  
  // Component operations
  loadComponents: () => Promise<void>;
  addComponent: (component: EnclosureComponent) => void;
  removeComponent: (index: number) => void;
  updateComponentQty: (index: number, qty: number) => void;
  updateComponentUnitPrice: (index: number, unitPrice: number) => void;
  updateComponentNotes: (index: number, notes: string) => void;
  
  // Enclosure operations
  loadExistingEnclosure: (panelItemId: number) => Promise<void>;
  calculateTotal: () => number;
  validateEnclosure: () => { valid: boolean; errors: string[] };
  saveEnclosure: () => Promise<{ panelItemId: number; totalPrice: number; enclosure: any }>;
  resetState: () => void;
  discardChanges: () => void;
}

/**
 * Hook to manage custom enclosure state and operations
 * Implements strict state management per panel
 */
export const useEnclosure = ({
  panelId,
  panelItemId
}: UseEnclosureOptions): UseEnclosureReturn => {
  const [state, setState] = useState<CustomEnclosureState>({
    panelId,
    panelItemId,
    components: [],
    totalPrice: 0,
    isDirty: false
  });

  const [components, setComponents] = useState<EnclosureComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all available enclosure components from catalog
  const loadComponents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await enclosureService.getComponents();
      setComponents(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load components';
      setError(errorMsg);
      console.error('Error loading components:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load existing enclosure snapshot from backend
  const loadExistingEnclosure = useCallback(
    async (itemId: number) => {
      try {
        setIsLoading(true);
        setError(null);
        const enclosure = await enclosureService.getEnclosureSnapshot(itemId);
        
        setState({
          panelId,
          panelItemId: itemId,
          components: enclosure.components || [],
          totalPrice: enclosure.totalPrice || 0,
          isDirty: false
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load enclosure';
        setError(errorMsg);
        console.error('Error loading enclosure:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [panelId]
  );

  // Add a component from the catalog to the selected list
  const addComponent = useCallback((component: EnclosureComponent) => {
    setState((prevState) => {
      // Check for duplicates (optional recommendation from guide)
      const exists = prevState.components.some(
        (c) => c.enclosureComponentId === component.enclosureComponentId
      );
      
      if (exists) {
        console.warn('Component already selected');
        return prevState;
      }

      const newComponent: EnclosureComponentSnapshot = {
        panelEnclosureComponentId: 0,
        enclosureComponentId: component.enclosureComponentId,
        reference: component.reference,
        description: component.description,
        brand: component.brand,
        quantity: component.quantity,
        unitPriceList: component.unitPriceList,
        totalPriceList: component.unitPriceList,
        qty: 1, // Default qty, user can edit
        notesName: component.notesName
      };

      return {
        ...prevState,
        components: [...prevState.components, newComponent],
        isDirty: true
      };
    });
  }, []);

  // Remove a component from the selected list
  const removeComponent = useCallback((index: number) => {
    setState((prevState) => ({
      ...prevState,
      components: prevState.components.filter((_, i) => i !== index),
      isDirty: true
    }));
  }, []);

  // Update selected quantity for a component
  const updateComponentQty = useCallback((index: number, qty: number) => {
    if (qty <= 0) return;
    
    setState((prevState) => {
      const updatedComponents = [...prevState.components];
      updatedComponents[index] = {
        ...updatedComponents[index],
        qty,
        totalPriceList: qty * (updatedComponents[index].unitPriceList || 0)
      };
      
      return {
        ...prevState,
        components: updatedComponents,
        isDirty: true
      };
    });
  }, []);

  // Update unit price for a component
  const updateComponentUnitPrice = useCallback((index: number, unitPrice: number) => {
    if (unitPrice < 0) return;

    setState((prevState) => {
      const updatedComponents = [...prevState.components];
      updatedComponents[index] = {
        ...updatedComponents[index],
        unitPriceList: unitPrice,
        totalPriceList: (updatedComponents[index].qty || 0) * unitPrice
      };

      return {
        ...prevState,
        components: updatedComponents,
        isDirty: true
      };
    });
  }, []);

  // Update notes for a component
  const updateComponentNotes = useCallback((index: number, notes: string) => {
    setState((prevState) => {
      const updatedComponents = [...prevState.components];
      updatedComponents[index] = {
        ...updatedComponents[index],
        notesName: notes
      };
      
      return {
        ...prevState,
        components: updatedComponents,
        isDirty: true
      };
    });
  }, []);

  // Calculate total price
  const calculateTotal = useCallback((): number => {
    return state.components.reduce((sum, component) => {
      return sum + (component.totalPriceList || 0);
    }, 0);
  }, [state.components]);

  // Validate enclosure before saving
  const validateEnclosure = useCallback(
    (): { valid: boolean; errors: string[] } => {
      return enclosureService.validateCustomEnclosure(state.components);
    },
    [state.components]
  );

  // Save enclosure to backend
  const saveEnclosure = useCallback(async () => {
    const validation = validateEnclosure();
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      setIsLoading(true);
      setError(null);

      const newTotal = calculateTotal();

      if (state.panelItemId) {
        // Update existing enclosure
        const result = await enclosureService.updateCustomEnclosure(state.panelItemId, {
          isCustom: true,
          components: state.components
        });

        setState((prevState) => ({
          ...prevState,
          totalPrice: newTotal,
          isDirty: false
        }));

        return {
          panelItemId: result.panelItemId ?? state.panelItemId,
          totalPrice: newTotal,
          enclosure: result
        };
      } else {
        // Create new enclosure
        const result = await enclosureService.createCustomEnclosure({
          panelId: state.panelId,
          panelItemId: undefined,
          components: state.components
        });

        // Update state with the new panel item ID and calculated price
        setState((prevState) => ({
          ...prevState,
          panelItemId: result.panelItemId,
          totalPrice: newTotal,
          isDirty: false
        }));

        return {
          panelItemId: result.panelItemId,
          totalPrice: newTotal,
          enclosure: result
        };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save enclosure';
      setError(errorMsg);
      console.error('Error saving enclosure:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state, validateEnclosure, calculateTotal]);

  // Reset state to initial
  const resetState = useCallback(() => {
    setState({
      panelId,
      panelItemId: undefined,
      components: [],
      totalPrice: 0,
      isDirty: false
    });
    setError(null);
  }, [panelId]);

  // Discard changes (reload from backend or reset)
  const discardChanges = useCallback(() => {
    if (state.panelItemId) {
      loadExistingEnclosure(state.panelItemId);
    } else {
      resetState();
    }
  }, [state.panelItemId, loadExistingEnclosure, resetState]);

  // Auto-update total price whenever components change
  useEffect(() => {
    const newTotal = calculateTotal();
    setState((prevState) => ({
      ...prevState,
      totalPrice: newTotal
    }));
  }, [state.components, calculateTotal]);

  return {
    state,
    components,
    isLoading,
    error,
    loadComponents,
    addComponent,
    removeComponent,
    updateComponentQty,
    updateComponentUnitPrice,
    updateComponentNotes,
    loadExistingEnclosure,
    calculateTotal,
    validateEnclosure,
    saveEnclosure,
    resetState,
    discardChanges
  };
};

export default useEnclosure;
