
import React from 'react';
import { PokerValue } from '../types';

interface PokerCardProps {
  value: PokerValue;
  onClick: (value: PokerValue) => void;
  isSelected?: boolean;
  disabled?: boolean;
}

const PokerCard: React.FC<PokerCardProps> = ({ value, onClick, isSelected = false, disabled = false }) => {
  const baseClasses = "w-16 h-24 sm:w-20 sm:h-28 flex items-center justify-center border-2 rounded-lg shadow-md cursor-pointer transition-all duration-150 ease-in-out transform hover:scale-105";
  const selectedClasses = "border-primary bg-primary/10 ring-2 ring-primary scale-105";
  const unselectedClasses = "border-neutral-200 bg-white hover:border-primary/50";
  const disabledClasses = "bg-neutral-200 border-neutral-200 text-neutral-700 cursor-not-allowed hover:scale-100";

  return (
    <div
      className={`${baseClasses} ${disabled ? disabledClasses : (isSelected ? selectedClasses : unselectedClasses)}`}
      onClick={() => !disabled && onClick(value)}
      title={`Vote ${value}`}
    >
      <span className={`text-2xl sm:text-3xl font-bold ${disabled ? 'text-neutral-700' : (isSelected ? 'text-primary' : 'text-neutral-800')}`}>{value}</span>
    </div>
  );
};

export default PokerCard;