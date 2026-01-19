import React, { useState } from 'react';
import { Upload, Button, Input, Card, Image, Divider, Spin, Alert, Row, Col } from 'antd';
import { UploadOutlined, CameraOutlined } from '@ant-design/icons';
import './ImageRecognition.css';

const { TextArea } = Input;

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  confidence: number;
}

interface RecognitionResult {
  boxes: Box[];
  image_path: string;
  prompt: string;
  output_path: string;
  error_log?: string;
}

interface ImageRecognitionProps {
  onRecognizeComplete?: () => void;
}

const ImageRecognition: React.FC<ImageRecognitionProps> = ({ onRecognizeComplete }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

  const handleRecognize = async () => {
    if (!imageUrl) {
      setError('请先上传图片');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting recognition process...');
      console.log('Image URL:', imageUrl);
      console.log('Prompt:', prompt);
      
      // 从DataURL获取Blob
      const response = await fetch(imageUrl);
      console.log('Blob fetch response:', response);
      const blob = await response.blob();
      console.log('Blob obtained:', blob);
      const file = new File([blob], 'upload.jpg', { type: 'image/jpeg' });
      console.log('File created:', file);
      
      // 构建FormData
      const formData = new FormData();
      formData.append('image', file);
      formData.append('prompt', prompt);
      console.log('FormData created:', formData);
      
      // 直接使用fetch API调用后端API
      console.log('Calling API with fetch...');
      const apiResponse = await fetch('http://localhost:5000/api/recognize/image', {
        method: 'POST',
        body: formData,
      });
      console.log('API response status:', apiResponse.status);
      console.log('API response headers:', apiResponse.headers);
      const data = await apiResponse.json();
      console.log('API response data:', data);
      
      if (data.success) {
        console.log('Recognition successful, result:', data.result);
        setResult(data.result);
        // 调用回调函数，刷新历史记录
        onRecognizeComplete?.();
      } else {
        console.log('Recognition failed, data:', data);
        setError('识别失败，请重试');
      }
    } catch (err: any) {
      console.error('Recognition error:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError(`识别过程中发生错误: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-recognition-container">
      <Row gutter={16}>
        <Col span={12}>
          <Card title="上传图片" bordered={true}>
            <div className="upload-section">
              <Upload
                listType="picture"
                accept="image/*"
                beforeUpload={handleImageUpload}
                fileList={[]}
                showUploadList={false}
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Uploaded"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                ) : (
                  <div className="upload-placeholder">
                    <CameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    <p>点击或拖拽图片到此处上传</p>
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
                placeholder="请输入识别提示词，例如：'识别图片中的猫'"
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
                <div className="result-image">
                  <Image
                    src={`http://localhost:5000/output/${result.output_path.split(/[\/]/).pop()}?t=${Date.now()}`}
                    alt="识别结果"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </div>
                
                {result.error_log && (
                  <div className="result-error">
                    <Alert message="识别警告" description={result.error_log} type="warning" showIcon />
                  </div>
                )}
                
                <Divider />
                
                <div className="result-boxes">
                  <h4>识别到的对象：</h4>
                  {result.boxes.length > 0 ? (
                    result.boxes.map((box, index) => {
                      // 安全检查：确保置信度存在且为数字
                      const confidence = typeof box.confidence === 'number' ? box.confidence : 0.0;
                      return (
                        <div key={index} className="box-item">
                          <span className="box-label">{box.label}</span>
                          <span className="box-confidence">置信度: {(confidence * 100).toFixed(2)}%</span>
                          <span className="box-coords">
                            坐标: ({box.x1}, {box.y1}) - ({box.x2}, {box.y2})
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: '#8c8c8c', textAlign: 'center' }}>未识别到对象</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-result">
                <p>请上传图片并点击开始识别</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ImageRecognition;