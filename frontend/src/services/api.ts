import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 60000, // 1分钟超时
});

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API response:', response);
    return response.data;
  },
  (error) => {
    console.error('API请求错误:', error);
    console.error('Error config:', error.config);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
);

// API响应类型定义
interface ApiResponse<T = any> {
  success: boolean;
  result?: T;
  history?: any[];
  item?: any;
  error?: string;
}

// API接口
export const recognizeImage = (formData: FormData): Promise<ApiResponse> => {
  return api.post('/recognize/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const recognizeVideo = (formData: FormData): Promise<ApiResponse> => {
  return api.post('/recognize/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getHistory = (): Promise<ApiResponse> => {
  return api.get('/history');
};

export const getHistoryItem = (id: number): Promise<ApiResponse> => {
  return api.get(`/history/${id}`);
};

export const deleteHistoryItem = (id: number): Promise<ApiResponse> => {
  return api.delete(`/history/${id}`);
};