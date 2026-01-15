import React, { useRef } from "react";
import { motion } from "framer-motion";

interface FileUploadProps {
  onFileChange: (file: File, fileList: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<string[]>([]);

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    setUploadedFiles(fileArray.map(f => f.name));
    onFileChange(fileArray[0], fileArray);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className="h-full">
      <motion.div 
        className="h-full rounded-2xl p-6 transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
        }}
        whileHover={{ 
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.15)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">选择文件</h4>
            <p className="text-white/40 text-xs">本地处理，隐私安全</p>
          </div>
        </div>
        
        <motion.div
          className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-indigo-400 bg-indigo-500/10"
              : "border-white/10 hover:border-white/20 hover:bg-white/5"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div 
            className="mb-4"
            animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
          </motion.div>
          
          {uploadedFiles.length > 0 ? (
            <div>
              <p className="text-indigo-400 font-medium text-sm mb-1">
                已选择 {uploadedFiles.length} 个文件
              </p>
              <p className="text-white/30 text-xs truncate">
                {uploadedFiles[0]}{uploadedFiles.length > 1 && ` +${uploadedFiles.length - 1} more`}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-white/60 text-sm mb-1">
                拖放文件或点击上传
              </p>
              <p className="text-white/30 text-xs">
                支持多文件
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleInputChange}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
