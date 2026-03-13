export default function Button({ variant = "ghost", active = false, className = "", ...props }) {
  const cls = ["btn", variant, active ? "active" : "", className].filter(Boolean).join(" ");
  return <button className={cls} {...props} />;
}
