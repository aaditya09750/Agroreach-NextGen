import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select option',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div>
      <label className="block text-sm font-medium text-text-dark mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 border border-border-color rounded-lg focus:outline-none focus:border-primary transition-colors flex items-center justify-between text-left"
        >
          <span className={value ? 'text-text-dark' : 'text-text-muted'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown size={16} className="text-text-muted" />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-color rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto scrollbar-hide">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors ${
                  value === option.value
                    ? 'bg-primary/5 text-primary font-medium'
                    : 'text-text-dark-gray'
                } ${option.value === '' ? 'text-text-muted' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
