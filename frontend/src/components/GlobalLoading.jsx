// src/components/GlobalLoading.jsx
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalLoading({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-4 border-brand-600 border-t-transparent"
            />
            <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}