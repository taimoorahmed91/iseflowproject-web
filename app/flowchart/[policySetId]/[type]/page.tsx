"use client";

import { useParams } from "next/navigation";
import { useData } from "@/lib/DataContext";
import { buildAuthenticationFlowchart, buildAuthorizationFlowchart } from "@/lib/flowchartBuilder";
import FlowChart from "@/components/FlowChart";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import IdleState from "@/components/IdleState";

export default function FlowchartPage() {
  const params = useParams();
  const { data, state } = useData();

  const policySetId = params.policySetId as string;
  const type = params.type as "auth" | "authz";

  // Show loading state
  if (state === "loading") {
    return <LoadingState />;
  }

  // If no data, show upload screen
  if (!data || state !== "displaying") {
    return <IdleState />;
  }

  // Find the policy set
  const policySet = data.policy_sets.find((ps) => ps.id === policySetId);

  if (!policySet) {
    return <ErrorState error={`Policy set not found: ${policySetId}`} />;
  }

  // Build flowchart based on type
  let flowchartData;
  try {
    if (type === "auth") {
      flowchartData = buildAuthenticationFlowchart(policySet, data);
    } else if (type === "authz") {
      flowchartData = buildAuthorizationFlowchart(policySet, data);
    } else {
      return <ErrorState error={`Invalid flow type: ${type}. Must be 'auth' or 'authz'.`} />;
    }
  } catch (error) {
    console.error("Error building flowchart:", error);
    return (
      <ErrorState
        error={`Failed to build flowchart: ${error instanceof Error ? error.message : "Unknown error"}`}
      />
    );
  }

  return (
    <FlowChart
      nodes={flowchartData.nodes}
      edges={flowchartData.edges}
      policySetName={policySet.name}
      flowType={type}
      onBack={() => window.history.back()}
      referenceData={data.reference_data}
    />
  );
}
