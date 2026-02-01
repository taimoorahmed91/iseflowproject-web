"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { AllowedProtocolDetail } from "@/lib/types";

interface ServiceNamePopoverProps {
  protocolDetail: AllowedProtocolDetail | undefined;
  serviceName: string;
  children: React.ReactNode;
}

export default function ServiceNamePopover({ protocolDetail, serviceName, children }: ServiceNamePopoverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && popoverRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();

      // Calculate position (try to show above, if not enough space show below)
      let top = triggerRect.top - popoverRect.height - 8;
      let left = triggerRect.left + (triggerRect.width / 2) - (popoverRect.width / 2);

      // If popover would go off top of screen, show below instead
      if (top < 10) {
        top = triggerRect.bottom + 8;
      }

      // If popover would go off left edge, align to left
      if (left < 10) {
        left = 10;
      }

      // If popover would go off right edge, align to right
      if (left + popoverRect.width > window.innerWidth - 10) {
        left = window.innerWidth - popoverRect.width - 10;
      }

      setPosition({ top, left });
    }
  }, [isVisible]);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  if (!protocolDetail) {
    // If no protocol detail found, just render the service name as text
    return <span className="text-sm text-slate-300">{serviceName}</span>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        onClick={handleClick}
        className="relative cursor-pointer"
      >
        {children}
      </span>

      {isVisible && (
        <div
          ref={popoverRef}
          className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-4 max-w-xl max-h-[80vh] overflow-y-auto"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-4 pr-6">
            {/* Name */}
            <div>
              <div className="text-lg font-semibold text-blue-400 mb-1">
                {protocolDetail.name}
              </div>
              {protocolDetail.description && (
                <div className="text-sm text-slate-400">
                  {protocolDetail.description}
                </div>
              )}
            </div>

            {/* Protocol Settings */}
            <div className="border-t border-slate-700 pt-3">
              <div className="text-sm font-semibold text-slate-300 mb-2">Protocol Settings:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {renderProtocolSetting("PAP ASCII", protocolDetail.allowPapAscii)}
                {renderProtocolSetting("CHAP", protocolDetail.allowChap)}
                {renderProtocolSetting("MS-CHAP v1", protocolDetail.allowMsChapV1)}
                {renderProtocolSetting("MS-CHAP v2", protocolDetail.allowMsChapV2)}
                {renderProtocolSetting("EAP-MD5", protocolDetail.allowEapMd5)}
                {renderProtocolSetting("LEAP", protocolDetail.allowLeap)}
                {renderProtocolSetting("EAP-TLS", protocolDetail.allowEapTls)}
                {renderProtocolSetting("EAP-TTLS", protocolDetail.allowEapTtls)}
                {renderProtocolSetting("EAP-FAST", protocolDetail.allowEapFast)}
                {renderProtocolSetting("PEAP", protocolDetail.allowPeap)}
                {renderProtocolSetting("TEAP", protocolDetail.allowTeap)}
                {renderProtocolSetting("Process Host Lookup", protocolDetail.processHostLookup)}
              </div>
            </div>

            {/* PEAP Settings */}
            {protocolDetail.allowPeap && protocolDetail.peap && (
              <div className="border-t border-slate-700 pt-3">
                <div className="text-sm font-semibold text-green-400 mb-2">PEAP Settings:</div>
                <div className="text-xs space-y-1 bg-slate-900 p-3 rounded">
                  {renderDetailObject(protocolDetail.peap)}
                </div>
              </div>
            )}

            {/* EAP-FAST Settings */}
            {protocolDetail.allowEapFast && protocolDetail.eapFast && (
              <div className="border-t border-slate-700 pt-3">
                <div className="text-sm font-semibold text-purple-400 mb-2">EAP-FAST Settings:</div>
                <div className="text-xs space-y-1 bg-slate-900 p-3 rounded">
                  {renderDetailObject(protocolDetail.eapFast)}
                </div>
              </div>
            )}

            {/* EAP-TLS Settings */}
            {protocolDetail.allowEapTls && protocolDetail.eapTls && (
              <div className="border-t border-slate-700 pt-3">
                <div className="text-sm font-semibold text-cyan-400 mb-2">EAP-TLS Settings:</div>
                <div className="text-xs space-y-1 bg-slate-900 p-3 rounded">
                  {renderDetailObject(protocolDetail.eapTls)}
                </div>
              </div>
            )}

            {/* EAP-TTLS Settings */}
            {protocolDetail.allowEapTtls && protocolDetail.eapTtls && (
              <div className="border-t border-slate-700 pt-3">
                <div className="text-sm font-semibold text-yellow-400 mb-2">EAP-TTLS Settings:</div>
                <div className="text-xs space-y-1 bg-slate-900 p-3 rounded">
                  {renderDetailObject(protocolDetail.eapTtls)}
                </div>
              </div>
            )}

            {/* TEAP Settings */}
            {protocolDetail.allowTeap && protocolDetail.teap && (
              <div className="border-t border-slate-700 pt-3">
                <div className="text-sm font-semibold text-orange-400 mb-2">TEAP Settings:</div>
                <div className="text-xs space-y-1 bg-slate-900 p-3 rounded">
                  {renderDetailObject(protocolDetail.teap)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function renderProtocolSetting(label: string, value: boolean | undefined) {
  if (value === undefined) return null;

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${value ? "bg-green-500" : "bg-red-500"}`} />
      <span className={value ? "text-slate-300" : "text-slate-500"}>
        {label}
      </span>
    </div>
  );
}

function renderDetailObject(obj: any) {
  if (!obj || typeof obj !== "object") return null;

  return Object.entries(obj).map(([key, value]) => (
    <div key={key} className="flex justify-between">
      <span className="text-slate-400">{formatKey(key)}:</span>
      <span className="text-slate-200 font-mono">
        {typeof value === "boolean" ? (value ? "✓" : "✗") : String(value)}
      </span>
    </div>
  ));
}

function formatKey(key: string): string {
  // Convert camelCase to Title Case
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
