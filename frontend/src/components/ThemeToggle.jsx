import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from './icons';

// ThemeToggle stores the user's preference in localStorage so the selected appearance persists across reloads.
function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('shopkart-theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('shopkart-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle-icon">
        {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      </span>
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}

export default ThemeToggle;
