import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ExecutionSectionProps {
  hasFile: boolean;
  onExecute: () => void;
  downloadHref?: string;
  downloadFileName?: string;
  isProcessing?: boolean;
  processTip?: string | false;
  isInitializing?: boolean;
  initializingTip?: string | false;
}

export const ExecutionSection: React.FC<ExecutionSectionProps> = ({
  hasFile,
  onExecute,
  downloadHref,
  downloadFileName,
  isProcessing = false,
  processTip = false,
  isInitializing = false,
  initializingTip = false,
}) => {
  // 提取进度百分比
  const progress = useMemo(() => {
    if (typeof processTip === "string") {
      const match = processTip.match(/(\d+\.?\d*)%/);
      if (match) return parseFloat(match[1]);
    }
    return 0;
  }, [processTip]);

  // 确定当前状态
  const currentState = useMemo(() => {
    if (isInitializing) return "initializing";
    if (isProcessing) return "processing";
    if (downloadHref) return "success";
    if (hasFile) return "ready";
    return "disabled";
  }, [isInitializing, isProcessing, downloadHref, hasFile]);

  // 状态配置
  const config = {
    disabled: {
      bg: "bg-white/5",
      border: "border-white/10",
      text: "text-white/20",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      label: "等待文件",
      subLabel: "请先上传视频文件",
    },
    ready: {
      bg: "bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600",
      border: "border-transparent",
      text: "text-white",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "开始处理",
      subLabel: "点击运行 FFmpeg 命令",
    },
    initializing: {
      bg: "bg-zinc-900",
      border: "border-cyan-400/40",
      text: "text-white",
      icon: (
        <div className="w-8 h-8 border-4 border-cyan-300/40 border-t-cyan-300 rounded-full animate-spin" />
      ),
      label: "加载引擎...",
      subLabel: initializingTip || "FFmpeg 模块加载中，稍后即可开始处理",
    },
    processing: {
      bg: "bg-zinc-900",
      border: "border-white/10",
      text: "text-white",
      icon: (
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      ),
      label: "处理中...",
      subLabel: processTip || "正在转换视频",
    },
    success: {
      bg: "bg-emerald-500",
      border: "border-emerald-400",
      text: "text-white",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      label: "下载文件",
      subLabel: downloadFileName || "转换完成",
    },
  };

  const currentConfig = config[currentState];

  return (
    <div className="h-full min-h-[240px] relative">
      <AnimatePresence mode="wait">
        {currentState === "success" ? (
          // Success State: Download Button + Re-run Action
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full relative group"
          >
            {/* Download Link (Main Action) */}
            <a
              href={downloadHref}
              download={downloadFileName}
              className={`block w-full h-full rounded-3xl overflow-hidden relative shadow-2xl transition-transform duration-300 hover:scale-[1.02] ${currentConfig.bg}`}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]" />
              
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {currentConfig.icon}
                </motion.div>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold tracking-tight">{currentConfig.label}</h3>
                  <p className="text-white/80 text-sm mt-1 font-medium max-w-[200px] truncate mx-auto">
                    {currentConfig.subLabel}
                  </p>
                </motion.div>
              </div>
            </a>

            {/* Actions (Floating) */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              {/* Re-run Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onClick={(e) => {
                  e.preventDefault();
                  onExecute();
                }}
                className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
                title="重新运行"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // Other States: Button / Div
          <motion.button
            key="main"
            onClick={currentState === "ready" ? onExecute : undefined}
            disabled={currentState !== "ready"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full h-full rounded-3xl relative overflow-hidden transition-all duration-500 ${currentConfig.bg} ${
              currentState === "ready" 
                ? "shadow-lg hover:shadow-2xl hover:shadow-fuchsia-500/20 cursor-pointer" 
                : "cursor-default border border-white/5"
            }`}
            whileHover={currentState === "ready" ? { scale: 1.02 } : {}}
            whileTap={currentState === "ready" ? { scale: 0.98 } : {}}
          >
            {/* Progress Bar Background */}
            {currentState === "processing" && (
              <div className="absolute inset-0 z-0">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20"
                />
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-40"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                />
              </div>
            )}

            {/* Ready State Animated Background */}
            {currentState === "ready" && (
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
            )}

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className={`${currentState === "ready" ? "scale-110 mb-2" : ""} transition-transform duration-300`}>
                {currentConfig.icon}
              </div>
              <div>
                <h3 className={`text-2xl font-bold tracking-tight ${currentConfig.text}`}>
                  {currentConfig.label}
                </h3>
                <p className={`text-sm mt-1 font-medium ${currentState === "disabled" ? "text-white/20" : "text-white/60"}`}>
                  {currentConfig.subLabel}
                </p>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
