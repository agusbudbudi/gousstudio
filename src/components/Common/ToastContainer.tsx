import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast id={toast.id} type={toast.type} message={toast.message} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
