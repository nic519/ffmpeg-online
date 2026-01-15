import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FFMPEG_COMMAND_TEMPLATES, FFmpegCommandTemplate } from '@/config/ffmpeg-commands';
import { buildFFmpegCommand, groupCommandsByCategory } from '@/utils/ffmpeg-command';
import { toast } from '@/utils/toast';

interface CommandState {
  inputOptions: string;
  inputFileName: string;
  outputOptions: string;
  outputFileName: string;
}

interface CommandContextType {
  selectedTemplate: FFmpegCommandTemplate | null;
  commandGroups: Record<string, FFmpegCommandTemplate[]>;
  commandState: CommandState;
  fileList: File[];
  currentFile: File | undefined;
  handleSelectTemplate: (template: FFmpegCommandTemplate) => void;
  updateCommandState: (updates: Partial<CommandState>) => void;
  setFileList: (files: File[]) => void;
  setCurrentFile: (file: File | undefined) => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export const CommandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<FFmpegCommandTemplate | null>(null);
  const [commandGroups, setCommandGroups] = useState<Record<string, FFmpegCommandTemplate[]>>({});
  const [fileList, setFileList] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined);
  const [commandState, setCommandState] = useState<CommandState>({
    inputOptions: '-i',
    inputFileName: 'input.mp4',
    outputOptions: '',
    outputFileName: 'output.mp4',
  });

  // 初始化命令分组
  useEffect(() => {
    const grouped = groupCommandsByCategory(FFMPEG_COMMAND_TEMPLATES);
    setCommandGroups(grouped);
  }, []);

  // 当文件列表变化时，自动更新输出文件名
  useEffect(() => {
    if (fileList.length > 0 && selectedTemplate) {
      const requiredFileCount = selectedTemplate.inputFileCount || 1;
      if (fileList.length >= requiredFileCount) {
        try {
          const command = buildFFmpegCommand(selectedTemplate, fileList);
          setCommandState((prev) => ({
            ...prev,
            inputFileName:
              requiredFileCount > 1 ? command.inputFiles.join(' ') : command.inputFiles[0],
            outputFileName: command.outputFileName,
          }));
        } catch (error) {
          console.warn('Failed to update output filename:', error);
        }
      }
    }
  }, [fileList, selectedTemplate]);

  // 当文件列表变化时，更新输入文件名
  useEffect(() => {
    if (!selectedTemplate && fileList.length > 0) {
      setCommandState((prev) => ({
        ...prev,
        inputFileName:
          fileList.length === 1 ? fileList[0].name : fileList.map((f) => f.name).join(' '),
      }));
    }
  }, [fileList, selectedTemplate]);

  const handleSelectTemplate = (template: FFmpegCommandTemplate) => {
    setSelectedTemplate(template);
    const requiredFileCount = template.inputFileCount || 1;

    if (fileList.length >= requiredFileCount) {
      try {
        const command = buildFFmpegCommand(template, fileList);
        setCommandState({
          inputOptions: command.inputOptions,
          inputFileName:
            requiredFileCount > 1 ? command.inputFiles.join(' ') : command.inputFiles[0],
          outputOptions: command.outputOptions,
          outputFileName: command.outputFileName,
        });
        toast.success('命令模板已应用');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`应用模板失败: ${errorMessage}`);
      }
    } else {
      toast.warning(`此模板需要 ${requiredFileCount} 个文件，请先上传文件`);
      // 仍然设置模板，但等待用户上传文件
      const baseName = fileList[0]?.name?.replace(/\.[^/.]+$/, '') || 'output';
      setCommandState({
        inputOptions: template.inputOptions || '-i',
        inputFileName: fileList[0]?.name || 'input.mp4',
        outputOptions: template.outputOptions,
        outputFileName: `${baseName}${template.outputExtension}`,
      });
    }
  };

  const updateCommandState = (updates: Partial<CommandState>) => {
    setCommandState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <CommandContext.Provider
      value={{
        selectedTemplate,
        commandGroups,
        commandState,
        fileList,
        currentFile,
        handleSelectTemplate,
        updateCommandState,
        setFileList,
        setCurrentFile,
      }}
    >
      {children}
    </CommandContext.Provider>
  );
};

export const useCommandContext = () => {
  const context = useContext(CommandContext);
  if (context === undefined) {
    throw new Error('useCommandContext must be used within a CommandProvider');
  }
  return context;
};
