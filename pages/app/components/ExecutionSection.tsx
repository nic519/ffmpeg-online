import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface ExecutionSectionProps {
  hasFile: boolean;
  onExecute: () => void;
  downloadHref?: string;
  downloadFileName?: string;
  isProcessing?: boolean;
  processTip?: string | false;
}

// 将 Spinner 提取到组件外部，避免每次渲染都重新创建
const Spinner = () => (
  <div className="inline-block w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
);

export const ExecutionSection: React.FC<ExecutionSectionProps> = ({
  hasFile,
  onExecute,
  downloadHref,
  downloadFileName,
  isProcessing = false,
  processTip = false,
}) => {
  // 提取百分比进度（如果 tip 是百分比格式）
  const progressData = useMemo(() => {
    if (typeof processTip === 'string' && processTip.includes('%')) {
      // 提取数字百分比值（如 "45.2%" -> 45.2）
      const match = processTip.match(/(\d+\.?\d*)%/);
      if (match) {
        return {
          text: processTip,
          value: parseFloat(match[1]),
        };
      }
      return { text: processTip, value: null };
    }
    return null;
  }, [processTip]);

  return (
    <div className="h-full">
      <motion.div 
        className="h-full rounded-2xl p-6 transition-all duration-300 relative"
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
            disabled={!hasFile || isProcessing}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden ${
              hasFile && !isProcessing
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            whileHover={hasFile && !isProcessing ? { scale: 1.02 } : {}}
            whileTap={hasFile && !isProcessing ? { scale: 0.98 } : {}}
          >
            {/* 进度条背景 - 使用 CSS transition 而不是 framer-motion，避免打断 Spinner 动画 */}
            {isProcessing && progressData && progressData.value !== null && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300 ease-out"
                style={{
                  width: `${progressData.value}%`,
                  opacity: 0.3,
                }}
              />
            )}
            
            <span className="flex items-center justify-center gap-2 relative z-10">
              {!isProcessing ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  开始处理
                </>
              ) : (
                <>
                  <Spinner />
                  <span>
                    {progressData ? `处理中 ${progressData.text}` : (processTip || '处理中...')}
                  </span>
                </>
              )}
            </span>
          </motion.button>
          
          {downloadHref && !isProcessing && (
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
