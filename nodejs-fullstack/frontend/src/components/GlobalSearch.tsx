import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface NavItem {
  key: string;
  label: string;
  sectionLabel?: string;
  isHeader?: boolean;
}

interface SearchResult {
  key: string;
  label: string;
  section: string;
}

interface GlobalSearchProps {
  navItems: NavItem[];
  onNavigate: (key: string) => void;
}

export default function GlobalSearch({
  navItems,
  onNavigate,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build search index: map each item to its section
  const searchIndex = useCallback((): SearchResult[] => {
    const results: SearchResult[] = [];
    let currentSection = "";
    for (const item of navItems) {
      if (item.isHeader) {
        currentSection = item.label;
        continue;
      }
      if (item.key.startsWith("__")) continue;
      results.push({
        key: item.key,
        label: item.label,
        section: currentSection,
      });
    }
    return results;
  }, [navItems]);

  const filteredResults = useCallback(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return searchIndex()
      .filter(
        (r) =>
          r.label.toLowerCase().includes(q) ||
          r.section.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, searchIndex]);

  const results = filteredResults();

  // Ctrl+/ shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      onNavigate(results[selected].key);
      setOpen(false);
      setQuery("");
    }
  };

  const handleSelect = (key: string) => {
    onNavigate(key);
    setOpen(false);
    setQuery("");
  };

  return (
    <div
      className="relative hidden lg:flex items-center"
      style={{ width: "35%" }}
      data-ocid="search.panel"
    >
      <div className="relative w-full">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search features, reports, vouchers... (Ctrl+/)"
          className="w-full h-8 bg-secondary/40 border border-border/60 rounded-sm pl-7 pr-7 text-[11px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-teal/50 focus:bg-secondary/70 transition-colors"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setSelected(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          data-ocid="search.search_input"
        />
        {query && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            data-ocid="search.close_button"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {open && query && (
        <div
          className="absolute top-full mt-1 left-0 right-0 bg-card border border-border shadow-xl rounded-sm z-[200] overflow-hidden"
          data-ocid="search.dropdown_menu"
        >
          {results.length === 0 ? (
            <div className="px-3 py-4 text-[11px] text-muted-foreground text-center">
              No results found
            </div>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={r.key}>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 text-[11px] flex items-center justify-between gap-2 transition-colors ${
                      i === selected
                        ? "bg-teal/15 text-foreground"
                        : "hover:bg-secondary/60 text-foreground"
                    }`}
                    onClick={() => handleSelect(r.key)}
                    data-ocid={`search.item.${i + 1}`}
                  >
                    <span className="font-medium truncate">{r.label}</span>
                    <span className="text-muted-foreground text-[10px] flex-shrink-0 truncate max-w-[120px]">
                      {r.section}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop
        <div className="fixed inset-0 z-[199]" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
