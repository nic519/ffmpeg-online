import React from "react";
import { Input } from "@heroui/react";

interface CommandEditorProps {
  inputOptions: string;
  inputFileName: string;
  outputOptions: string;
  outputFileName: string;
  onInputOptionsChange: (value: string) => void;
  onInputFileNameChange: (value: string) => void;
  onOutputOptionsChange: (value: string) => void;
  onOutputFileNameChange: (value: string) => void;
}

export const CommandEditor: React.FC<CommandEditorProps> = ({
  inputOptions,
  inputFileName,
  outputOptions,
  outputFileName,
  onInputOptionsChange,
  onInputFileNameChange,
  onOutputOptionsChange,
  onOutputFileNameChange,
}) => {
  return (
    <div className="command-editor-section mb-6">
      <h4 className="text-lg font-semibold mb-4">2. Set ffmpeg options</h4>
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-gray-700 font-mono">ffmpeg</span>
          <Input
            value={inputOptions}
            placeholder="please enter input options"
            onValueChange={onInputOptionsChange}
            size="sm"
            className="flex-1 min-w-[200px]"
          />
          <Input
            value={inputFileName}
            placeholder="please enter input filename"
            onValueChange={onInputFileNameChange}
            size="sm"
            className="flex-1 min-w-[200px]"
          />
          <Input
            value={outputOptions}
            placeholder="please enter output options"
            onValueChange={onOutputOptionsChange}
            size="sm"
            className="flex-1 min-w-[200px]"
          />
          <Input
            value={outputFileName}
            placeholder="Please enter the download file name"
            onValueChange={onOutputFileNameChange}
            size="sm"
            className="flex-1 min-w-[200px]"
          />
        </div>
        <div className="border border-gray-200 rounded-md p-3 bg-gray-50 text-gray-600 font-mono text-sm">
          ffmpeg {inputOptions} {inputFileName} {outputOptions} {outputFileName}
        </div>
      </div>
    </div>
  );
};
