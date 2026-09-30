"use client";

import { Coins, Loader2, X } from "lucide-react";
import { CostEstimate } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  estimate: CostEstimate | null;
  title: string;
  description: string;
  isGenerating?: boolean;
}

export default function ConfirmCostModal({
  isOpen,
  onClose,
  onConfirm,
  estimate,
  title,
  description,
  isGenerating = false,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="modal-backdrop fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md"
    >
      <div className="modal-panel studio-panel w-full max-w-md overflow-hidden rounded-2xl">
        {/* Top gradient accent */}
        <div className="h-1 bg-gradient-to-r from-[var(--violet)] via-purple-500 to-[var(--coral)]" />

        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow mb-1.5">AI generation</p>
              <h2 className="text-xl font-bold text-[var(--ink)]">{title}</h2>
            </div>
            <button
              aria-label="Close"
              title="Close"
              onClick={onClose}
              disabled={isGenerating}
              className="studio-icon-button"
            >
              <X size={19} />
            </button>
          </div>

          <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
            {description}
          </p>

          {/* Cost breakdown */}
          <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-[var(--ink)]">
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20 text-[var(--amber)]">
                <Coins size={15} />
              </span>
              Estimated generation cost
            </div>

            {estimate ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[var(--ink-muted)]">
                  <span>Generation tokens</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {estimate.estimatedTotalTokens.toLocaleString()}
                  </span>
                </div>

                {estimate.breakdown?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-[var(--ink-muted)]"
                  >
                    <span>{item.item}</span>
                    <span>${item.cost.toFixed(4)}</span>
                  </div>
                ))}

                <div className="mt-4 flex justify-between border-t border-[var(--line)] pt-4 font-semibold text-[var(--ink)]">
                  <span>Estimated total</span>
                  <span className="text-[var(--green)]">
                    ${estimate.estimatedCost.toFixed(4)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-6">
                <Loader2
                  size={24}
                  className="animate-spin text-[var(--violet)]"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="studio-button studio-button-secondary flex-1 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!estimate || isGenerating}
              className="studio-button studio-button-primary flex-1 rounded-xl"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Building…
                </>
              ) : (
                "Confirm & build"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
