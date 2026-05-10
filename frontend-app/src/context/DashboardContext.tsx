"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface DashboardContextType {
  globalQuery: string;
  setGlobalQuery: (query: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [globalQuery, setGlobalQuery] = useState("logistics");

  return (
    <DashboardContext.Provider value={{ globalQuery, setGlobalQuery }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return context;
}
