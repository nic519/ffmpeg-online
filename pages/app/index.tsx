import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import qs from "query-string";
import { Spinner } from "@heroui/react";
import { CommandSidebar } from "./components/CommandSidebar";
import { FileUpload } from "./components/FileUpload";
import { CommandEditor } from "./components/CommandEditor";
import { ExecutionSection } from "./components/ExecutionSection";
import { OutputFilesSection } from "./components/OutputFilesSection";
import { useFFmpeg } from "./hooks/useFFmpeg";
import { useCommandExecution } from "./hooks/useCommandExecution";
import { useCommandTemplate } from "./hooks/useCommandTemplate";

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
    <div className="min-h-screen flex">
      {spinning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" color="primary" />
            {tip && <p className="text-gray-600">{tip}</p>}
          </div>
        </div>
      )}

      <div className="fixed left-0 top-0 h-screen z-10">
        <CommandSidebar
          commandGroups={commandGroups}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>

      <div className="flex-1 ml-72 bg-white min-h-screen">
        <div className="max-w-6xl w-full px-5 py-5 mx-auto">
          <h2 className="text-center text-2xl font-bold mb-6">ffmpeg-online</h2>

          <FileUpload onFileChange={handleFileChange} />

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

          <ExecutionSection
            hasFile={Boolean(file)}
            onExecute={handleExecute}
            downloadHref={href}
            downloadFileName={downloadFileName}
          />

          <OutputFilesSection ffmpeg={ffmpeg} hasFile={Boolean(file)} />

          <Analytics />
        </div>
      </div>
    </div>
  );
};

export default App;
