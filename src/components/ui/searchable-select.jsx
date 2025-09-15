import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export const SearchableSelect = ({ 
  options = [], 
  value, 
  onValueChange, 
  placeholder = "Select option...", 
  searchPlaceholder = "Search...",
  className = "",
  disabled = false,
  error = false,
  displayField = "label",
  valueField = "value"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(option => {
    const displayValue = typeof option === 'string' ? option : option[displayField];
    return displayValue?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedOption = options.find(option => {
    const optionValue = typeof option === 'string' ? option : option[valueField];
    return optionValue === value;
  });

  const selectedDisplay = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption[displayField])
    : '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option) => {
    const optionValue = typeof option === 'string' ? option : option[valueField];
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onValueChange('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`
          flex items-center justify-between w-full h-9 px-3 py-2 text-sm 
          bg-slate-700 border border-slate-600 rounded-lg cursor-pointer
          hover:border-slate-500 focus-within:border-yellow-400
          transition-colors duration-200
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`text-white ${!selectedDisplay ? 'text-slate-400' : ''}`}>
          {selectedDisplay || placeholder}
        </span>
        <div className="flex items-center space-x-1">
          {selectedDisplay && !disabled && (
            <button
              onClick={clearSelection}
              className="p-0.5 hover:bg-slate-600 rounded"
              type="button"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
          <ChevronDown 
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-slate-600">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option[valueField];
                const optionDisplay = typeof option === 'string' ? option : option[displayField];
                const isSelected = optionValue === value;
                
                return (
                  <div
                    key={index}
                    className={`
                      px-3 py-2 text-sm cursor-pointer transition-colors duration-150
                      ${isSelected 
                        ? 'bg-yellow-500 text-black font-medium' 
                        : 'text-white hover:bg-slate-700'
                      }
                    `}
                    onClick={() => handleOptionClick(option)}
                  >
                    {optionDisplay}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};