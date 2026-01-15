import { FFmpegCommandTemplate } from '@/config/ffmpeg-commands';

export function buildFFmpegArgs(
  inputOptions: string,
  inputFileName: string,
  outputOptions: string,
  outputFileName: string
): string[] {
  const args: string[] = [];

  const inputParts = (inputOptions || '').split(/\s+/).filter((s) => s);
  let hasInputFiles = false;

  for (let i = 0; i < inputParts.length; i++) {
    const part = inputParts[i];
    if (part === '-i' && i + 1 < inputParts.length && !inputParts[i + 1].startsWith('-')) {
      hasInputFiles = true;
      break;
    }
  }

  if (hasInputFiles) {
    args.push(...inputParts);
  } else {
    args.push(...inputParts);
    const fileNames = (inputFileName || '').split(/\s+/).filter((s) => s);
    const containsBareI = inputParts.includes('-i');

    fileNames.forEach((fileName, index) => {
      if (index === 0 && containsBareI) {
        args.push(fileName);
      } else {
        args.push('-i', fileName);
      }
    });
  }

  if (outputOptions) {
    args.push(...outputOptions.split(/\s+/).filter((s) => s));
  }

  if (outputFileName) {
    args.push(outputFileName);
  }

  return args;
}

/**
 * 根据文件扩展名判断文件类型
 */
export function getFileType(fileName: string): 'video' | 'audio' | 'subtitle' | 'image' | 'other' {
  const ext = fileName.toLowerCase().split('.').pop() || '';

  const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'];
  const audioExts = ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'wma'];
  const subtitleExts = ['srt', 'ass', 'ssa', 'vtt', 'sub'];
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (subtitleExts.includes(ext)) return 'subtitle';
  if (imageExts.includes(ext)) return 'image';
  return 'other';
}

/**
 * 根据模板和文件生成实际的 FFmpeg 命令参数
 */
export function buildFFmpegCommand(
  template: FFmpegCommandTemplate,
  files: File[]
): {
  inputOptions: string;
  inputFiles: string[];
  outputOptions: string;
  outputFileName: string;
} {
  const inputFileCount = template.inputFileCount || 1;

  if (files.length < inputFileCount) {
    throw new Error(`需要 ${inputFileCount} 个文件，但只提供了 ${files.length} 个`);
  }

  const inputFiles = files.slice(0, inputFileCount).map((f) => f.name);

  let inputOptions = template.inputOptions;
  if (!inputOptions) {
    inputOptions = '-i';
  } else {
    inputFiles.forEach((fileName, index) => {
      inputOptions = inputOptions!.replace(`{file${index + 1}}`, fileName);
    });

    if (inputOptions.includes('{file')) {
      throw new Error('输入选项模板格式错误，存在未替换的占位符');
    }
  }

  const baseName = files[0].name.replace(/\.[^/.]+$/, '');
  const outputFileName = `${baseName}${template.outputExtension}`;

  return {
    inputOptions,
    inputFiles,
    outputOptions: template.outputOptions,
    outputFileName,
  };
}

/**
 * 按类别分组命令
 */
export function groupCommandsByCategory(
  templates: FFmpegCommandTemplate[]
): Record<string, FFmpegCommandTemplate[]> {
  const grouped: Record<string, FFmpegCommandTemplate[]> = {};

  templates.forEach((template) => {
    if (!grouped[template.category]) {
      grouped[template.category] = [];
    }
    grouped[template.category].push(template);
  });

  return grouped;
}
