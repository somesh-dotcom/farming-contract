import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">Language:</span>
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="en">English</option>
        <option value="kn">ಕನ್ನಡ</option>
      </select>
    </div>
  );
};

export default LanguageSelector;