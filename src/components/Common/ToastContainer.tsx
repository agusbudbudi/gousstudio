import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-4 z-[9999] flex -translate-x-1/2 flex-col items-center sm:top-6"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast id={toast.id} type={toast.type} message={toast.message} duration={toast.duration} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
