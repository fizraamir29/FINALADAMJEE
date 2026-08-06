'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface ModernSelectProps {
  options: (string | SelectOption)[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export default function ModernSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  disabled = false,
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to { value, label }
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOpt = normalizedOptions.find((o) => o.value === value) || {
    value,
    label: value || placeholder,
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block text-left w-full ${className}`}>
      {/* Dropdown Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-[#cbd5e1] hover:border-[#164475] rounded-lg text-xs font-semibold text-[#1a1a1a] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#164475]/20 focus:border-[#164475] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <span className="truncate">{selectedOpt.label || placeholder}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#5c5c5c] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#164475]' : ''
          }`}
        />
      </button>

      {/* Floating Options Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[9999] bg-white border border-[#cbd5e1] rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-2 text-[11px] text-gray-400 font-medium">No options available</div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#164475]/10 text-[#164475] font-bold'
                      : 'text-[#1a1a1a] hover:bg-slate-100 hover:text-[#164475]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#164475] flex-shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
