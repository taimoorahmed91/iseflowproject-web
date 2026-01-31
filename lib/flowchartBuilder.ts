import { Node, Edge, MarkerType } from "@xyflow/react";
import {
  PolicySet,
  AuthenticationPolicy,
  AuthorizationPolicy,
  ProcessedData,
} from "./types";

// Node dimensions and spacing
const POLICY_NODE_WIDTH = 280;
const RESULT_NODE_WIDTH = 220;
const HORIZONTAL_SPACING = 400;
const VERTICAL_SPACING = 180;

export interface FlowchartData {
  nodes: Node[];
  edges: Edge[];
}

export function buildAuthenticationFlowchart(
  policySet: PolicySet,
  data: ProcessedData
): FlowchartData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const policies = policySet.authentication_policies;

  policies.forEach((policy, index) => {
    const yPosition = index * VERTICAL_SPACING;

    // Policy decision node
    const policyNodeId = `auth-policy-${policy.rule.id}`;
    nodes.push({
      id: policyNodeId,
      type: "default",
      position: { x: 0, y: yPosition },
      data: {
        label: renderAuthPolicyNode(policy),
        policy: policy,
        policySet: policySet,
      },
      style: {
        background: policy.rule.state === "enabled" ? "#1e40af" : "#374151",
        color: "#ffffff",
        border: policy.rule.state === "enabled" ? "2px solid #3b82f6" : "2px solid #6b7280",
        borderRadius: "8px",
        padding: "16px",
        width: POLICY_NODE_WIDTH,
        opacity: policy.rule.state === "enabled" ? 1 : 0.6,
        fontSize: "13px",
      },
    });

    // Result node - depends on authentication results
    const resultNodeId = `auth-result-${policy.rule.id}`;
    const resultLabel = renderAuthResultNode(policy);
    const resultColor = getAuthResultColor(policy);

    nodes.push({
      id: resultNodeId,
      type: "default",
      position: { x: HORIZONTAL_SPACING, y: yPosition },
      data: {
        label: resultLabel,
        policy: policy,
        policySet: policySet,
      },
      style: {
        background: resultColor.bg,
        color: "#ffffff",
        border: `2px solid ${resultColor.border}`,
        borderRadius: "8px",
        padding: "16px",
        width: RESULT_NODE_WIDTH,
        fontSize: "13px",
      },
    });

    // "Match" edge (policy to result)
    edges.push({
      id: `edge-match-${policy.rule.id}`,
      source: policyNodeId,
      target: resultNodeId,
      label: "Match",
      type: "smoothstep",
      style: { stroke: "#22c55e", strokeWidth: 2 },
      labelStyle: { fill: "#22c55e", fontWeight: 600, fontSize: "12px" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#22c55e" },
    });

    // "No Match" edge (policy to next policy)
    if (index < policies.length - 1) {
      const nextPolicyNodeId = `auth-policy-${policies[index + 1].rule.id}`;
      edges.push({
        id: `edge-nomatch-${policy.rule.id}`,
        source: policyNodeId,
        target: nextPolicyNodeId,
        label: "No Match",
        type: "smoothstep",
        style: { stroke: "#6b7280", strokeWidth: 1 },
        labelStyle: { fill: "#6b7280", fontSize: "12px" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
      });
    }
  });

  return { nodes, edges };
}

export function buildAuthorizationFlowchart(
  policySet: PolicySet,
  data: ProcessedData
): FlowchartData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const policies = policySet.authorization_policies;

  policies.forEach((policy, index) => {
    const yPosition = index * VERTICAL_SPACING;

    // Policy decision node
    const policyNodeId = `authz-policy-${policy.rule.id}`;
    nodes.push({
      id: policyNodeId,
      type: "default",
      position: { x: 0, y: yPosition },
      data: {
        label: renderAuthzPolicyNode(policy),
        policy: policy,
        policySet: policySet,
        referenceData: data.reference_data,
      },
      style: {
        background: policy.rule.state === "enabled" ? "#1e40af" : "#374151",
        color: "#ffffff",
        border: policy.rule.state === "enabled" ? "2px solid #3b82f6" : "2px solid #6b7280",
        borderRadius: "8px",
        padding: "16px",
        width: POLICY_NODE_WIDTH,
        opacity: policy.rule.state === "enabled" ? 1 : 0.6,
        fontSize: "13px",
      },
    });

    // Result node
    const resultNodeId = `authz-result-${policy.rule.id}`;
    const resultLabel = renderAuthzResultNode(policy, data);
    const resultColor = getAuthzResultColor(policy, data);

    nodes.push({
      id: resultNodeId,
      type: "default",
      position: { x: HORIZONTAL_SPACING, y: yPosition },
      data: {
        label: resultLabel,
        policy: policy,
        policySet: policySet,
        referenceData: data.reference_data,
      },
      style: {
        background: resultColor.bg,
        color: "#ffffff",
        border: `2px solid ${resultColor.border}`,
        borderRadius: "8px",
        padding: "16px",
        width: RESULT_NODE_WIDTH,
        fontSize: "13px",
      },
    });

    // "Match" edge (policy to result)
    edges.push({
      id: `edge-match-${policy.rule.id}`,
      source: policyNodeId,
      target: resultNodeId,
      label: "Match",
      type: "smoothstep",
      style: { stroke: "#22c55e", strokeWidth: 2 },
      labelStyle: { fill: "#22c55e", fontWeight: 600, fontSize: "12px" },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#22c55e" },
    });

    // "No Match" edge (policy to next policy)
    if (index < policies.length - 1) {
      const nextPolicyNodeId = `authz-policy-${policies[index + 1].rule.id}`;
      edges.push({
        id: `edge-nomatch-${policy.rule.id}`,
        source: policyNodeId,
        target: nextPolicyNodeId,
        label: "No Match",
        type: "smoothstep",
        style: { stroke: "#6b7280", strokeWidth: 1 },
        labelStyle: { fill: "#6b7280", fontSize: "12px" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
      });
    }
  });

  return { nodes, edges };
}

// Render functions for node labels

function renderAuthPolicyNode(policy: AuthenticationPolicy): string {
  const stateBadge = policy.rule.state === "enabled" ? "✓" : "✗";
  const defaultBadge = policy.rule.default ? " [DEFAULT]" : "";
  return `${stateBadge} ${policy.rule.name}${defaultBadge}\nRank: ${policy.rule.rank}`;
}

function renderAuthResultNode(policy: AuthenticationPolicy): string {
  return `Identity: ${policy.identitySourceName}\n\nOn Auth Fail: ${policy.ifAuthFail}\nOn User Not Found: ${policy.ifUserNotFound}\nOn Process Fail: ${policy.ifProcessFail}`;
}

function renderAuthzPolicyNode(policy: AuthorizationPolicy): string {
  const stateBadge = policy.rule.state === "enabled" ? "✓" : "✗";
  const defaultBadge = policy.rule.default ? " [DEFAULT]" : "";
  return `${stateBadge} ${policy.rule.name}${defaultBadge}\nRank: ${policy.rule.rank}`;
}

function renderAuthzResultNode(policy: AuthorizationPolicy, data: ProcessedData): string {
  const profiles = policy.profile.join(", ");
  const sg = policy.securityGroup ? `\nSecurity Group: ${policy.securityGroup}` : "";
  return `Profile(s):\n${profiles}${sg}`;
}

function getAuthResultColor(policy: AuthenticationPolicy): { bg: string; border: string } {
  // Check the primary result
  if (policy.ifAuthFail === "REJECT" || policy.ifUserNotFound === "REJECT") {
    return { bg: "#991b1b", border: "#dc2626" }; // Red for reject
  }
  if (policy.ifAuthFail === "DROP" || policy.ifUserNotFound === "DROP") {
    return { bg: "#7c2d12", border: "#ea580c" }; // Orange for drop
  }
  // Continue
  return { bg: "#854d0e", border: "#eab308" }; // Yellow for continue
}

function getAuthzResultColor(
  policy: AuthorizationPolicy,
  data: ProcessedData
): { bg: string; border: string } {
  // Check if any profile is a deny/reject type
  const hasDenyProfile = policy.profile.some((profileName) => {
    const profile = data.reference_data.authorization_profiles_detail[profileName];
    return profile && profile.accessType === "ACCESS_REJECT";
  });

  if (hasDenyProfile) {
    return { bg: "#991b1b", border: "#dc2626" }; // Red for deny
  }

  // Default to success/permit
  return { bg: "#166534", border: "#22c55e" }; // Green for permit
}
