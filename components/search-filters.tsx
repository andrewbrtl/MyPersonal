"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import styles from "@/app/buscar/search.module.css";

export function SearchFilters({ children, activeCount }: { children: ReactNode; activeCount: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <aside className={styles.filters} data-open={open}>
      <button className={styles.filterToggle} type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <SlidersHorizontal size={17} /> Filtrar resultados {activeCount > 0 && <span>{activeCount}</span>} <ChevronDown size={17} />
      </button>
      <div id={id} className={styles.filterBody}>{children}</div>
    </aside>
  );
}
