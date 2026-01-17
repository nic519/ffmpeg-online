import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import qs from "query-string";
import { Spinner } from "@heroui/react";
import { motion } from "framer-motion";
import { CommandSidebar } from "../../components/CommandSidebar";
import { FileUpload } from "../../components/FileUpload";
import { CommandEditor } from "../../components/CommandEditor";
import { ExecutionSection } from "../../components/ExecutionSection";
import { OutputFilesSection } from "../../components/OutputFilesSection";
import { useFFmpegContext } from "@/contexts/FFmpegContext";
import { useCommandContext } from "@/contexts/CommandContext";
import { useCommandExecution } from "../../hooks/useCommandExecution";
import Background from "../../components/Background";

const App = () => {
  // 从 Context 获取 FFmpeg 状态
  const { ffmpeg, spinning, tip, setSpinning, setTip } = useFFmpegContext();

  // 从 Context 获取命令状态
  const {
    selectedTemplate,
    commandGroups,
    commandState,
    fileList,
    currentFile,
    handleSelectTemplate,
    updateCommandState,
    setFileList,
    setCurrentFile,
  } = useCommandContext();

  // 命令执行
  const { href, downloadFileName, executeCommand } = useCommandExecution(ffmpeg);

  // 文件上传处理
  const handleFileChange = (file: File, fileList: File[]) => {
    setCurrentFile(file);
    setFileList(fileList);
  };

  // 执行命令
  const handleExecute = () => {
    if (!currentFile || !ffmpeg) {
      return;
    }
    executeCommand(
      fileList,
      commandState.inputOptions,
      commandState.inputFileName,
      commandState.outputOptions,
      commandState.outputFileName,
      setSpinning,
      setTip
    );
  };

  // URL 参数同步
  useEffect(() => {
    const { inputOptions, outputOptions, output } = qs.parse(
      window.location.search
    );
    if (inputOptions && typeof inputOptions === "string") {
      updateCommandState({ inputOptions });
    }
    if (outputOptions && typeof outputOptions === "string") {
      updateCommandState({ outputOptions });
    }
    if (output && typeof output === "string") {
      updateCommandState({ outputFileName: output });
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const queryString = qs.stringify({
        inputOptions: commandState.inputOptions,
        outputOptions: commandState.outputOptions,
        output: commandState.outputFileName,
      });
      const newUrl = `${location.origin}${location.pathname}?${queryString}`;
      history.pushState("", "", newUrl);
    });
  }, [commandState.inputOptions, commandState.outputOptions, commandState.outputFileName]);

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* 静态背景 */}
      <Background />
      
      {/* FFmpeg 初始化 Loading 状态（仅在首次加载时显示） */}
      {spinning && (tip === "ffmpeg static resource loading..." || !currentFile) && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div 
            className="flex flex-col items-center gap-6 p-10 rounded-3xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Spinner size="lg" color="primary" />
            {tip && (
              <p className="text-white/80 font-medium tracking-wide">{tip}</p>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* 侧边栏 */}
      <div className="fixed left-0 top-0 h-screen z-20">
        <CommandSidebar
          commandGroups={commandGroups}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>

      {/* 主内容区 */}
      <div className="flex-1 ml-72 min-h-screen relative z-10">
        <div className="max-w-5xl w-full px-8 py-16 mx-auto">
          

          {/* 内容区域 */}
          <div className="space-y-6">
            {/* 第一行：文件上传 + 执行 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <FileUpload onFileChange={handleFileChange} />
              <ExecutionSection
                hasFile={Boolean(currentFile)}
                onExecute={handleExecute}
                downloadHref={href}
                downloadFileName={downloadFileName}
                isProcessing={spinning && tip !== "ffmpeg static resource loading..." && Boolean(currentFile)}
                processTip={tip !== "ffmpeg static resource loading..." && Boolean(currentFile) ? tip : false}
              />
            </motion.div>

            {/* 第二行：命令编辑器 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <CommandEditor
                inputOptions={commandState.inputOptions}
                inputFileName={commandState.inputFileName}
                outputOptions={commandState.outputOptions}
                outputFileName={commandState.outputFileName}
                onInputOptionsChange={(value) =>
                  updateCommandState({ inputOptions: value })
                }
                onInputFileNameChange={(value) =>
                  updateCommandState({ inputFileName: value })
                }
                onOutputOptionsChange={(value) =>
                  updateCommandState({ outputOptions: value })
                }
                onOutputFileNameChange={(value) =>
                  updateCommandState({ outputFileName: value })
                }
              />
            </motion.div>

            {/* 第三行：输出文件 */}
            {/* <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <OutputFilesSection ffmpeg={ffmpeg} hasFile={Boolean(currentFile)} />
            </motion.div> */}
          </div>

          <Analytics />
        </div>
      </div>
    </div>
  );
};

export default App;
