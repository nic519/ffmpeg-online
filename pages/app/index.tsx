import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import qs from "query-string";
import { motion } from "framer-motion";
import { CommandSidebar } from "../../components/CommandSidebar";
import { FileUpload } from "../../components/FileUpload";
import { CommandEditor } from "../../components/CommandEditor";
import { ExecutionSection } from "../../components/ExecutionSection";
// import { OutputFilesSection } from "../../components/OutputFilesSection";
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
  const { href, downloadFileName, executeCommand, reset } = useCommandExecution(ffmpeg);

  const isInitializing = spinning && tip === "ffmpeg static resource loading...";

  const handleFileChange = (file: File, fileList: File[]) => {
    console.warn("[App] handleFileChange: first =", file?.name, "count =", fileList.length);
    setCurrentFile(file);
    setFileList(fileList);
  };

  const handleExecute = () => {
    if (!currentFile || !ffmpeg) {
      console.warn("[App] handleExecute blocked: currentFile or ffmpeg missing", {
        hasFile: Boolean(currentFile),
        hasFFmpeg: Boolean(ffmpeg),
      });
      return;
    }
    console.warn("[App] handleExecute: files =", fileList.map((f) => f.name));
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

  const handleReset = () => {
    console.warn("[App] handleReset");
    setCurrentFile(null);
    setFileList([]);
    reset(); // 清除下载链接等状态
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

  const isProcessing = spinning && !isInitializing && Boolean(currentFile);
  const processTip =
    isProcessing && typeof tip === "string" && tip !== "ffmpeg static resource loading..."
      ? tip
      : false;

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* 静态背景 */}
      <Background />

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
              <FileUpload 
                onFileChange={handleFileChange} 
                selectedFile={currentFile}
                onReset={handleReset}
              />
              <ExecutionSection
                hasFile={Boolean(currentFile)}
                onExecute={handleExecute}
                downloadHref={href}
                downloadFileName={downloadFileName}
                isProcessing={isProcessing}
                processTip={processTip}
                isInitializing={isInitializing}
                initializingTip={isInitializing ? tip : false}
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
                description={selectedTemplate?.description}
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
