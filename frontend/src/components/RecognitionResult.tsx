import React, { useRef, useEffect, useState } from 'react';
import { Card, Typography, Spin } from 'antd';

const { Title, Text } = Typography;

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  confidence: number;
}

interface RecognitionResultProps {
  imageUrl: string | undefined;
  result: any;
  type?: 'image' | 'video';
}

const RecognitionResult: React.FC<RecognitionResultProps> = ({ imageUrl, result }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl || !result || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.onload = () => {
      // 设置canvas尺寸
      canvas.width = image.width;
      canvas.height = image.height;

      // 绘制图像
      ctx.drawImage(image, 0, 0);

      // 绘制边界框
      if (result.boxes && result.boxes.length > 0) {
        result.boxes.forEach((box: Box) => {
          // 绘制矩形框
          ctx.strokeStyle = '#1890ff';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);

          // 绘制标签背景
          ctx.fillStyle = '#1890ff';
          const labelWidth = ctx.measureText(box.label).width + 10;
          ctx.fillRect(box.x1, box.y1 - 25, labelWidth, 20);

          // 绘制标签文本
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.fillText(box.label, box.x1 + 5, box.y1 - 10);
        });
      }

      setLoading(false);
    };

    image.src = imageUrl;
  }, [imageUrl, result]);

  if (loading) {
    return (
      <Card title="识别结果" bordered={false}>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="识别结果" bordered={false}>
      <div style={{ marginBottom: 16 }}>
        <Text strong>提示词:</Text> {result.prompt}
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>识别到的对象数量:</Text> {result.boxes.length}
      </div>
      <div className="result-container" style={{ overflow: 'auto' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
      </div>
      <div style={{ marginTop: 16 }}>
        <Title level={5}>识别详情:</Title>
        <ul>
          {result.boxes.map((box: Box, index: number) => (
            <li key={index}>
              <Text strong>{box.label}</Text> - 置信度: {box.confidence.toFixed(2)}
              <br />
              <Text type="secondary">位置: ({box.x1}, {box.y1}) 到 ({box.x2}, {box.y2})</Text>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default RecognitionResult;