import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

const Input: React.FC<InputProps> = ({ label, id, icon, rightIcon, onRightIconClick, ...props }) => {
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
          className={`w-full py-3 bg-[#2D2D2D] border border-zinc-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition ${icon ? 'pl-11' : 'pl-4'} ${rightIcon ? 'pr-11' : 'pr-4'}`}
          {...props}
        />
        {rightIcon && (
           <button type="button" onClick={onRightIconClick} className="absolute inset-y-0 right-0 flex items-center pr-3.5" aria-label="Toggle password visibility">
             {rightIcon}
           </button>
        )}
      </div>
    </div>
  );
};

export default Input;