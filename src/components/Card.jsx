export default function Card({ children, ...props }) {
  return <section className="card" {...props}>{children}</section>;
}
