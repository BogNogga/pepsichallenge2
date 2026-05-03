"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { metricDescriptions, featureLabelToKey } from "@/lib/metric-descriptions";

interface MetricInfoProps {
  /** The label as displayed in the UI, e.g. "Battery Life" */
  label: string;
}

export default function MetricInfo({ label }: MetricInfoProps) {
  const key = featureLabelToKey[label];
  if (!key) return null;

  const desc = metricDescriptions[key];
  if (!desc) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center h-4 w-4 rounded-full text-text-secondary/50 hover:text-text-secondary transition-colors flex-shrink-0"
            aria-label={`About ${desc.title}`}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs bg-surface border-border-subtle text-text-primary p-3"
        >
          <p className="font-medium text-xs mb-1">{desc.title}</p>
          <p className="text-text-secondary text-xs leading-relaxed">
            {desc.description}
          </p>
          {desc.example && (
            <p className="text-text-secondary/70 text-xs mt-1 italic">
              {desc.example}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
