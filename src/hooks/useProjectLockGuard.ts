import { useCallback } from 'react';
import toast from 'react-hot-toast';

const LOCKED_PROJECT_MESSAGE = 'Cannot modify a locked project.';
const LOCKED_PANEL_MESSAGE = 'Cannot modify a panel in a locked project.';

export function useProjectLockGuard(isLocked?: boolean) {
  const isProjectLocked = !!isLocked;

  const ensureProjectUnlocked = useCallback(() => {
    if (isProjectLocked) {
      toast.error(LOCKED_PROJECT_MESSAGE);
      return false;
    }

    return true;
  }, [isProjectLocked]);

  const ensurePanelUnlocked = useCallback(() => {
    if (isProjectLocked) {
      toast.error(LOCKED_PANEL_MESSAGE);
      return false;
    }

    return true;
  }, [isProjectLocked]);

  return {
    isProjectLocked,
    ensureProjectUnlocked,
    ensurePanelUnlocked,
  };
}
