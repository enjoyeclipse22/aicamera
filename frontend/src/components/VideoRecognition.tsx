import React, { useState, useRef } from 'react';
import { Upload, Button, Input, Card, Divider, Spin, Alert, Row, Col, Progress } from 'antd';
import { UploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { recognizeVideo } from '../services/api';
import './VideoRecognition.css';

const { TextArea } = Input;

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  confidence: number;
}

interface FrameResult {
  frame: number;
  boxes: Box[];
}

interface VideoRecognitionResult {
  video_path: string;
  prompt: string;
  fps: number;
  width: number;
  height: number;
  results: FrameResult[];
}

interface VideoRecognitionProps {
  onRecognizeComplete?: () => void;
}

const VideoRecognition: React.FC<VideoRecognitionProps> = ({ onRecognizeComplete }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<VideoRecognitionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleVideoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setVideoUrl(e.target?.result as string);
      setResult(null);
      setError(null);
      setCurrentFrame(0);
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

  const handleRecognize = async () => {
    if (!videoUrl) {
      setError('请先上传视频');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      // 从DataURL获取Blob
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const file = new File([blob], 'upload.mp4', { type: 'video/mp4' });
      
      // 构建FormData
      const formData = new FormData();
      formData.append('video', file);
      formData.append('prompt', prompt);
      
      // 调用API
      const data = await recognizeVideo(formData);
      
      if (data.success) {
        setResult(data.result);
        setProgress(100);
        drawFrame(data.result.results[0].boxes);
        // 调用回调函数，刷新历史记录
        onRecognizeComplete?.();
      } else {
        setError('识别失败，请重试');
      }
    } catch (err) {
      setError('识别过程中发生错误，请重试');
      console.error('识别错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const drawFrame = (boxes: Box[]) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置canvas尺寸
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    // 绘制当前视频帧
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // 绘制边界框
    boxes.forEach(box => {
      // 绘制矩形
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      
      // 绘制标签背景
      ctx.fillStyle = '#FF0000';
      ctx.font = '14px Arial';
      const textWidth = ctx.measureText(box.label).width;
      ctx.fillRect(box.x1, box.y1 - 20, textWidth + 10, 20);
      
      // 绘制标签文本
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(box.label, box.x1 + 5, box.y1 - 5);
    });
  };

  const handleFrameChange = (frameIndex: number) => {
    if (!result) return;
    
    setCurrentFrame(frameIndex);
    drawFrame(result.results[frameIndex].boxes);
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || !result) return;
    
    const currentTime = videoRef.current.currentTime;
    const frameIndex = Math.floor(currentTime * result.fps);
    
    if (frameIndex < result.results.length) {
      setCurrentFrame(frameIndex);
      drawFrame(result.results[frameIndex].boxes);
    }
  };

  return (
    <div className="video-recognition-container">
      <Row gutter={16}>
        <Col span={12}>
          <Card title="上传视频" bordered={true}>
            <div className="upload-section">
              <Upload
                listType="picture"
                accept="video/*"
                beforeUpload={handleVideoUpload}
                fileList={[]}
                showUploadList={false}
              >
                {videoUrl ? (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    style={{ width: '100%', maxHeight: '300px' }}
                    onTimeUpdate={handleVideoTimeUpdate}
                  />
                ) : (
                  <div className="upload-placeholder">
                    <VideoCameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    <p>点击或拖拽视频到此处上传</p>
                  </div>
                )}
              </Upload>
            </div>
            
            <Divider />
            
            <div className="prompt-section">
              <label>提示词</label>
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="请输入识别提示词，例如：'识别视频中的人'"
                rows={3}
              />
            </div>
            
            <div className="button-section">
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleRecognize}
                loading={loading}
                block
              >
                开始识别
              </Button>
            </div>
            
            {loading && (
              <div className="progress-section">
                <Progress percent={progress} status="active" />
                <p style={{ textAlign: 'center', color: '#8c8c8c', fontSize: '12px', marginTop: '10px' }}>
                  视频识别中，请耐心等待...
                </p>
              </div>
            )}
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="识别结果" bordered={true}>
            {loading ? (
              <div className="loading-container">
                <Spin size="large" tip="识别中..." />
              </div>
            ) : error ? (
              <Alert message="识别失败" description={error} type="error" showIcon />
            ) : result ? (
              <div className="result-section">
                <div className="result-video">
                  {videoUrl && (
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      style={{ width: '100%', maxHeight: '300px' }}
                      onTimeUpdate={handleVideoTimeUpdate}
                    />
                  )}
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
                
                <Divider />
                
                <div className="frame-selector">
                  <h4>帧选择</h4>
                  <div className="frame-slider">
                    <input
                      type="range"
                      min="0"
                      max={result.results.length - 1}
                      value={currentFrame}
                      onChange={(e) => handleFrameChange(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <p style={{ textAlign: 'center', color: '#8c8c8c', fontSize: '12px', marginTop: '5px' }}>
                      帧 {currentFrame + 1} / {result.results.length}
                    </p>
                  </div>
                </div>
                
                <div className="result-boxes">
                  <h4>当前帧识别到的对象：</h4>
                  {result.results[currentFrame].boxes.length > 0 ? (
                    result.results[currentFrame].boxes.map((box, index) => (
                      <div key={index} className="box-item">
                        <span className="box-label">{box.label}</span>
                        <span className="box-confidence">置信度: {(box.confidence * 100).toFixed(2)}%</span>
                        <span className="box-coords">
                          坐标: ({box.x1}, {box.y1}) - ({box.x2}, {box.y2})
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#8c8c8c', textAlign: 'center' }}>当前帧未识别到对象</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-result">
                <p>请上传视频并点击开始识别</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VideoRecognition;