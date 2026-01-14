import React from "react";
import { Button } from "@heroui/react";

interface ExecutionSectionProps {
  hasFile: boolean;
  onExecute: () => void;
  downloadHref?: string;
  downloadFileName?: string;
}

export const ExecutionSection: React.FC<ExecutionSectionProps> = ({
  hasFile,
  onExecute,
  downloadHref,
  downloadFileName,
}) => {
  return (
    <div className="execution-section mb-6">
      <h4 className="text-lg font-semibold mb-4">3. Run and get the output file</h4>
      <Button
        color="primary"
        disabled={!hasFile}
        onPress={onExecute}
        className="mb-4"
      >
        run
      </Button>
      {downloadHref && (
        <div className="mt-4">
          <a
            href={downloadHref}
            download={downloadFileName}
            className="text-primary hover:underline font-medium"
          >
            download file
          </a>
        </div>
      )}
    </div>
  );
};
