import React, { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fileTypeFromBuffer } from "file-type";
import { toast } from "@/utils/toast";
import { motion } from "framer-motion";

interface OutputFile {
  name: string;
  href: string;
}

interface OutputFilesSectionProps {
  ffmpeg: FFmpeg | null;
  hasFile: boolean;
}

export const OutputFilesSection: React.FC<OutputFilesSectionProps> = ({
  ffmpeg,
  hasFile,
}) => {
  const [files, setFiles] = useState("");
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>([]);

  const handleGetFiles = async () => {
    if (!files || !ffmpeg) {
      return;
    }
    const filenames = files
      .split(",")
      .filter((i) => i)
      .map((i) => i.trim());
    const outputFilesData: OutputFile[] = [];
    for (const filename of filenames) {
      try {
        const data = ffmpeg.FS("readFile", filename);
        const buffer =
          data.buffer instanceof ArrayBuffer
            ? data.buffer
            : new Uint8Array(data).buffer;
        const type = await fileTypeFromBuffer(buffer);

        if (type) {
          const objectURL = URL.createObjectURL(
            new Blob([buffer], { type: type.mime })
          );
          outputFilesData.push({
            name: filename,
            href: objectURL,
          });
        }
      } catch (err) {
        toast.error(`${filename} get failed`);
        console.error(err);
      }
    }
    setOutputFiles(outputFilesData);
  };

  return (
    <motion.div 
      className="rounded-2xl p-6 transition-all duration-300"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
      }}
      whileHover={{ 
        boxShadow: '0 0 40px rgba(251, 191, 36, 0.1)',
        borderColor: 'rgba(251, 191, 36, 0.2)',
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm">获取其他文件</h4>
          <p className="text-white/40 text-xs">多输出场景使用逗号分隔</p>
        </div>
      </div>
      
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={files}
          placeholder="文件名，多个用逗号分隔"
          onChange={(e) => setFiles(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl font-mono text-sm text-white placeholder-white/20 transition-all duration-300 outline-none"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(251, 191, 36, 0.5)';
            e.target.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <motion.button
          onClick={handleGetFiles}
          disabled={!hasFile}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            hasFile
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
          whileHover={hasFile ? { scale: 1.02 } : {}}
          whileTap={hasFile ? { scale: 0.98 } : {}}
        >
          获取
        </motion.button>
      </div>
      
      {outputFiles.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {outputFiles.map((outputFile, index) => (
            <motion.a
              key={index}
              href={outputFile.href}
              download={outputFile.name}
              className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 group"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
              whileHover={{ 
                background: 'rgba(99, 102, 241, 0.15)',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                x: 4,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <span className="text-indigo-300 font-medium text-sm truncate">
                {outputFile.name}
              </span>
            </motion.a>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
