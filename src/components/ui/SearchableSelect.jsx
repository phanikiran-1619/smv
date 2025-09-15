import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

const SearchableSelect = ({ 
  options = [], 
  value, 
  onValueChange, 
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  className = "",
  disabled = false,
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

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

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleOptionSelect = (optionValue) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          // Dark mode styles
          "dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:border-yellow-400",
          // Light mode styles  
          "bg-white border-gray-300 text-gray-900 focus:border-blue-500",
          error && "border-red-500 dark:border-red-500",
          className
        )}
      >
        <span className={cn(
          selectedOption ? "" : "text-muted-foreground",
          // Light mode placeholder color
          !selectedOption && "dark:text-gray-400 text-gray-500"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 opacity-50 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border shadow-lg",
          // Dark mode dropdown
          "dark:bg-slate-800 dark:border-slate-600",
          // Light mode dropdown
          "bg-white border-gray-300"
        )}>
          <div className={cn(
            "flex items-center border-b px-3 py-2",
            "dark:border-slate-600 border-gray-200"
          )}>
            <Search className={cn(
              "h-4 w-4 mr-2",
              "dark:text-gray-400 text-gray-500"
            )} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "flex-1 outline-none text-sm bg-transparent",
                // Dark mode input
                "dark:text-white dark:placeholder-gray-400",
                // Light mode input
                "text-gray-900 placeholder-gray-500"
              )}
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className={cn(
                "py-2 px-3 text-sm",
                "dark:text-gray-400 text-gray-500"
              )}>
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect(option.value)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors",
                    // Dark mode option
                    "dark:hover:bg-slate-600 dark:text-white",
                    // Light mode option
                    "hover:bg-gray-100 text-gray-900",
                    value === option.value && "dark:bg-slate-600 bg-gray-100"
                  )}
                >
                  <span className="flex-1 text-left">{option.label}</span>
                  {value === option.value && (
                    <Check className={cn(
                      "absolute right-2 h-4 w-4",
                      "dark:text-yellow-400 text-blue-600"
                    )} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;