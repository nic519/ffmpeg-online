import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { FFmpegCommandTemplate } from "@/config/ffmpeg-commands";

interface CommandSidebarProps {
  commandGroups: Record<string, FFmpegCommandTemplate[]>;
  selectedTemplate: FFmpegCommandTemplate | null;
  onSelectTemplate: (template: FFmpegCommandTemplate) => void;
}

export const CommandSidebar: React.FC<CommandSidebarProps> = ({
  commandGroups,
  selectedTemplate,
  onSelectTemplate,
}) => {
  return (
    <div className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold m-0">命令模板</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {Object.entries(commandGroups).map(([category, templates]) => (
          <div key={category} className="mb-4">
            <h4 className="px-4 py-2 text-sm font-semibold text-primary bg-primary-50 border-b border-primary-100 m-0">
              {category}
            </h4>
            {templates.map((template) => (
              <Card
                key={template.id}
                isPressable
                onPress={() => onSelectTemplate(template)}
                className={`mx-2 my-1 cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? "bg-primary-50 border-l-4 border-l-primary"
                    : "hover:bg-gray-50"
                }`}
                shadow="none"
              >
                <CardBody className="p-3">
                  <div className="font-medium text-sm mb-1 text-gray-900">
                    {template.id}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 mb-0 line-height-1.5">
                    {template.description}
                  </p>
                  {template.inputFileCount && template.inputFileCount > 1 && (
                    <Chip
                      color="primary"
                      size="sm"
                      variant="flat"
                      className="mt-2"
                    >
                      {template.inputFileCount} 个文件
                    </Chip>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
