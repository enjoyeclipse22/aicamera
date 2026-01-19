import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Popconfirm, Tag, Space, Modal, Image, message } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getHistory, deleteHistoryItem } from '../services/api';
import './History.css';

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  confidence: number;
}

interface HistoryItem {
  id: number;
  type: 'image' | 'video';
  prompt: string;
  file_path: string;
  result: string;
  timestamp: string;
}

interface ParsedHistoryItem extends Omit<HistoryItem, 'result'> {
  parsedResult: any;
}

interface HistoryProps {
  refreshTrigger: number;
}

const History: React.FC<HistoryProps> = ({ refreshTrigger }) => {
  const [history, setHistory] = useState<ParsedHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<ParsedHistoryItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // 加载历史记录
  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistory();
      if (data.success && data.history) {
        // 解析result字段
        const parsedHistory = data.history.map((item: HistoryItem) => ({
          ...item,
          parsedResult: JSON.parse(item.result)
        }));
        setHistory(parsedHistory);
      }
    } catch (error) {
      message.error('加载历史记录失败');
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载和刷新触发
  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  // 删除历史记录
  const handleDelete = async (id: number) => {
    try {
      const data = await deleteHistoryItem(id);
      if (data.success) {
        message.success('删除成功');
        loadHistory(); // 重新加载历史记录
      }
    } catch (error) {
      message.error('删除失败');
      console.error('删除历史记录失败:', error);
    }
  };

  // 查看历史记录详情
  const handleView = (item: ParsedHistoryItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // 关闭模态框
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  // 表格列配置
  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'image' ? 'blue' : 'green'}>
          {type === 'image' ? '照片' : '视频'}
        </Tag>
      )
    },
    {
      title: '提示词',
      dataIndex: 'prompt',
      key: 'prompt',
      ellipsis: true,
      width: 200
    },
    {
      title: '识别结果',
      dataIndex: 'parsedResult',
      key: 'result',
      render: (result: any, record: ParsedHistoryItem) => {
        if (record.type === 'image') {
          return (
            <span>
              识别到 {result.boxes?.length || 0} 个对象
            </span>
          );
        } else {
          return (
            <span>
              处理了 {result.results?.length || 0} 帧，平均每帧识别到 {result.results?.reduce((acc: number, frame: any) => acc + (frame.boxes?.length || 0), 0) / (result.results?.length || 1)} 个对象
            </span>
          );
        }
      }
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 200,
      render: (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: ParsedHistoryItem) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 渲染识别结果详情
  const renderResultDetails = (item: ParsedHistoryItem) => {
    if (item.type === 'image') {
      const result = item.parsedResult;
      return (
        <div className="history-detail">
          <div className="detail-image">
            {result.output_path ? (
              <Image
                src={`http://localhost:5000/output/${result.output_path.split(/[\/]/).pop()}?t=${Date.now()}`}
                alt="识别结果"
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            ) : (
              <Image
                src={`http://localhost:5000/uploads/${item.file_path.split(/[\\/]/).pop()}`}
                alt="原始图片"
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            )}
          </div>
          <div className="detail-info">
            <h4>识别结果</h4>
            {result.boxes?.map((box: Box, index: number) => (
              <div key={index} className="box-item">
                <span className="box-label">{box.label}</span>
                <span className="box-confidence">置信度: {(box.confidence * 100).toFixed(2)}%</span>
                <span className="box-coords">
                  坐标: ({box.x1}, {box.y1}) - ({box.x2}, {box.y2})
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      const result = item.parsedResult;
      return (
        <div className="history-detail">
          <div className="detail-info">
            <h4>视频信息</h4>
            <p>文件路径: {item.file_path}</p>
            <p>帧率: {result.fps} fps</p>
            <p>分辨率: {result.width} x {result.height}</p>
            <p>处理帧数: {result.results?.length} 帧</p>
            <h4>识别统计</h4>
            {result.results?.map((frameResult: any, index: number) => (
              <div key={index} className="frame-result">
                <h5>帧 {frameResult.frame + 1}</h5>
                {frameResult.boxes?.map((box: Box, boxIndex: number) => (
                  <div key={boxIndex} className="box-item">
                    <span className="box-label">{box.label}</span>
                    <span className="box-confidence">置信度: {(box.confidence * 100).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="history-container">
      <Card title="识别历史记录" bordered={true}>
        <Table
          columns={columns}
          dataSource={history}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title={`识别详情 - ${selectedItem?.type === 'image' ? '照片' : '视频'}`}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {selectedItem && (
          <div>
            <h3>提示词: {selectedItem.prompt}</h3>
            <p>识别时间: {new Date(selectedItem.timestamp).toLocaleString()}</p>
            <div className="result-divider"></div>
            {renderResultDetails(selectedItem)}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default History;