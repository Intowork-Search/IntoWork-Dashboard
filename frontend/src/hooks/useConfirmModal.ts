import { useState, useRef } from 'react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions;
  resolve: ((value: boolean) => void) | null;
}

export function useConfirmModal() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    options: { message: '' },
    resolve: null,
  });
  const pendingRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      pendingRef.current = resolve;
      setState({ open: true, options, resolve });
    });
  };

  const handleConfirm = () => {
    pendingRef.current?.(true);
    pendingRef.current = null;
    setState((s) => ({ ...s, open: false, resolve: null }));
  };

  const handleCancel = () => {
    pendingRef.current?.(false);
    pendingRef.current = null;
    setState((s) => ({ ...s, open: false, resolve: null }));
  };

  return {
    confirm,
    isOpen: state.open,
    options: state.options,
    handleConfirm,
    handleCancel,
  };
}
