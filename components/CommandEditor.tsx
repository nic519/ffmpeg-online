import React, { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "@/utils/toast";
import { buildFFmpegArgs } from "@/utils/ffmpeg-command";

interface CommandEditorProps {
  inputOptions: string;
  inputFileName: string;
  outputOptions: string;
  outputFileName: string;
  onInputOptionsChange: (value: string) => void;
  onInputFileNameChange: (value: string) => void;
  onOutputOptionsChange: (value: string) => void;
  onOutputFileNameChange: (value: string) => void;
}

const GlassInput: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
}> = ({ label, value, placeholder, onChange, icon }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wider">
      {icon}
      {label}
    </label>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl font-mono text-sm text-white placeholder-white/20 transition-all duration-300 outline-none"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
        e.target.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.2)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.boxShadow = 'none';
      }}
    />
  </div>
);

export const CommandEditor: React.FC<CommandEditorProps> = ({
  inputOptions,
  inputFileName,
  outputOptions,
  outputFileName,
  onInputOptionsChange,
  onInputFileNameChange,
  onOutputOptionsChange,
  onOutputFileNameChange,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // 构建完整的 ffmpeg 命令
  const buildCommand = useCallback(() => {
    const args = buildFFmpegArgs(
      inputOptions,
      inputFileName,
      outputOptions,
      outputFileName
    );
    return ['ffmpeg', ...args].join(' ');
  }, [inputOptions, inputFileName, outputOptions, outputFileName]);

  // 复制命令到剪贴板
  const copyCommand = useCallback(async () => {
    const command = buildCommand();
    try {
      await navigator.clipboard.writeText(command);
      toast.success('命令已复制到剪贴板');
    } catch {
      toast.error('复制失败，请重试');
    }
  }, [buildCommand]);

  // 监听键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下了 Ctrl+C (Windows/Linux) 或 Cmd+C (Mac)
      const isCopyShortcut = (e.ctrlKey || e.metaKey) && e.key === 'c';
      
      if (isCopyShortcut) {
        // 检查焦点是否在命令预览区域或其内部
        const activeElement = document.activeElement;
        const previewElement = previewRef.current;
        
        if (previewElement && (
          previewElement.contains(activeElement) || 
          previewElement === activeElement ||
          // 如果焦点不在任何输入框中，也允许复制
          (activeElement && activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA')
        )) {
          // 如果焦点在输入框中，不拦截（让浏览器默认行为处理）
          if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            return;
          }
          
          e.preventDefault();
          copyCommand();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [copyCommand]);

  return (
    <motion.div 
      className="rounded-2xl p-6 transition-all duration-300"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
      }}
      whileHover={{ 
        boxShadow: '0 0 40px rgba(6, 182, 212, 0.15)',
        borderColor: 'rgba(6, 182, 212, 0.3)',
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm">命令配置</h4>
          <p className="text-white/40 text-xs">设置 FFmpeg 参数</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassInput
          label="输入选项"
          value={inputOptions}
          placeholder="-i"
          onChange={onInputOptionsChange}
          icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
        />
        <GlassInput
          label="输入文件"
          value={inputFileName}
          placeholder="input.mp4"
          onChange={onInputFileNameChange}
          icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <GlassInput
          label="输出选项"
          value={outputOptions}
          placeholder="-c:v libx264"
          onChange={onOutputOptionsChange}
          icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>}
        />
        <GlassInput
          label="输出文件"
          value={outputFileName}
          placeholder="output.mp4"
          onChange={onOutputFileNameChange}
          icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
        />
      </div>
      
      {/* 命令预览 */}
      <div 
        ref={previewRef}
        className="rounded-xl p-4 font-mono text-sm overflow-x-auto cursor-pointer group"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
        onClick={copyCommand}
        title="点击复制或按 Ctrl+C (Mac: Cmd+C)"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-white/30 text-xs">命令预览</span>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyCommand();
              }}
              className="text-white/40 hover:text-white/80 text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors"
            >
              <svg className="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制
            </button>
            <span className="text-white/20 text-xs">Ctrl+C</span>
          </div>
        </div>
        <code className="text-white/80 break-all leading-relaxed select-all">
          {buildCommand()}
        </code>
      </div>
    </motion.div>
  );
};
