import React, { useState } from "react";
import { Input, Button } from "@heroui/react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fileTypeFromBuffer } from "file-type";
import { toast } from "@/utils/toast";

interface OutputFile {
  name: string;
  href: string;
}

interface OutputFilesSectionProps {
  ffmpeg: FFmpeg | null;
  hasFile: boolean;
}

export const OutputFilesSection: React.FC<OutputFilesSectionProps> = ({
  ffmpeg,
  hasFile,
}) => {
  const [files, setFiles] = useState("");
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>([]);

  const handleGetFiles = async () => {
    if (!files || !ffmpeg) {
      return;
    }
    const filenames = files
      .split(",")
      .filter((i) => i)
      .map((i) => i.trim());
    const outputFilesData: OutputFile[] = [];
    for (const filename of filenames) {
      try {
        const data = ffmpeg.FS("readFile", filename);
        const buffer =
          data.buffer instanceof ArrayBuffer
            ? data.buffer
            : new Uint8Array(data).buffer;
        const type = await fileTypeFromBuffer(buffer);

        if (type) {
          const objectURL = URL.createObjectURL(
            new Blob([buffer], { type: type.mime })
          );
          outputFilesData.push({
            name: filename,
            href: objectURL,
          });
        }
      } catch (err) {
        toast.error(`${filename} get failed`);
        console.error(err);
      }
    }
    setOutputFiles(outputFilesData);
  };

  return (
    <div className="output-files-section mb-6">
      <h4 className="text-lg font-semibold mb-2">4. Get other file from file system (use , split)</h4>
      <p className="text-gray-500 mb-4">
        In some scenarios, the output file contains multiple files. At this
        time, multiple file names can be separated by commas and typed into the
        input box below.
      </p>
      <div className="flex gap-2 mb-4 max-w-md">
        <Input
          value={files}
          placeholder="Please enter the download file name"
          onValueChange={setFiles}
          className="flex-1"
        />
        <Button
          color="primary"
          disabled={!hasFile}
          onPress={handleGetFiles}
        >
          confirm
        </Button>
      </div>
      {outputFiles.length > 0 && (
        <div className="space-y-2">
          {outputFiles.map((outputFile, index) => (
            <div key={index}>
              <a
                href={outputFile.href}
                download={outputFile.name}
                className="text-primary hover:underline font-medium"
              >
                {outputFile.name}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
