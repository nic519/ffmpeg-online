import React, { useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/utils/toast";
import { buildFFmpegArgs } from "@/utils/ffmpeg-command";

interface CommandEditorProps {
  inputOptions: string;
  inputFileName: string;
  outputOptions: string;
  outputFileName: string;
  description?: string;
  onOutputOptionsChange: (value: string) => void;
  onOutputFileNameChange: (value: string) => void;
}

const StyledInput: React.FC<{
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  label?: string;
  icon?: React.ReactNode;
  isMono?: boolean;
}> = ({ value, placeholder, onChange, label, icon, isMono }) => (
  <div className="group relative">
    {label && (
      <label className="absolute -top-2.5 left-4 px-2 bg-[#0a0a0a] text-[10px] font-bold text-white/40 uppercase tracking-wider z-10 transition-colors group-focus-within:text-indigo-400">
        {label}
      </label>
    )}
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-indigo-400">
        {icon}
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-white/5 hover:bg-white/[0.07] focus:bg-white/10 border border-white/5 focus:border-indigo-500/50 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 ${isMono ? 'font-mono' : ''}`}
      />
    </div>
  </div>
);

const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}> = ({ title, icon, color, children }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors duration-500">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity duration-500 group-hover:opacity-100 opacity-50`} />
    
    <div className="flex items-center gap-3 mb-6 relative z-10">
      <div className={`w-10 h-10 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-400`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white/90">{title}</h3>
    </div>
    <div className="space-y-5 relative z-10">
      {children}
    </div>
  </div>
);

export const CommandEditor: React.FC<CommandEditorProps> = ({
  inputOptions,
  inputFileName,
  outputOptions,
  outputFileName,
  description,
  onOutputOptionsChange,
  onOutputFileNameChange,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const buildCommand = useCallback(() => {
    const args = buildFFmpegArgs(
      inputOptions,
      inputFileName,
      outputOptions,
      outputFileName
    );
    return ['ffmpeg', ...args].join(' ');
  }, [inputOptions, inputFileName, outputOptions, outputFileName]);

  const copyCommand = useCallback(async () => {
    const command = buildCommand();
    try {
      await navigator.clipboard.writeText(command);
      setIsCopied(true);
      toast.success('Command copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [buildCommand]);

  return (
    <div className="space-y-6">
      {/* Configuration Area */}
      <div>
        {/* Output Section */}
        <SectionCard
          title="Output Target"
          color="fuchsia"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        >
          <StyledInput
            label="File Name"
            value={outputFileName}
            placeholder="output.mp4"
            onChange={onOutputFileNameChange}
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
          />
          <StyledInput
            label="Parameters"
            value={outputOptions}
            placeholder="-c:v libx264"
            onChange={onOutputOptionsChange}
            isMono
            icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
        </SectionCard>
      </div>

      {/* Description & Preview */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
        <div 
          className="relative bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl overflow-hidden cursor-pointer"
          onClick={copyCommand}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <span className="text-xs font-medium text-white/30 uppercase tracking-wider">Generated Command</span>
            </div>
            
            <AnimatePresence mode="wait">
              {isCopied ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-1.5 text-emerald-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs font-bold">Copied!</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <span className="text-xs text-white/30">Click to copy</span>
                  <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div 
            ref={previewRef}
            className="font-mono text-sm text-white/80 leading-relaxed break-all selection:bg-indigo-500/30"
          >
            <span className="text-fuchsia-400">ffmpeg</span>
            {' '}
            <span className="text-indigo-300">{inputOptions}</span>
            {' '}
            <span className="text-white/60">{inputFileName}</span>
            {' '}
            <span className="text-indigo-300">{outputOptions}</span>
            {' '}
            <span className="text-emerald-300">{outputFileName}</span>
          </div>

          {description && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2 text-xs text-white/40">
              <svg className="w-4 h-4 shrink-0 text-indigo-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
