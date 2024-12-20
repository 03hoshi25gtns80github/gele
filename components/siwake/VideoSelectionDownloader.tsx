import React, { useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { saveAs } from "file-saver";

interface VideoFile {
  id: string;
  processed_name: string;
  original_path: string;
}

interface VideoSelectionDownloaderProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  targets: string[];
  isDownloading: boolean;
}

const VideoSelectionDownloader: React.FC<VideoSelectionDownloaderProps> = ({
  jobId,
  isOpen,
  onClose,
  targets,
  isDownloading
}) => {
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const supabase = createClient();

  React.useEffect(() => {
    if (isOpen) {
      fetchVideoFiles();
    }
  }, [isOpen, jobId]);

  const fetchVideoFiles = async () => {
    const { data, error } = await supabase
      .from("video_files")
      .select("id, original_path, processed_name")
      .eq("job_id", jobId);

    if (error) {
      console.error("Error fetching video files:", error);
      return;
    }

    setVideoFiles(data);
  };

  const handleTargetChange = (target: string) => {
    const newSelected = new Set(selectedTargets);
    if (newSelected.has(target)) {
      newSelected.delete(target);
    } else {
      newSelected.add(target);
    }
    setSelectedTargets(newSelected);
  };

  const downloadSelectedVideos = async () => {
    const selectedVideos = videoFiles.filter(file => 
      Array.from(selectedTargets).some(target => 
        file.processed_name.includes(target)
      )
    );

    for (const file of selectedVideos) {
      const { data, error } = await supabase.storage
        .from("siwake_storage")
        .download(file.original_path);

      if (error) {
        console.error("Error downloading video:", error);
        continue;
      }

      const extension = file.original_path.split('.').pop();
      const fileNameWithExtension = `${file.processed_name}.${extension}`;
      saveAs(data, fileNameWithExtension);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          ダウンロードする対象を選択
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {['error', ...targets].map((target) => (
            <div key={target} className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <input
                type="checkbox"
                id={target}
                checked={selectedTargets.has(target)}
                onChange={() => handleTargetChange(target)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label 
                htmlFor={target}
                className="text-gray-700 dark:text-gray-300 flex-1 cursor-pointer"
              >
                {target}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            onClick={downloadSelectedVideos}
            disabled={selectedTargets.size === 0 || isDownloading}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ダウンロード中...
              </>
            ) : (
              '選択した対象の動画をダウンロード'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoSelectionDownloader;