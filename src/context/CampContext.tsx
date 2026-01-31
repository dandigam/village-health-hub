import { createContext, useContext, useState, ReactNode } from 'react';

interface CampContextType {
  selectedCamp: string;
  setSelectedCamp: (camp: string) => void;
}

const CampContext = createContext<CampContextType | undefined>(undefined);

export function CampProvider({ children }: { children: ReactNode }) {
  const [selectedCamp, setSelectedCamp] = useState('Bapatla');

  return (
    <CampContext.Provider value={{ selectedCamp, setSelectedCamp }}>
      {children}
    </CampContext.Provider>
  );
}

export function useCamp() {
  const context = useContext(CampContext);
  if (context === undefined) {
    throw new Error('useCamp must be used within a CampProvider');
  }
  return context;
}
