import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="toast"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
};

let toastCallback = null;

export const showToast = (message) => {
  if (toastCallback) toastCallback(message);
};

export const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    toastCallback = setMessage;
    return () => { toastCallback = null; };
  }, []);

  return (
    <>
      {children}
      {message && <Toast message={message} onClose={() => setMessage(null)} />}
    </>
  );
};
