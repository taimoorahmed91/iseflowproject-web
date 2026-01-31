"use client";

import { X } from "lucide-react";
import { AuthenticationPolicy, AuthorizationPolicy, ProcessedData } from "@/lib/types";
import ConditionRenderer from "./ConditionRenderer";

interface DetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: any;
  referenceData?: ProcessedData["reference_data"];
}

export default function DetailSidebar({
  isOpen,
  onClose,
  nodeData,
  referenceData,
}: DetailSidebarProps) {
  if (!isOpen || !nodeData) return null;

  const { policy, policySet } = nodeData;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[500px] bg-slate-800 shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-100">Policy Details</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Policy Set Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Policy Set</h3>
              <p className="text-slate-200">{policySet.name}</p>
            </div>

            {/* Policy Info */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Policy Name</h3>
              <p className="text-slate-200 text-lg">{policy.rule.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Rank</h3>
                <p className="text-slate-200">{policy.rule.rank}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">State</h3>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    policy.rule.state === "enabled"
                      ? "bg-green-900/50 text-green-300 border border-green-700"
                      : "bg-gray-700 text-gray-400 border border-gray-600"
                  }`}
                >
                  {policy.rule.state.toUpperCase()}
                </span>
              </div>
            </div>

            {policy.rule.default && (
              <div>
                <span className="px-3 py-1 rounded text-xs font-semibold bg-yellow-900/50 text-yellow-300 border border-yellow-700">
                  DEFAULT POLICY
                </span>
              </div>
            )}

            {/* Condition */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3">Condition</h3>
              <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                <ConditionRenderer condition={policy.rule.condition} />
              </div>
            </div>

            {/* Authentication-specific fields */}
            {policy.identitySourceName && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Identity Source</h3>
                  <p className="text-slate-200">{policy.identitySourceName}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Results</h3>
                  <div className="space-y-2 bg-slate-900 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-slate-400">If Auth Fail:</span>
                      <span className="text-slate-200 font-semibold">{policy.ifAuthFail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">If User Not Found:</span>
                      <span className="text-slate-200 font-semibold">{policy.ifUserNotFound}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">If Process Fail:</span>
                      <span className="text-slate-200 font-semibold">{policy.ifProcessFail}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Authorization-specific fields */}
            {policy.profile && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">
                    Authorization Profile(s)
                  </h3>
                  <div className="space-y-3">
                    {policy.profile.map((profileName: string) => (
                      <ProfileDetail
                        key={profileName}
                        profileName={profileName}
                        referenceData={referenceData}
                      />
                    ))}
                  </div>
                </div>

                {policy.securityGroup && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-2">Security Group</h3>
                    <p className="text-slate-200">{policy.securityGroup}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileDetail({
  profileName,
  referenceData,
}: {
  profileName: string;
  referenceData?: ProcessedData["reference_data"];
}) {
  const profile = referenceData?.authorization_profiles_detail?.[profileName];

  if (!profile) {
    return (
      <div className="bg-slate-900 p-4 rounded-lg">
        <p className="text-slate-200 font-semibold mb-1">{profileName}</p>
        <p className="text-slate-500 text-sm">Profile details not available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-4 rounded-lg space-y-2">
      <div>
        <p className="text-slate-200 font-semibold">{profile.name}</p>
        {profile.description && (
          <p className="text-slate-400 text-sm mt-1">{profile.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-slate-500">Access Type:</span>
          <span
            className={`ml-2 font-semibold ${
              profile.accessType === "ACCESS_ACCEPT" ? "text-green-400" : "text-red-400"
            }`}
          >
            {profile.accessType}
          </span>
        </div>
        {profile.daclName && (
          <div>
            <span className="text-slate-500">DACL:</span>
            <span className="ml-2 text-slate-200">{profile.daclName}</span>
          </div>
        )}
      </div>

      {profile.webRedirection && (
        <div className="pt-2 border-t border-slate-700">
          <p className="text-slate-400 text-sm font-semibold mb-1">Web Redirection</p>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-slate-500">Type:</span>
              <span className="ml-2 text-slate-200">{profile.webRedirection.WebRedirectionType}</span>
            </div>
            <div>
              <span className="text-slate-500">Portal:</span>
              <span className="ml-2 text-slate-200">{profile.webRedirection.portalName}</span>
            </div>
            <div>
              <span className="text-slate-500">ACL:</span>
              <span className="ml-2 text-slate-200">{profile.webRedirection.acl}</span>
            </div>
          </div>
        </div>
      )}

      {profile.voiceDomainPermission && (
        <div className="pt-2">
          <span className="text-green-400 text-sm">✓ Voice Domain Permission</span>
        </div>
      )}
    </div>
  );
}
