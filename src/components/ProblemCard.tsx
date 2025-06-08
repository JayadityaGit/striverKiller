import React from 'react';
import { ExternalLink, BookOpen, Code } from 'lucide-react';

interface Problem {
  title: string;
  url?: string;
  practice?: string;
  revision?: string;
  difficulty?: string;
}

interface ProblemCardProps {
  problem: Problem;
  isChecked: boolean;
  onCheck: (checked: boolean) => void;
  isDisabled: boolean;
  index: number;
}

const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  isChecked,
  onCheck,
  isDisabled,
  index
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div 
      className="glass-card p-4 rounded-lg border-l-4 border-l-neon-blue hover:bg-glass-light transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={isChecked}
            disabled={isDisabled}
            onChange={(e) => onCheck(e.target.checked)}
            className={`ultra-checkbox ${isChecked ? 'animate-glow-pulse' : ''}`}
          />
        </div>
        
        <div className="flex-grow">
          <h4 className="text-white font-medium text-lg mb-2 font-orbitron">
            {problem.title}
          </h4>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {problem.url && (
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 bg-neon-blue/20 text-neon-blue rounded-full text-sm hover:bg-neon-blue/30 transition-colors duration-200"
              >
                <BookOpen className="w-3 h-3" />
                Resource
              </a>
            )}
            
            {problem.practice && (
              <a
                href={problem.practice}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full text-sm hover:bg-neon-cyan/30 transition-colors duration-200"
              >
                <Code className="w-3 h-3" />
                Practice
              </a>
            )}
            
            {problem.revision && (
              <a
                href={problem.revision}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 bg-ultra-silver/20 text-ultra-silver rounded-full text-sm hover:bg-ultra-silver/30 transition-colors duration-200"
              >
                <ExternalLink className="w-3 h-3" />
                LeetCode
              </a>
            )}
          </div>
          
          {problem.difficulty && (
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemCard;
