import type { Recommendation } from './recommendation.interface';
import type { SourceStatus } from './source-status.interface';

export interface AnalyzeResponse {
  gamertag: string;
  summary: string;
  sourceStatuses?: SourceStatus[];
  recommendations?: Recommendation[];
  foundry?: { connected?: boolean };
}
