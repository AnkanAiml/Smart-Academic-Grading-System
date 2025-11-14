import React from 'react';
import Spinner from './Spinner';
import { CancelIcon, TrashIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  title: string;
  children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, isProcessing, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-brand-surface border border-brand-outline rounded-xl shadow-2xl shadow-brand-primary/10 p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2" id="modal-title">
                {title}
            </h3>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary disabled:opacity-50" disabled={isProcessing}>
                <CancelIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="text-text-secondary mb-6">
            {children}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isProcessing} className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-w-[120px]">
            {isProcessing ? <Spinner className="animate-spin h-4 w-4 text-white" /> : <TrashIcon className="w-4 h-4" />}
            {isProcessing ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
