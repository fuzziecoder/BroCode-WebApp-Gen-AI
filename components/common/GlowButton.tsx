import React from 'react';
import { motion } from 'framer-motion';

interface GlowButtonProps extends Omit<React.ComponentProps<typeof motion.button>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'danger';
}

const GlowButton: React.FC<GlowButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = "relative inline-flex items-center justify-center p-0.5 overflow-hidden font-semibold rounded-full group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black";
  
  const primaryGlow = "from-indigo-500 via-purple-500 to-cyan-400";
  const dangerGlow = "from-pink-500 via-red-500 to-orange-400";
  
  const glowGradient = variant === 'primary' ? primaryGlow : dangerGlow;

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {/* The glow effect. Increased inset, blur, and default opacity to match image */}
      <div 
        className={`absolute -inset-1 bg-gradient-to-br ${glowGradient} rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300 group-hover:duration-200`}
      />
      
      {/* The button content with a glassy, translucent effect */}
      <div className="relative w-full h-full px-8 py-3 transition-all ease-in duration-150 bg-black/60 backdrop-blur-sm border border-white/20 rounded-full group-hover:bg-black/50">
        <span className="relative text-white">{children}</span>
      </div>
    </motion.button>
  );
};

export default GlowButton;