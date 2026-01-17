import React from "react";
import { motion } from "framer-motion";
import { FFmpegCommandTemplate } from "@/config/ffmpeg-commands";
import ShinyText from './ShinyText';

interface CommandSidebarProps {
  commandGroups: Record<string, FFmpegCommandTemplate[]>;
  selectedTemplate: FFmpegCommandTemplate | null;
  onSelectTemplate: (template: FFmpegCommandTemplate) => void;
}

export const CommandSidebar: React.FC<CommandSidebarProps> = ({
  commandGroups,
  selectedTemplate,
  onSelectTemplate,
}) => {
  return (
    <div 
      className="w-72 h-screen flex flex-col"
      style={{
        background: 'rgba(10, 10, 15, 0.8)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo区域 */}
      <div 
        className="p-6"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <div className="flex items-center gap-3">
           
          <div>
            
            <h1 className=" font-bold">
              <ShinyText
                text="✨ FFMPEG ONLINE"
                speed={2}
                delay={0}
                color="#ffffff"
                shineColor="#ffff00"
                spread={120}
                direction="left"
                yoyo={false}
                pauseOnHover={false}
              />
            </h1> 
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 command-sidebar">
        {Object.entries(commandGroups)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([category, templates]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
              <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                {category}
              </h4>
            </div>
            <div className="space-y-1.5">
              {templates.slice(0, 1).map((template, index) => (
                <motion.button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                    selectedTemplate?.id === template.id
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20'
                      : 'hover:bg-white/5'
                  }`}
                  style={{
                    border: selectedTemplate?.id === template.id 
                      ? '1px solid rgba(99, 102, 241, 0.3)' 
                      : '1px solid transparent',
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm ${
                      selectedTemplate?.id === template.id 
                        ? 'text-indigo-300' 
                        : 'text-white/70 group-hover:text-white/90'
                    }`}>
                      {template.id}
                    </span>
                    {template.inputFileCount && template.inputFileCount > 1 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-300">
                        {template.inputFileCount} 文件
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 底部信息 */}
      <div 
        className="p-4"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white/50 text-xs">WebAssembly 驱动</p>
            <p className="text-white/30 text-xs">数据不会上传</p>
          </div>
        </div>
      </div>
    </div>
  );
};
