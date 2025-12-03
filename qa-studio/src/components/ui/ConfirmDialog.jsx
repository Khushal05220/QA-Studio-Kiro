import React from 'react';
import { Modal } from './Modal';
import { Icons } from './Icons';

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            variant === 'danger' ? 'bg-red-500/20' : 'bg-yellow-500/20'
          }`}>
            <Icons.AlertCircle className={`w-5 h-5 ${
              variant === 'danger' ? 'text-red-400' : 'text-yellow-400'
            }`} />
          </div>
          <p className="text-gray-300">{message}</p>
        </div>
        
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            {cancelText}
          </button>
          <button 
            onClick={handleConfirm} 
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
