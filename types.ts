
export interface AnimeInfo {
  fileName: string;
  animeName: string;
  plotSummary: string;
  animeType: string[];
  streamingPlatformCanada: string;
  redditRating: string;
}

export enum ProcessingStatus {
  PENDING = 'Pending',
  IDENTIFYING = 'Identifying Anime...',
  SEARCHING = 'Searching Info...',
  COMPLETE = 'Complete',
  ERROR = 'Error',
}

export interface FileStatus {
  file: File;
  status: ProcessingStatus;
  message?: string;
}
