import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fileTypeFromBuffer } from "file-type";
import JSZip from "jszip";
import { toast } from "@/utils/toast";
import { buildFFmpegArgs } from "@/utils/ffmpeg-command";

const MAX_SINGLE_FILE_BYTES = 600 * 1024 * 1024;
const MAX_TOTAL_BYTES = 600 * 1024 * 1024;

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
      const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
      const tooLargeFile = fileList.find((file) => file.size > MAX_SINGLE_FILE_BYTES);

      if (tooLargeFile || totalSize > MAX_TOTAL_BYTES) {
         
        const sizeMB = ((tooLargeFile ? tooLargeFile.size : totalSize) / (1024 * 1024)).toFixed(1);
        toast.error(
          `当前文件约 ${sizeMB} MB。\n\n请在本地终端运行命令`,
          { duration: 20000 }
        );
        setSpinning(false);
        setTip(false);
        return;
      }

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
        try {
          const fileName = fileItem.name;
          const buffer = await fileItem.arrayBuffer();
          ffmpeg.FS("writeFile", fileName, new Uint8Array(buffer));
        } catch (e) {
          console.error("写入输入文件失败:", fileItem.name, e);
          throw e;
        }
      }

      currentFSls.current = ffmpeg.FS("readdir", ".") as string[];
      setTip("start executing the command");

      const commandArgs = buildFFmpegArgs(
        inputOptions,
        inputFileName,
        outputOptions,
        outputFileName
      );

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
      console.error("执行 ffmpeg 命令失败", {
        error: err,
        inputOptions,
        inputFileName,
        outputOptions,
        outputFileName,
      });
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
