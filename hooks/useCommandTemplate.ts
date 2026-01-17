import { useState, useEffect } from "react";
import { FFMPEG_COMMAND_TEMPLATES, FFmpegCommandTemplate } from "@/config/ffmpeg-commands";
import { buildFFmpegCommand, groupCommandsByCategory } from "@/utils/ffmpeg-command";
import { toast } from "@/utils/toast";

interface CommandState {
  inputOptions: string;
  inputFileName: string;
  outputOptions: string;
  outputFileName: string;
}

export const useCommandTemplate = (fileList: File[]) => {
  const [selectedTemplate, setSelectedTemplate] = useState<FFmpegCommandTemplate | null>(null);
  const [commandGroups, setCommandGroups] = useState<Record<string, FFmpegCommandTemplate[]>>({});
  const [commandState, setCommandState] = useState<CommandState>({
    inputOptions: "-i",
    inputFileName: "input.mp4",
    outputOptions: "",
    outputFileName: "output.mp4",
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
              requiredFileCount > 1 ? command.inputFiles.join("|") : command.inputFiles[0],
            outputFileName: command.outputFileName,
          }));
        } catch (error) {
          console.warn("Failed to update output filename:", error);
        }
      }
    }
  }, [fileList, selectedTemplate]);

  // 选择命令模板
  const handleSelectTemplate = (template: FFmpegCommandTemplate) => {
    setSelectedTemplate(template);

    const requiredFileCount = template.inputFileCount || 1;

    if (fileList.length >= requiredFileCount) {
      try {
        const command = buildFFmpegCommand(template, fileList);
        setCommandState({
          inputOptions: command.inputOptions,
          inputFileName:
            requiredFileCount > 1 ? command.inputFiles.join("|") : command.inputFiles[0],
          outputOptions: command.outputOptions,
          outputFileName: command.outputFileName,
        });
        toast.success("命令模板已应用");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`应用模板失败: ${errorMessage}`);
      }
    } else {
      toast.warning(`此模板需要 ${requiredFileCount} 个文件，请先上传文件`);
      // 仍然设置模板，但等待用户上传文件
      const baseName = fileList[0]?.name?.replace(/\.[^/.]+$/, "") || "output";
      setCommandState({
        inputOptions: template.inputOptions || "-i",
        inputFileName: fileList[0]?.name || "input.mp4",
        outputOptions: template.outputOptions,
        outputFileName: `${baseName}${template.outputExtension}`,
      });
    }
  };

  const updateCommandState = (updates: Partial<CommandState>) => {
    setCommandState((prev) => ({ ...prev, ...updates }));
  };

  return {
    selectedTemplate,
    commandGroups,
    commandState,
    handleSelectTemplate,
    updateCommandState,
  };
};
