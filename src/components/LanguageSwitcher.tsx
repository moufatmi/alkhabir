import React from 'react';

interface LanguageSwitcherProps {
  onLanguageChange: (language: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange }) => {
  return (
    <div>
      <button onClick={() => onLanguageChange('ar')}>العربية</button>
      <button onClick={() => onLanguageChange('fr')}>Français</button>
    </div>
  );
};

export default LanguageSwitcher;
