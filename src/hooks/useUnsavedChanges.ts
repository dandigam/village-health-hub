import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to track unsaved changes and prompt before navigating away.
 * Returns { isDirty, setDirty, confirmNavigation, showDiscardDialog, setShowDiscardDialog, pendingPath }
 */
export function useUnsavedChanges() {
  const [isDirty, setDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const navigate = useNavigate();

  // Warn on browser tab close / refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const confirmNavigation = useCallback((path: string) => {
    if (isDirty) {
      setPendingPath(path);
      setShowDiscardDialog(true);
    } else {
      navigate(path);
    }
  }, [isDirty, navigate]);

  const handleDiscard = useCallback(() => {
    setShowDiscardDialog(false);
    setDirty(false);
    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  }, [pendingPath, navigate]);

  const handleCancel = useCallback(() => {
    setShowDiscardDialog(false);
    setPendingPath(null);
  }, []);

  return { isDirty, setDirty, confirmNavigation, showDiscardDialog, handleDiscard, handleCancel };
}
