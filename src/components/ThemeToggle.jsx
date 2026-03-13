export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-btn" onClick={onToggle}>
      {theme === "dark" ? "☀ Light" : "🌙 Dark"}
    </button>
  );
}
