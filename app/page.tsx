"use client";

import { useData } from "@/lib/DataContext";
import IdleState from "@/components/IdleState";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import PolicySetList from "@/components/PolicySetList";

export default function Home() {
  const { state, error } = useData();

  if (error) {
    return <ErrorState error={error} />;
  }

  if (state === "idle") {
    return <IdleState />;
  }

  if (state === "loading") {
    return <LoadingState />;
  }

  if (state === "displaying") {
    return <PolicySetList />;
  }

  return null;
}
