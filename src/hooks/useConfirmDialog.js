import { useState, useCallback } from 'react'

const DEFAULT_STATE = {
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'Eliminar',
  variant: 'danger',
  onConfirm: null,
}

/**
 * Encapsula el estado y handlers del ConfirmDialog reutilizable.
 */
export function useConfirmDialog() {
  const [confirmDialog, setConfirmDialog] = useState(DEFAULT_STATE)

  const closeConfirm = useCallback(
    () => setConfirmDialog(prev => ({ ...prev, isOpen: false, onConfirm: null })),
    []
  )

  const openConfirm = useCallback(
    (config) => setConfirmDialog({ ...DEFAULT_STATE, isOpen: true, ...config }),
    []
  )

  return { confirmDialog, openConfirm, closeConfirm }
}
