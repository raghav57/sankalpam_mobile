import { createContext, useContext, useState, type ReactNode } from "react";

export type BookingMode = "ONLINE" | "IN_PERSON";

export interface BookingDraft {
  poojaId: number;
  mode: BookingMode;
  date: string;
  time: string;
  address: string;
  city: string;
  state: string;
  instructions: string;
}

interface BookingContextValue {
  draft: BookingDraft | null;
  setDraft: (draft: BookingDraft | null) => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(
  undefined,
);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft | null>(null);

  return (
    <BookingContext.Provider value={{ draft, setDraft }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error("useBooking must be used inside BookingProvider");
  }

  return context;
}
