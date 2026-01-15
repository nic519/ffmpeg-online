import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/ffmpeg";
import { fileTypeFromBuffer } from "file-type";
import JSZip from "jszip";
import { toast } from "@/utils/toast";

interface OutputFile {
  name: string;
  href: string;
}

export const useCommandExecution = (ffmpeg: FFmpeg | null) => {
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>([]);
  const [href, setHref] = useState("");
  const [downloadFileName, setDownloadFileName] = useState("");
  const currentFSls = useRef<string[]>([]);

  const executeCommand = async (
    fileList: File[],
    inputOptions: string,
    inputFileName: string,
    outputOptions: string,
    outputFileName: string,
    setSpinning: (spinning: boolean) => void,
    setTip: (tip: string | false) => void
  ) => {
    if (!ffmpeg) {
      return;
    }

    setOutputFiles([]);
    setHref("");
    setDownloadFileName("");

    try {
      setTip("Loading file into browser");
      setSpinning(true);

      // 清理上一次生成的输出文件
      if (currentFSls.current.length > 0) {
        const currentFiles = ffmpeg.FS("readdir", ".") as string[];
        const oldOutputFiles = currentFiles.filter(
          (file) => !currentFSls.current.includes(file) && file !== "." && file !== ".."
        );
        oldOutputFiles.forEach((file) => {
          try {
            ffmpeg.FS("unlink", file);
          } catch (err) {
            console.warn(`Failed to delete old file: ${file}`, err);
          }
        });
      }

      // 写入所有文件到文件系统
      for (const fileItem of fileList) {
        const fileName = fileItem.name;
        ffmpeg.FS("writeFile", fileName, await fetchFile(fileItem));
      }

      currentFSls.current = ffmpeg.FS("readdir", ".") as string[];
      setTip("start executing the command");

      // 构建命令参数数组
      const commandArgs: string[] = [];

      // 处理输入选项
      const inputParts = inputOptions.split(/\s+/).filter((s) => s);
      let hasInputFiles = false;

      // 检查 inputOptions 中是否已经包含文件名
      for (let i = 0; i < inputParts.length; i++) {
        const part = inputParts[i];
        if (
          part === "-i" &&
          i + 1 < inputParts.length &&
          !inputParts[i + 1].startsWith("-")
        ) {
          hasInputFiles = true;
          break;
        }
      }

      if (hasInputFiles) {
        // inputOptions 已经包含完整的输入参数（包括文件名）
        commandArgs.push(...inputParts);
      } else {
        // 传统单文件格式：inputOptions + name
        commandArgs.push(...inputParts);
        if (inputParts.length === 0 || !inputParts.includes("-i")) {
          commandArgs.push("-i");
        }
        // 处理多个文件名（用空格分隔）
        const fileNames = inputFileName.split(/\s+/).filter((s) => s);
        commandArgs.push(...fileNames);
      }

      // 添加输出选项
      if (outputOptions) {
        commandArgs.push(...outputOptions.split(/\s+/).filter((s) => s));
      }

      // 添加输出文件名
      commandArgs.push(outputFileName);

      // eslint-disable-next-line no-console
      console.log("执行命令: ffmpeg", commandArgs.join(" "));

      await ffmpeg.run(...commandArgs);
      setSpinning(false);

      const FSls = ffmpeg.FS("readdir", ".") as string[];
      const outputFiles = FSls.filter(
        (i) => !currentFSls.current.includes(i)
      );

      if (outputFiles.length === 1) {
        const data = ffmpeg.FS("readFile", outputFiles[0]);
        const buffer =
          data.buffer instanceof ArrayBuffer
            ? data.buffer
            : new Uint8Array(data).buffer;
        const type = await fileTypeFromBuffer(buffer);

        if (type) {
          const objectURL = URL.createObjectURL(
            new Blob([buffer], { type: type.mime })
          );
          setHref(objectURL);
          setDownloadFileName(outputFiles[0]);
          toast.success(
            "Run successfully, click the download button to download the output file",
            { duration: 10000 }
          );
        }
      } else if (outputFiles.length > 1) {
        const zip = new JSZip();
        outputFiles.forEach((filleName) => {
          const data = ffmpeg.FS("readFile", filleName);
          zip.file(filleName, data);
        });
        const zipFile = await zip.generateAsync({ type: "blob" });
        const objectURL = URL.createObjectURL(zipFile);
        setHref(objectURL);
        setDownloadFileName("output.zip");
        toast.success(
          "Run successfully, click the download button to download the output file",
          { duration: 10000 }
        );
      } else {
        toast.success(
          "Run successfully, No files are generated, if you want to see the output of the ffmpeg command, please open the console",
          { duration: 10000 }
        );
      }
    } catch (err) {
      console.error(err);
      setSpinning(false);
      setTip(false);
      toast.error(
        "Failed to run, please check if the command is correct or open the console to view the error details",
        { duration: 10000 }
      );
    }
  };

  return {
    outputFiles,
    href,
    downloadFileName,
    executeCommand,
  };
};
