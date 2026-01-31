"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProcessedData, AppState, AppContextType } from "./types";

const DataContext = createContext<AppContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>("idle");
  const [data, setData] = useState<ProcessedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Connect to SSE endpoint for real-time updates
    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("connected", () => {
      console.log("Connected to event stream");
    });

    eventSource.addEventListener("data-update", async (event) => {
      const { dataUrl } = JSON.parse(event.data);
      console.log("Received data update:", dataUrl);
      await loadData(dataUrl);
    });

    eventSource.addEventListener("error", (err) => {
      console.error("SSE connection error:", err);
      // Attempt to reconnect (browser does this automatically)
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const loadData = async (dataUrl: string) => {
    try {
      setState("loading");
      setError(null);

      // Fetch data from GitHub
      const response = await fetch(dataUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const jsonData = await response.json();

      // Basic validation
      if (!jsonData.metadata || !jsonData.policy_sets || !jsonData.reference_data) {
        throw new Error("Invalid data format: missing required fields");
      }

      if (!Array.isArray(jsonData.policy_sets) || jsonData.policy_sets.length === 0) {
        throw new Error("Invalid data format: policy_sets must be a non-empty array");
      }

      // Sort policy sets by rank
      jsonData.policy_sets.sort((a: any, b: any) => a.rank - b.rank);

      // Sort policies within each set by rank
      jsonData.policy_sets.forEach((policySet: any) => {
        policySet.authentication_policies.sort((a: any, b: any) => a.rule.rank - b.rule.rank);
        policySet.authorization_policies.sort((a: any, b: any) => a.rule.rank - b.rule.rank);
      });

      setData(jsonData as ProcessedData);
      setState("displaying");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setState("idle");
      console.error("Failed to load data:", err);
    }
  };

  return (
    <DataContext.Provider value={{ state, data, error, loadData, setError }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
