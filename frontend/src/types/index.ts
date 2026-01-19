// 边界框类型
export interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  confidence: number;
}

// 识别结果类型
export interface RecognitionResult {
  boxes: Box[];
  image_path?: string;
  video_path?: string;
  prompt: string;
}

// 历史记录类型
export interface HistoryItem {
  id: number;
  type: 'image' | 'video';
  prompt: string;
  file_path: string;
  result: string;
  timestamp: string;
}

// 视频帧结果类型
export interface VideoFrameResult {
  frame: number;
  boxes: Box[];
}

// 视频识别结果类型
export interface VideoRecognitionResult {
  video_path: string;
  prompt: string;
  fps: number;
  width: number;
  height: number;
  results: VideoFrameResult[];
}