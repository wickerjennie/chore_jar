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

  const value = useMemo(
    () => ({ chores, addChore }),
    [chores, addChore]
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
