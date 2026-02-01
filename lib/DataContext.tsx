"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ProcessedData, DecisionTreeData, AppState, AppContextType, ViewMode } from "./types";

const DataContext = createContext<AppContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>("idle");
  const [data, setData] = useState<ProcessedData | null>(null);
  const [decisionTreeData, setDecisionTreeData] = useState<DecisionTreeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("policy-sets");

  const loadData = async (source: string | File) => {
    try {
      console.log("Loading data from:", source instanceof File ? source.name : source);
      setState("loading");
      setError(null);

      let jsonData;

      if (source instanceof File) {
        // Load from uploaded file
        const text = await source.text();
        jsonData = JSON.parse(text);
      } else {
        // Load from URL or path
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        jsonData = await response.json();
      }

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

      console.log("✓ Data loaded successfully:", jsonData.metadata);
      setData(jsonData as ProcessedData);
      setState("displaying");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Failed to load data:", err);
      setError(errorMessage);
      setState("idle");
    }
  };

  const loadDecisionTree = async (source: string | File) => {
    try {
      console.log("Loading decision tree from:", source instanceof File ? source.name : source);
      setState("loading");
      setError(null);

      let jsonData;

      if (source instanceof File) {
        const text = await source.text();
        jsonData = JSON.parse(text);
      } else {
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Failed to fetch decision tree: ${response.status} ${response.statusText}`);
        }
        jsonData = await response.json();
      }

      // Basic validation
      if (!jsonData.summary || !jsonData.mermaid_flowchart || !jsonData.paths) {
        throw new Error("Invalid decision tree format: missing required fields");
      }

      console.log("✓ Decision tree loaded successfully");
      setDecisionTreeData(jsonData as DecisionTreeData);
      setState("displaying");
      setViewMode("decision-tree");
      console.log("State set to displaying, viewMode set to decision-tree");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Failed to load decision tree:", err);
      setError(errorMessage);
      setState("idle");
    }
  };

  return (
    <DataContext.Provider value={{
      state,
      data,
      decisionTreeData,
      error,
      viewMode,
      setViewMode,
      loadData,
      loadDecisionTree,
      setError
    }}>
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
