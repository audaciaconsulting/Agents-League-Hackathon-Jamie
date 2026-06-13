import type { SourceProfile } from './source-profile.interface';

export interface SourceStatus {
  id: string;
  label: string;
  state: string;
  note: string;
  profile?: SourceProfile;
  gameNames?: string[];
}
