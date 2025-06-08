import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-blue" />
      <input
        type="text"
        placeholder="Search problems..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="glass-input w-full pl-10 pr-4 py-3 rounded-lg border-2 border-neon-blue/30 focus:border-neon-blue focus:outline-none focus:ring-0 transition-all duration-300 hover:border-neon-blue/50 placeholder-white/60"
      />
    </div>
  );
};

export default SearchInput;