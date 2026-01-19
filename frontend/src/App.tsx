import { useState } from 'react';
import { Layout, Menu, Tabs, Card, Typography, ConfigProvider } from 'antd';
import { CameraOutlined, VideoCameraOutlined, HistoryOutlined } from '@ant-design/icons';
import './App.css';
import ImageRecognition from './components/ImageRecognition';
import VideoRecognition from './components/VideoRecognition';
import History from './components/History';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  const [activeTab, setActiveTab] = useState('image');
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const refreshHistory = () => {
    setHistoryRefresh(prev => prev + 1);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <Layout className="app-layout">
        <Header className="app-header">
          <div className="logo">
            <Title level={3} style={{ color: 'white', margin: 0 }}>AI Camera</Title>
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[activeTab]}
            style={{ flex: 1, minWidth: 0 }}
            onClick={({ key }) => setActiveTab(key)}
          >
            <Menu.Item key="image" icon={<CameraOutlined />}>
              照片识别
            </Menu.Item>
            <Menu.Item key="video" icon={<VideoCameraOutlined />}>
              视频识别
            </Menu.Item>
            <Menu.Item key="history" icon={<HistoryOutlined />}>
              历史记录
            </Menu.Item>
          </Menu>
        </Header>
        <Content className="app-content">
          <div className="app-container">
            <Card className="main-card">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: 'image',
                    label: '照片识别',
                    children: <ImageRecognition onRecognizeComplete={refreshHistory} />,
                  },
                  {
                    key: 'video',
                    label: '视频识别',
                    children: <VideoRecognition onRecognizeComplete={refreshHistory} />,
                  },
                  {
                    key: 'history',
                    label: '历史记录',
                    children: <History refreshTrigger={historyRefresh} />,
                  },
                ]}
              />
            </Card>
          </div>
        </Content>
        <Footer className="app-footer">
          AI Camera ©2026 Created with React + Flask + SAM3
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App;