import React from "react";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";

interface ExecutionSectionProps {
  hasFile: boolean;
  onExecute: () => void;
  downloadHref?: string;
  downloadFileName?: string;
}

export const ExecutionSection: React.FC<ExecutionSectionProps> = ({
  hasFile,
  onExecute,
  downloadHref,
  downloadFileName,
}) => {
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
          boxShadow: '0 0 40px rgba(236, 72, 153, 0.15)',
          borderColor: 'rgba(236, 72, 153, 0.3)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">执行转换</h4>
            <p className="text-white/40 text-xs">运行 FFmpeg 命令</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <motion.button
            onClick={onExecute}
            disabled={!hasFile}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
              hasFile
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            whileHover={hasFile ? { scale: 1.02 } : {}}
            whileTap={hasFile ? { scale: 0.98 } : {}}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              开始处理
            </span>
          </motion.button>
          
          {downloadHref && (
            <motion.a
              href={downloadHref}
              download={downloadFileName}
              className="flex items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                background: 'rgba(16, 185, 129, 0.15)',
                borderColor: 'rgba(16, 185, 129, 0.4)',
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-emerald-400 font-medium text-sm">下载文件</p>
                <p className="text-emerald-400/60 text-xs truncate max-w-[180px]">{downloadFileName}</p>
              </div>
            </motion.a>
          )}
        </div>
      </motion.div>
    </div>
  );
};
