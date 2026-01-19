# AI Camera 应用

AI Camera 是一个基于深度学习的图像和视频识别应用，支持实时识别、历史记录管理和自定义提示词功能。

## 功能特性

### 图像识别
- 支持上传单张图片进行识别
- 可自定义识别提示词
- 自动绘制边界框显示识别结果
- 显示识别对象的置信度和坐标信息

### 视频识别
- 支持上传视频文件进行识别
- 处理视频的前10帧
- 逐帧显示识别结果
- 支持帧选择查看

### 历史记录管理
- 自动保存所有识别记录
- 支持查看历史识别结果
- 支持删除历史记录
- 按时间顺序显示

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Ant Design
- Axios

### 后端
- Python 3.9+
- Flask
- Qwen VL 模型 (通过 dashscope SDK)
- SQLite 数据库

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/enjoyeclipse22/aicamera.git
cd aicamera
```

### 2. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 3. 配置API Key

在 `backend/aidetect.py` 文件中配置您的 dashscope API Key：

```python
self.api_key = "your_api_key"  # 替换为您的API Key
```

您可以从 [Bailian Console](https://bailian.console.aliyun.com) 获取API Key。

### 4. 安装前端依赖

```bash
cd ../frontend
npm install
```

## 使用说明

### 1. 启动后端服务

```bash
cd backend
python app.py
```

后端服务将在 `http://localhost:5000` 启动。

### 2. 启动前端开发服务器

```bash
cd ../frontend
npm run dev
```

前端应用将在 `http://localhost:3000` 启动。

### 3. 访问应用

在浏览器中打开 `http://localhost:3000`，即可使用AI Camera应用。

### 4. 图像识别使用

1. 点击或拖拽图片到上传区域
2. 输入识别提示词（例如："识别图片中的猫"）
3. 点击"开始识别"按钮
4. 等待识别完成，查看识别结果

### 5. 视频识别使用

1. 点击或拖拽视频到上传区域
2. 输入识别提示词
3. 点击"开始识别"按钮
4. 等待识别完成，查看视频帧的识别结果
5. 使用滑块切换不同帧查看识别结果

## API接口文档

### 1. 图像识别接口

- URL: `/api/recognize/image`
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - `image`: 上传的图像文件
  - `prompt`: 识别提示词

- Response:
  ```json
  {
    "success": true,
    "result": {
      "boxes": [
        {
          "x1": 153,
          "y1": 221,
          "x2": 754,
          "y2": 765,
          "confidence": 0.9,
          "label": "椅子"
        }
      ],
      "image_path": "uploads/upload.jpg",
      "prompt": "椅子",
      "output_path": "output/result_upload.jpg"
    }
  }
  ```

### 2. 视频识别接口

- URL: `/api/recognize/video`
- Method: POST
- Content-Type: multipart/form-data
- Parameters:
  - `video`: 上传的视频文件
  - `prompt`: 识别提示词

- Response:
  ```json
  {
    "success": true,
    "result": {
      "video_path": "uploads/upload.mp4",
      "prompt": "猫",
      "fps": 30.0,
      "width": 1280,
      "height": 720,
      "results": [
        {
          "frame": 0,
          "boxes": [
            {
              "x1": 100,
              "y1": 100,
              "x2": 300,
              "y2": 300,
              "confidence": 0.9,
              "label": "猫"
            }
          ]
        }
      ]
    }
  }
  ```

### 3. 获取历史记录接口

- URL: `/api/history`
- Method: GET

- Response:
  ```json
  {
    "success": true,
    "history": [
      {
        "id": 1,
        "type": "image",
        "prompt": "椅子",
        "file_path": "uploads/upload.jpg",
        "result": "{\"boxes\": [...], ...}",
        "timestamp": "2026-01-20 10:00:00"
      }
    ]
  }
  ```

### 4. 删除历史记录接口

- URL: `/api/history/{id}`
- Method: DELETE

- Response:
  ```json
  {
    "success": true,
    "message": "Item deleted successfully"
  }
  ```

## 项目结构

```
aicamera/
├── backend/                  # 后端代码
│   ├── aidetect.py           # AI检测模型
│   ├── app.py                # Flask应用入口
│   ├── routes/               # API路由
│   │   └── __init__.py       # 路由定义
│   ├── requirements.txt      # 后端依赖
│   └── uploads/              # 上传文件目录
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── components/       # React组件
│   │   │   ├── History.tsx   # 历史记录组件
│   │   │   ├── ImageRecognition.tsx  # 图像识别组件
│   │   │   ├── RecognitionResult.tsx # 识别结果组件
│   │   │   └── VideoRecognition.tsx  # 视频识别组件
│   │   ├── services/         # 服务层
│   │   │   └── api.ts        # API服务
│   │   ├── types/            # TypeScript类型定义
│   │   ├── App.tsx           # 主应用组件
│   │   ├── main.tsx          # 应用入口
│   │   └── index.css         # 全局样式
│   ├── package.json          # 前端依赖
│   ├── tsconfig.json         # TypeScript配置
│   └── vite.config.ts        # Vite配置
└── README.md                 # 项目文档
```

## 配置说明

### 后端配置

在 `backend/app.py` 中可以配置以下参数：

- `UPLOAD_FOLDER`: 上传文件保存目录
- `OUTPUT_FOLDER`: 识别结果保存目录
- `MAX_CONTENT_LENGTH`: 最大上传文件大小

### 前端配置

在 `frontend/src/services/api.ts` 中可以配置API基础URL：

```typescript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',  // 后端API基础URL
  timeout: 60000, // 1分钟超时
});
```

## 开发说明

### 前端开发

- 运行开发服务器：`npm run dev`
- 构建生产版本：`npm run build`
- 运行TypeScript检查：`npm run tsc`

### 后端开发

- 运行开发服务器：`python app.py`
- 后端支持热重载，修改代码后会自动重启

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 致谢

- [Qwen VL](https://github.com/QwenLM/Qwen-VL) - 用于图像和视频识别的大语言模型
- [Ant Design](https://ant.design/) - 优秀的React UI组件库
- [Flask](https://flask.palletsprojects.com/) - 轻量级的Python Web框架
