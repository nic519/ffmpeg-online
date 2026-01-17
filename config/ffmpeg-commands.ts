export interface FFmpegCommandTemplate {
  id: string; // 唯一标识，也作为显示名称
  description: string; // 描述（包含如何修改参数的说明）
  category: string; // 分类
  outputOptions: string; // 输出选项（关键参数）
  outputExtension: string; // 输出文件扩展名
  inputFileCount?: number; // 默认1，只有>1时才写
  inputOptions?: string; // 默认"-i"，只有特殊情况下才写
}

export const FFMPEG_COMMAND_TEMPLATES: FFmpegCommandTemplate[] = [
  // 音频转换类
  {
    id: 'convert-to-mp3',
    description: '将音频或视频转换为 MP3 格式。默认 320kbps，如需修改码率，将 -b:a 320k 改为 -b:a 128k 等',
    category: 'AUDIO',
    outputOptions: '-codec:a libmp3lame -b:a 320k',
    outputExtension: '.mp3',
  },
  {
    id: 'extract-audio',
    description: '从视频中提取音频（保持原始音频编码，不重新压缩，默认封装为 M4A。若源音频为 MP3，建议使用下方“从视频中提取 MP3 音频（不转码）”模板或手动将输出文件名后缀改为 .mp3）',
    category: 'VIDEO',
    outputOptions: '-vn -acodec copy',
    outputExtension: '.m4a',
  }, 

  // 视频转换类
  {
    id: 'convert-to-mp4',
    description: '将视频转换为 MP4 格式。.ts 内部的视频、音频编码本身要是 MP4 支持的（常见的 H.264 + AAC 一般没问题）。',
    category: 'VIDEO',
    outputOptions: '-c copy',
    outputExtension: '.mp4',
  },
  {
    id: 'compress-video',
    description: '压缩视频文件大小。通过降低码率来减小文件大小，可调整 -crf 值（18-28，数值越大压缩率越高）',
    category: 'VIDEO',
    outputOptions: '-c:v libx264 -crf 28 -c:a aac -b:a 128k',
    outputExtension: '.mp4',
  },

  // 字幕处理类（多文件场景）
  {
    id: 'merge-subtitle-srt',
    description: '将 SRT 字幕文件合并到视频中。第一个文件为视频，第二个文件为 SRT 字幕',
    category: 'SUBTITLE',
    inputFileCount: 2,
    outputOptions: '-c:v copy -c:a copy -c:s mov_text',
    outputExtension: '-sub.mp4',
  },
  {
    id: 'merge-subtitle-ass',
    description: '将 ASS 字幕文件合并到视频中。第一个文件为视频，第二个文件为 ASS 字幕',
    category: 'SUBTITLE',
    inputFileCount: 2,
    outputOptions: '-c:v copy -c:a copy -c:s ass',
    outputExtension: '-sub.mp4',
  }, 

  // 视频处理类
  {
    id: 'concat-videos',
    description: '合并多个视频文件。将两个视频文件首尾连接',
    category: 'VIDEO',
    inputFileCount: 2,
    outputOptions: '-filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[outv][outa]" -map "[outv]" -map "[outa]"',
    outputExtension: '.mp4',
  }, 
];
