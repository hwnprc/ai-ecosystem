import Link from "next/link";
import styles from "./ViewSwitch.module.css";

// The Graph / Layer map switch. The same control sits on both pages, so either view can reach the other.
export default function ViewSwitch({ current, className }: { current: "graph" | "map"; className?: string }) {
  const views = [
    { id: "graph", label: "Graph", href: "/ai-ecosystem-graph" },
    { id: "map", label: "Layer map", href: "/" },
  ] as const;
  return (
    <nav className={`${styles.switch} ${className ?? ""}`} aria-label="Switch view">
      {views.map((v) =>
        v.id === current ? (
          <span key={v.id} className={styles.on} aria-current="page">
            {v.label}
          </span>
        ) : (
          <Link key={v.id} href={v.href}>
            {v.label}
          </Link>
        ),
      )}
    </nav>
  );
}
