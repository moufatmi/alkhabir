import React from 'react';

interface CaseSummaryInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const CaseSummaryInput: React.FC<CaseSummaryInputProps> = ({ value, onChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Case Summary</h3>
      </div>
        <div>
          <label htmlFor="case-summary" className="block text-sm font-medium text-slate-700 mb-2">
            Enter case details, facts, and relevant information
          </label>
          <textarea
            id="case-summary"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe the case details, parties involved, key facts, and any relevant circumstances..."
            className="w-full h-40 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700 placeholder-slate-400"
          />
      </div>
    </div>
  );
};