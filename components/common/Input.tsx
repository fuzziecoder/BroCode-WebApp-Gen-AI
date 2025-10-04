import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  error?: string | null;
}

const Input: React.FC<InputProps> = ({ label, id, icon, rightIcon, onRightIconClick, error, ...props }) => {
  const errorClasses = error ? 'border-red-500/70 focus:ring-red-500 focus:border-red-500' : 'border-zinc-700/50 focus:ring-zinc-500 focus:border-zinc-500';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`w-full py-3 bg-[#2D2D2D] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition ${errorClasses} ${icon ? 'pl-11' : 'pl-4'} ${rightIcon ? 'pr-11' : 'pr-4'}`}
          {...props}
        />
        {rightIcon && (
           <button type="button" onClick={onRightIconClick} className="absolute inset-y-0 right-0 flex items-center pr-3.5" aria-label="Toggle password visibility">
             {rightIcon}
           </button>
        )}
      </div>
       <AnimatePresence>
        {error && (
          <motion.p
            className="mt-1.5 text-xs text-red-400"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;