export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button type="button" className="theme-btn" aria-pressed={theme === "light"} onClick={onToggle}>
      {theme === "dark" ? "☀ Light" : "🌙 Dark"}
    </button>
  );
}
