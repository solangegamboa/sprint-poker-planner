
import React from 'react';

interface ActionButtonProps {
  onClick?: () => void; // Made onClick optional
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  className?: string;
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit' | 'reset'; // Added type prop
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false, 
  title,
  type = 'button' // Default to 'button'
}) => {
  const baseStyle = "px-4 py-2 rounded-md font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out";
  
  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = 'bg-primary text-white hover:bg-primary-dark focus:ring-primary';
      break;
    case 'secondary':
      variantStyle = 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary'; // Updated hover style
      break;
    case 'danger':
      variantStyle = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      break;
    case 'outline':
      variantStyle = 'bg-transparent border border-primary text-primary hover:bg-primary/10 focus:ring-primary';
      break;
  }

  if (disabled) {
    variantStyle = 'bg-neutral-200 text-neutral-700 cursor-not-allowed';
  }

  return (
    <button
      type={type} // Pass the type to the HTML button element
      onClick={onClick}
      className={`${baseStyle} ${variantStyle} ${className}`}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

export default ActionButton;