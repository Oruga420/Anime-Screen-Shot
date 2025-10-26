
import React from 'react';
import { AnimeInfo, FileStatus, ProcessingStatus } from '../types';
import { CheckCircleIcon, LoadingSpinner, XCircleIcon, FileIcon } from './Icons';

interface ResultsTableProps {
  statuses: FileStatus[];
  results: AnimeInfo[];
}

const getStatusIcon = (status: ProcessingStatus) => {
    switch(status) {
        case ProcessingStatus.COMPLETE:
            return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
        case ProcessingStatus.ERROR:
            return <XCircleIcon className="w-6 h-6 text-red-500" />;
        case ProcessingStatus.IDENTIFYING:
        case ProcessingStatus.SEARCHING:
             return <LoadingSpinner className="w-6 h-6 text-indigo-400" />;
        default:
            return <FileIcon className="w-6 h-6 text-gray-500" />;
    }
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ statuses, results }) => {
    if (statuses.length === 0 && results.length === 0) {
        return (
            <div className="text-center py-10 px-4 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400">Upload images and start processing to see results here.</p>
            </div>
        );
    }
    
    return (
        <div className="w-full overflow-hidden rounded-lg border border-gray-700">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-300 sm:pl-6">File</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Status</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Anime Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Streaming (CA)</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Reddit Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 bg-gray-900">
                        {statuses.map(({ file, status, message }) => {
                            const result = results.find(r => r.fileName === file.name);
                            return (
                                <tr key={file.name}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-100 sm:pl-6">{file.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(status)}
                                            <span>{message || status}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{result?.animeName || '...'}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{result?.streamingPlatformCanada || '...'}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{result?.redditRating || '...'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
