// Type definitions for ISE Policy data structure

export interface ProcessedData {
  metadata: Metadata;
  policy_sets: PolicySet[];
  reference_data: ReferenceData;
}

export interface Metadata {
  generated_at: string;
  total_policy_sets: number;
  total_authentication_policies: number;
  total_authorization_policies: number;
}

export interface PolicySet {
  id: string;
  name: string;
  description: string;
  rank: number;
  state: "enabled" | "disabled";
  default: boolean;
  condition: Condition | null;
  serviceName: string;
  isProxy: boolean;
  link: Link;
  authentication_policies: AuthenticationPolicy[];
  authorization_policies: AuthorizationPolicy[];
}

export interface Condition {
  conditionType: "ConditionAttributes" | "LibraryConditionAttributes" |
                 "ConditionAndBlock" | "ConditionOrBlock";
  isNegate: boolean;
  // Simple condition fields
  dictionaryName?: string;
  attributeName?: string;
  operator?: string;
  dictionaryValue?: string | null;
  attributeValue?: string;
  // Library condition fields
  name?: string;
  id?: string;
  description?: string;
  link?: Link;
  // Block condition fields
  children?: Condition[];
}

export interface AuthenticationPolicy {
  rule: PolicyRule;
  identitySourceName: string;
  ifAuthFail: "REJECT" | "CONTINUE" | "DROP";
  ifUserNotFound: "REJECT" | "CONTINUE" | "DROP";
  ifProcessFail: "REJECT" | "CONTINUE" | "DROP";
  link: Link;
}

export interface AuthorizationPolicy {
  rule: PolicyRule;
  profile: string[];
  securityGroup: string | null;
  link: Link;
}

export interface PolicyRule {
  id: string;
  name: string;
  rank: number;
  state: "enabled" | "disabled";
  default: boolean;
  condition: Condition | null;
}

export interface Link {
  rel: string;
  href: string;
  type: string;
}

export interface ReferenceData {
  authorization_profiles: Record<string, AuthorizationProfile>;
  authorization_profiles_detail: Record<string, AuthorizationProfileDetail>;
  downloadable_acls: Record<string, DownloadableAcl>;
  allowed_protocols: Record<string, AllowedProtocol>;
  allowed_protocols_detail: Record<string, AllowedProtocolDetail>;
}

export interface AuthorizationProfile {
  id: string;
  name: string;
  description: string;
  link?: Link;
}

export interface AuthorizationProfileDetail extends AuthorizationProfile {
  accessType: string;
  authzProfileType: string;
  trackMovement?: boolean;
  agentlessPosture?: boolean;
  serviceTemplate?: boolean;
  easywiredSessionCandidate?: boolean;
  daclName?: string;
  voiceDomainPermission?: boolean;
  webRedirection?: WebRedirection;
  profileName?: string;
  advancedAttributes?: any[];
}

export interface WebRedirection {
  WebRedirectionType: string;
  acl: string;
  portalName: string;
  displayCertificatesRenewalMessages: boolean;
}

export interface DownloadableAcl {
  id: string;
  name: string;
  description: string;
  link: Link;
}

export interface AllowedProtocol {
  id: string;
  name: string;
  description: string;
  link: Link;
}

export interface AllowedProtocolDetail extends AllowedProtocol {
  processHostLookup?: boolean;
  allowPapAscii?: boolean;
  allowChap?: boolean;
  allowMsChapV1?: boolean;
  allowMsChapV2?: boolean;
  allowEapMd5?: boolean;
  allowLeap?: boolean;
  allowEapTls?: boolean;
  allowEapTtls?: boolean;
  allowEapFast?: boolean;
  allowPeap?: boolean;
  allowTeap?: boolean;
  [key: string]: any;
}

// Decision Tree Types
export interface DecisionTreeData {
  summary: {
    total_rules: number;
    endpoint_attribute_rules: number;
    other_rules: number;
    unique_values: {
      rVLAN: string[];
      NetworkZone: string[];
      Tenant: string[];
    };
  };
  mermaid_flowchart: string;
  tree_structure: TreeNode;
  paths: DecisionPath[];
  other_rules: OtherRule[];
}

export interface TreeNode {
  type: "root" | "decision" | "leaf";
  attribute?: string;
  children?: Record<string, TreeNode>;
  rule?: {
    name: string;
    rank: number;
    profile: string;
    policy_set: string;
    state: string;
  };
}

export interface DecisionPath {
  path_id: string;
  rVLAN?: string;
  NetworkZone?: string;
  Tenant?: string;
  rule_name: string;
  rule_rank: number;
  profile: string;
  policy_set: string;
}

export interface OtherRule {
  rule_name: string;
  rank: number;
  profile: string;
  policy_set: string;
  conditions: string;
  state: string;
}

// Application state types
export type AppState = "idle" | "loading" | "displaying";
export type ViewMode = "policy-sets" | "decision-tree";

export interface AppContextType {
  state: AppState;
  data: ProcessedData | null;
  decisionTreeData: DecisionTreeData | null;
  error: string | null;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  loadData: (source: string | File) => Promise<void>;
  loadDecisionTree: (source: string | File) => Promise<void>;
  setError: (error: string | null) => void;
}
