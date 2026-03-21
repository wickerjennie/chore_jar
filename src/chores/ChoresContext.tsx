import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "chore-jar-chores";

type ChoresContextValue = {
  chores: string[];
  addChore: (text: string) => void;
  removeChore: (text: string) => void;
};

const ChoresContext = createContext<ChoresContextValue | null>(null);

function loadChores(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function ChoresProvider({ children }: { children: ReactNode }) {
  const [chores, setChores] = useState<string[]>(loadChores);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chores));
  }, [chores]);

  const addChore = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setChores((prev) => [...prev, trimmed]);
  }, []);

  const removeChore = useCallback((text: string) => {
    setChores((prev) => {
      const i = prev.indexOf(text);
      if (i === -1) return prev;
      return [...prev.slice(0, i), ...prev.slice(i + 1)];
    });
  }, []);

  const value = useMemo(
    () => ({ chores, addChore, removeChore }),
    [chores, addChore, removeChore]
  );

  return (
    <ChoresContext.Provider value={value}>{children}</ChoresContext.Provider>
  );
}

export function useChores(): ChoresContextValue {
  const ctx = useContext(ChoresContext);
  if (!ctx) {
    throw new Error("useChores must be used within ChoresProvider");
  }
  return ctx;
}
