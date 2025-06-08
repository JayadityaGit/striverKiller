import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ProblemCard from './ProblemCard.tsx';

interface Problem {
  title: string;
  url?: string;
  practice?: string;
  revision?: string;
  difficulty?: string;
}

interface Step {
  title: string;
  problems: Problem[];
}

interface StepSectionProps {
  step: Step;
  stepIndex: number;
  checked: { [key: string]: boolean };
  onCheck: (problemKey: string, value: boolean) => void;
  isUserSignedIn: boolean;
  filteredProblems: Problem[];
  getProblemKey: (stepIdx: number, probIdx: number) => string;
}

const StepSection: React.FC<StepSectionProps> = ({
  step,
  stepIndex,
  checked,
  onCheck,
  isUserSignedIn,
  filteredProblems,
  getProblemKey
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = step.problems.filter((_, pIdx) => 
    checked[getProblemKey(stepIndex, pIdx)]
  ).length;

  const progressPercentage = (completedCount / step.problems.length) * 100;

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-slide-in" style={{ animationDelay: `${stepIndex * 200}ms` }}>
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-glass-light transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-neon-blue" />
          ) : (
            <ChevronRight className="w-5 h-5 text-neon-blue" />
          )}
          <h2 className="text-xl md:text-2xl font-bold text-white font-orbitron">
            {step.title}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/70">
            {completedCount}/{step.problems.length}
          </span>
          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {filteredProblems.map((problem, pIdx) => {
              const originalIndex = step.problems.findIndex(p => p.title === problem.title);
              const key = getProblemKey(stepIndex, originalIndex);
              
              return (
                <ProblemCard
                  key={key}
                  problem={problem}
                  isChecked={!!checked[key]}
                  onCheck={(value) => onCheck(key, value)}
                  isDisabled={!isUserSignedIn}
                  index={pIdx}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepSection;
