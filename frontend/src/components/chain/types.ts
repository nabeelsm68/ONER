/**
 * Convergence Chain Types & Geometry Architecture
 * Source: docs/ONER_Antigravity_Prompt_Pack.md §0.8
 * Reference: design-reference/oner-directions.html
 */

export interface ChainSignalNode {
  name: string;
  weight: number;    // possible weight (e.g. 10, 20, 15, 30, 15, 10)
  earned: number;    // earned weight (e.g. 4.2, 19.2, 14.1, 28.5, 13.8, 9.6)
  note: string;      // short readout (e.g. "photo + location", "NOx +31.4%")
}

export interface ConvergenceChainProps {
  signals?: ChainSignalNode[];
  coreScore?: number;             // e.g. 89.4
  likelyCause?: string;           // e.g. "Burner refractory fouling"
  actionName?: string;            // e.g. "Damper trim 1.042"
  verifiedNotice?: string;        // e.g. "4 signals agree"
  measuredOutcome?: string;       // e.g. "14.2"
  measuredUnit?: string;          // e.g. "tCO₂e per day"
  isAutoplay?: boolean;
  onSignalClick?: (signal: ChainSignalNode, index: number) => void;
  className?: string;
}

export interface CompactChainProps {
  signals?: Array<{ earned: number; possible: number } | number>;
  statusLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}
