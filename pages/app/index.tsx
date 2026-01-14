import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import qs from "query-string";
import { Spinner } from "@heroui/react";
import { motion } from "framer-motion";
import { CommandSidebar } from "./components/CommandSidebar";
import { FileUpload } from "./components/FileUpload";
import { CommandEditor } from "./components/CommandEditor";
import { ExecutionSection } from "./components/ExecutionSection";
import { OutputFilesSection } from "./components/OutputFilesSection";
import { useFFmpeg } from "./hooks/useFFmpeg";
import { useCommandExecution } from "./hooks/useCommandExecution";
import { useCommandTemplate } from "./hooks/useCommandTemplate";
import Background from "./components/Background";
import BlurText from "./components/BlurText";

const App = () => {
  const [file, setFile] = useState<File | undefined>();
  const [fileList, setFileList] = useState<File[]>([]);

  // FFmpeg 初始化
  const { ffmpeg, spinning, tip, setSpinning, setTip } = useFFmpeg();

  // 命令模板管理
  const {
    selectedTemplate,
    commandGroups,
    commandState,
    handleSelectTemplate,
    updateCommandState,
  } = useCommandTemplate(fileList);

  // 命令执行
  const { href, downloadFileName, executeCommand } = useCommandExecution(ffmpeg);

  // 文件上传处理
  const handleFileChange = (file: File, fileList: File[]) => {
    setFile(file);
    setFileList(fileList);
    if (fileList.length > 0) {
      updateCommandState({
        inputFileName: fileList.length === 1 ? file.name : fileList.map(f => f.name).join(' '),
      });
    }
  };

  // 执行命令
  const handleExecute = () => {
    if (!file || !ffmpeg) {
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
      
      {/* Loading 状态 */}
      {spinning && (
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
                hasFile={Boolean(file)}
                onExecute={handleExecute}
                downloadHref={href}
                downloadFileName={downloadFileName}
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
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <OutputFilesSection ffmpeg={ffmpeg} hasFile={Boolean(file)} />
            </motion.div>
          </div>

          <Analytics />
        </div>
      </div>
    </div>
  );
};

export default App;
