import { useTheme } from '../contexts/ThemeContext';
import { Palette, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useRef, useEffect } from 'react';

export default function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();
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

  const currentTheme = themes.find(t => t.name === theme);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm font-medium"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">{currentTheme?.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {themes.map((themeOption) => (
            <button
              key={themeOption.name}
              onClick={() => {
                setTheme(themeOption.name);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 ${
                theme === themeOption.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: themeOption.colors.primary }}
              />
              <span>{themeOption.label}</span>
              {theme === themeOption.name && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 