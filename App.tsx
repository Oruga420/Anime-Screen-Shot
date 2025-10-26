
import React, { useState, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultsTable } from './components/ResultsTable';
import { identifyAnimeFromImage, getAnimeDetails } from './services/geminiService';
import { exportToCsv } from './utils/csvHelper';
import { AnimeInfo, FileStatus, ProcessingStatus } from './types';
import { CsvIcon } from './components/Icons';

export default function App() {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [processedData, setProcessedData] = useState<AnimeInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newFileStatuses = files.map(file => ({
      file,
      status: ProcessingStatus.PENDING,
    }));
    setFileStatuses(newFileStatuses);
    setProcessedData([]);
  }, []);

  const updateFileStatus = (fileName: string, status: ProcessingStatus, message?: string) => {
    setFileStatuses(prev =>
      prev.map(fs =>
        fs.file.name === fileName ? { ...fs, status, message } : fs
      )
    );
  };

  const handleProcess = async () => {
    if (fileStatuses.length === 0) return;

    setIsProcessing(true);
    let allData: AnimeInfo[] = [];

    for (const fileStatus of fileStatuses) {
      const { file } = fileStatus;
      try {
        updateFileStatus(file.name, ProcessingStatus.IDENTIFYING);
        const animeName = await identifyAnimeFromImage(file);

        updateFileStatus(file.name, ProcessingStatus.SEARCHING, `Found: ${animeName}`);
        const details = await getAnimeDetails(animeName);

        const newAnimeInfo: AnimeInfo = {
          fileName: file.name,
          ...details,
        };
        allData.push(newAnimeInfo);
        setProcessedData([...allData]);

        updateFileStatus(file.name, ProcessingStatus.COMPLETE);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        updateFileStatus(file.name, ProcessingStatus.ERROR, errorMessage);
        console.error(`Failed to process ${file.name}:`, error);
      }
    }

    setIsProcessing(false);
  };

  const progress = fileStatuses.length > 0 ? (processedData.length / fileStatuses.length) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Anime Screenshot Analyzer
          </h1>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto flex flex-col space-y-8">
          
          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">1. Upload Your Screenshots</h2>
            <FileUploader onFilesSelected={handleFilesSelected} disabled={isProcessing} />
          </div>

          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">2. Process & Analyze</h2>
            <p className="text-gray-400 mb-4">The AI will identify each anime, search for its details online, and compile the results.</p>
            <button
              onClick={handleProcess}
              disabled={isProcessing || fileStatuses.length === 0}
              className="w-full px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {isProcessing ? `Processing... (${Math.round(progress)}%)` : `Start Processing ${fileStatuses.length} Image(s)`}
            </button>
            {isProcessing && (
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">3. View Results & Export</h2>
              <button
                onClick={() => exportToCsv(processedData, 'anime_data.csv')}
                disabled={processedData.length === 0 || isProcessing}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <CsvIcon className="w-5 h-5 mr-2" />
                Download CSV
              </button>
            </div>
            <ResultsTable statuses={fileStatuses} results={processedData} />
          </div>

        </div>
      </main>

      <footer className="w-full py-4 mt-8 border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>Powered by Google Gemini. Built for efficient anime data collection.</p>
        </div>
      </footer>
    </div>
  );
}
