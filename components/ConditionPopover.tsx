"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Condition } from "@/lib/types";

interface ConditionPopoverProps {
  condition: Condition;
  children: React.ReactNode;
}

export default function ConditionPopover({ condition, children }: ConditionPopoverProps) {
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
          className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl p-4 max-w-md"
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

          <div className="space-y-3 pr-6">
            {/* Name */}
            {condition.name && (
              <div>
                <div className="text-sm font-semibold text-blue-400 mb-1">
                  {condition.name}
                </div>
              </div>
            )}

            {/* Description */}
            {condition.description && (
              <div className="text-xs text-slate-300">
                {condition.description}
              </div>
            )}

            {/* Full condition details */}
            <div className="border-t border-slate-700 pt-3">
              <div className="text-xs text-slate-500 mb-1">Definition:</div>
              <div className="font-mono text-xs bg-slate-900 p-2 rounded">
                {condition.isNegate && (
                  <span className="text-red-400 font-bold mr-1">NOT</span>
                )}
                <span className="text-cyan-400">{condition.dictionaryName}</span>
                <span className="text-slate-500">.</span>
                <span className="text-green-400">{condition.attributeName}</span>
                <span className="text-yellow-500 mx-1">{condition.operator?.toUpperCase()}</span>
                <span className="text-purple-400">{condition.attributeValue}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
