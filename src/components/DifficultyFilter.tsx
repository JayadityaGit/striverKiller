import React from 'react';
import { ChevronDown } from 'lucide-react';

interface DifficultyFilterProps {
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
}

const DifficultyFilter: React.FC<DifficultyFilterProps> = ({
  selectedDifficulty,
  onDifficultyChange
}) => {
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="relative w-40">
      <select
        value={selectedDifficulty}
        onChange={(e) => onDifficultyChange(e.target.value)}
        className="glass-input appearance-none px-4 py-2 pr-10 rounded-lg border-2 border-[var(--color-neon-blue)]/30 focus:border-[var(--color-neon-blue)] focus:outline-none focus:ring-0 transition-all duration-300 hover:border-[var(--color-neon-blue)]/50 text-white"
      >
        {difficulties.map((difficulty) => (
          <option key={difficulty} value={difficulty} className="bg-gray-900 text-white">
            {difficulty}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-neon-blue)] pointer-events-none" />
    </div>
  );
};

export default DifficultyFilter;
