import { useEffect, useState } from 'react';

// ThemeToggle stores the user's preference in localStorage so the selected appearance persists across reloads.
function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('shopkart-theme');
    return savedTheme || 'light';
  });

  // Whenever the theme changes, the root HTML element updates and the choice is saved.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('shopkart-theme', theme);
  }, [theme]);

  // Simple toggle between dark and light mode.
  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}

export default ThemeToggle;
