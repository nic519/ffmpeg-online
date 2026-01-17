import React from "react";
import { motion } from "framer-motion";
import { FFmpegCommandTemplate } from "@/config/ffmpeg-commands";
import ShinyText from './ShinyText';
import { FileIcon } from "@/utils/file-icons";

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
        background: 'rgba(10, 10, 15, 0.6)',
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
      <div className="flex-1 overflow-y-auto p-4 space-y-8 command-sidebar">
        {Object.entries(commandGroups)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([category, templates]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2 px-2 text-white/50">
              <FileIcon type={category} className="w-4 h-4" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">
                {category}
              </h4>
            </div>
            <div className="space-y-1">
              {templates.map((template, index) => (
                <motion.button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                    selectedTemplate?.id === template.id
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {selectedTemplate?.id === template.id && (
                    <motion.div
                      layoutId="active-bg"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <div className="relative flex items-center justify-between z-10">
                    <span className="text-sm font-medium truncate pr-2">
                      {template.id}
                    </span>
                    {template.inputFileCount && template.inputFileCount > 1 && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/50 font-medium">
                        x{template.inputFileCount}
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
        <div className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-white/60 text-xs font-medium">Local Processing</p>
            <p className="text-white/30 text-[10px]">Privacy First • No Uploads</p>
          </div>
        </div>
      </div>
    </div>
  );
};
