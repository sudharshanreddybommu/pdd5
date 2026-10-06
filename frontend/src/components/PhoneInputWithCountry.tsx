import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Phone, Search, Check } from 'lucide-react';

export interface CountryItem {
  name: string;
  code: string; // e.g. "+91"
  flag: string; // e.g. "🇮🇳"
  iso: string;  // e.g. "IN"
}

export const COUNTRIES: CountryItem[] = [
  { name: 'India', code: '+91', flag: '🇮🇳', iso: 'IN' },
  { name: 'United States', code: '+1', flag: '🇺🇸', iso: 'US' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', iso: 'GB' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', iso: 'AE' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦', iso: 'SA' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬', iso: 'SG' },
  { name: 'Australia', code: '+61', flag: '🇦🇺', iso: 'AU' },
  { name: 'Canada', code: '+1', flag: '🇨🇦', iso: 'CA' },
  { name: 'Malaysia', code: '+60', flag: '🇲🇾', iso: 'MY' },
  { name: 'Qatar', code: '+974', flag: '🇶🇦', iso: 'QA' },
  { name: 'Oman', code: '+968', flag: '🇴🇲', iso: 'OM' },
  { name: 'Kuwait', code: '+965', flag: '🇰🇼', iso: 'KW' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩', iso: 'BD' },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰', iso: 'LK' },
  { name: 'Nepal', code: '+977', flag: '🇳🇵', iso: 'NP' },
  { name: 'Germany', code: '+49', flag: '🇩🇪', iso: 'DE' },
  { name: 'France', code: '+33', flag: '🇫🇷', iso: 'FR' }
];

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (fullPhone: string, countryCode: string, nationalNumber: string) => void;
  placeholder?: string;
  required?: boolean;
  label?: string;
  id?: string;
  className?: string;
  defaultCountryIso?: string;
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  value,
  onChange,
  placeholder = '9876543210',
  required = true,
  label = 'Phone Number',
  id,
  className = '',
  defaultCountryIso = 'IN'
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(
    COUNTRIES.find(c => c.iso === defaultCountryIso) || COUNTRIES[0]
  );
  const [nationalNumber, setNationalNumber] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync incoming value
  useEffect(() => {
    if (!value) {
      setNationalNumber('');
      return;
    }

    // Check if value already starts with any country code
    const matchedCountry = COUNTRIES.find(c => value.startsWith(c.code));
    if (matchedCountry) {
      setSelectedCountry(matchedCountry);
      const cleanNum = value.slice(matchedCountry.code.length).replace(/[\s+()-]/g, '');
      setNationalNumber(cleanNum);
    } else {
      setNationalNumber(value.replace(/[\s+()-]/g, ''));
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setNationalNumber(rawVal);
    const fullPhone = rawVal ? `${selectedCountry.code}${rawVal}` : '';
    onChange(fullPhone, selectedCountry.code, rawVal);
  };

  const handleSelectCountry = (country: CountryItem) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery('');
    const fullPhone = nationalNumber ? `${country.code}${nationalNumber}` : '';
    onChange(fullPhone, country.code, nationalNumber);
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery)
  );

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400">
            {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.code})
          </span>
        </div>
      )}

      <div className="relative flex items-center rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500 transition-all">
        {/* Country Selector Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-full px-3 py-3 flex items-center space-x-1.5 border-r border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-l-xl transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            title={`Selected Country: ${selectedCountry.name} (${selectedCountry.code})`}
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{selectedCountry.code}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
              {/* Search bar inside dropdown */}
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search country or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Country options list */}
              <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50 dark:divide-slate-800/40">
                {filteredCountries.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No matching countries found
                  </div>
                ) : (
                  filteredCountries.map((c) => (
                    <button
                      key={c.iso}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between rounded-xl transition-colors ${
                        selectedCountry.iso === c.iso
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 flex-shrink-0 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{c.code}</span>
                        {selectedCountry.iso === c.iso && (
                          <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ml-1" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* National Phone Number Input */}
        <div className="relative flex-1">
          <input
            id={id}
            type="tel"
            required={required}
            value={nationalNumber}
            onChange={handleNumberChange}
            placeholder={placeholder}
            className="w-full px-3.5 py-3 bg-transparent text-xs sm:text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PhoneInputWithCountry;
