import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getFilesType, FileIcon } from "@/utils/file-icons";

interface FileUploadProps {
  onFileChange: (file: File, fileList: File[]) => void;
  selectedFile?: File | null;
  onReset?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, selectedFile, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      console.warn("[FileUpload] handleFileChange: empty file list");
      return;
    }

    const fileArray = Array.from(fileList);
    setFiles(fileArray);
    console.warn(
      "[FileUpload] handleFileChange:",
      "count =", fileArray.length,
      "names =", fileArray.map((f) => f.name)
    );
    onFileChange(fileArray[0], fileArray);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.warn("[FileUpload] input change");
    handleFileChange(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
    console.warn("[FileUpload] drag over");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    console.warn("[FileUpload] drag leave");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    console.warn(
      "[FileUpload] drop:",
      "count =", droppedFiles?.length ?? 0,
      "names =", droppedFiles ? Array.from(droppedFiles).map((f) => f.name) : []
    );
    handleFileChange(droppedFiles);
  };

  useEffect(() => {
    if (!selectedFile) {
      setFiles([]);
    }
  }, [selectedFile]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = useMemo(() => files.reduce((acc, file) => acc + file.size, 0), [files]);

  const fileType = useMemo(() => getFilesType(files), [files]);

  const currentState = files.length > 0 ? "selected" : "empty";
  
  const config = {
    empty: {
      bg: "bg-white/5",
      border: "border-white/10",
      text: "text-white/40",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      ),
      label: "选择文件",
      subLabel: "拖拽文件到这里，或点击上传",
    },
    selected: {
      bg: "bg-indigo-600/20",
      border: "border-indigo-500/30",
      text: "text-indigo-300",
      icon: <FileIcon type={fileType} className="w-10 h-10" />,
      label: `已选择 ${files.length} 个文件`,
      subLabel: `总大小 ${formatSize(totalSize)}`,
    }
  };

  const currentConfig = config[currentState];

  return (
    <div className="h-full min-h-[240px] relative">
      <motion.div
        className={`relative w-full h-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 group ${isDragging ? "bg-indigo-500/20 border-indigo-500/50 scale-[1.02]" : currentConfig.bg} ${files.length > 0 ? "border border-indigo-500/30" : "border border-white/5 hover:border-white/20"}`}
        onClick={() => {
          fileInputRef.current?.click();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        layout
      >

        {!files.length && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentState}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={`p-4 rounded-2xl ${files.length ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-white/40"} transition-colors duration-300`}>
                {currentConfig.icon}
              </div>
              
              <div>
                <h3 className={`text-xl font-bold tracking-tight mb-1 ${files.length ? "text-indigo-100" : "text-white/80"}`}>
                  {currentConfig.label}
                </h3>
                <p className={`text-sm font-medium ${files.length ? "text-indigo-300/70" : "text-white/40"}`}>
                  {currentConfig.subLabel}
                </p>
              </div>

              {files.length > 0 && (
                <div className="mt-3 max-h-16 overflow-y-auto flex flex-wrap justify-center gap-2 px-2">
                  {files.slice(0, 4).map((file) => (
                    <span
                      key={file.name}
                      className="px-2 py-1 rounded-full bg-indigo-500/20 text-[11px] text-indigo-100/80 truncate max-w-[120px]"
                    >
                      {file.name}
                    </span>
                  ))}
                  {files.length > 4 && (
                    <span className="px-2 py-1 rounded-full bg-white/10 text-[11px] text-white/60">
                      +{files.length - 4} 更多
                    </span>
                  )}
                </div>
              )} 
            </motion.div>
          </AnimatePresence>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </motion.div>

      {files.length > 0 && onReset && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            console.warn("[FileUpload] reset click");
            onReset();
          }}
          className="absolute top-4 right-4 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
