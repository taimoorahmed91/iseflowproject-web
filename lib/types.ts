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

// Application state types
export type AppState = "idle" | "loading" | "displaying";

export interface AppContextType {
  state: AppState;
  data: ProcessedData | null;
  error: string | null;
  loadData: (source: string | File) => Promise<void>;
  setError: (error: string | null) => void;
}
