
import { AnimeInfo } from '../types';

const convertToCSV = (data: AnimeInfo[]): string => {
  if (data.length === 0) return '';

  const headers = [
    'Anime Name',
    'Plot Summary',
    'Type/Genre',
    'Streaming Platform (Canada)',
    'Reddit Rating',
    'Original File',
  ];

  const rows = data.map(item => {
    const values = [
      item.animeName,
      item.plotSummary,
      item.animeType.join(', '),
      item.streamingPlatformCanada,
      item.redditRating,
      item.fileName,
    ];

    return values.map(value => {
      const stringValue = String(value || '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

export const exportToCsv = (data: AnimeInfo[], filename: string): void => {
  const csvString = convertToCSV(data);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
