# AI相机应用实现计划

## 项目架构

### 前端
- **技术栈**：React + TypeScript + Vite
- **UI框架**：Ant Design (简洁明快风格)
- **功能模块**：
  - 照片上传与识别
  - 视频上传与识别
  - 提示词输入
  - 识别结果展示（带框）
  - 历史记录管理

### 后端
- **技术栈**：Python + Flask
- **功能模块**：
  - Flask API服务
  - SAM3模型集成与推理
  - 历史记录数据库
  - 文件存储管理

### 数据库
- **选型**：SQLite（轻量级，适合原型开发）
- **表结构**：
  - 识别历史记录表（id, type, prompt, image_path, result, timestamp）

## 实现步骤

### 1. 项目初始化
- 创建前端React项目
- 创建后端Flask项目
- 配置开发环境

### 2. 后端实现
- 安装必要依赖（Flask, PyTorch, SAM3模型等）
- 实现SAM3模型推理功能
- 设计并实现API接口：
  - `/api/recognize/image` - 单照片识别
  - `/api/recognize/video` - 视频识别
  - `/api/history` - 获取历史记录
  - `/api/history/:id` - 获取单条历史记录
  - `/api/history/:id` - 删除历史记录
- 实现数据库操作
- 实现文件存储管理

### 3. 前端实现
- 安装必要依赖（Ant Design, Axios等）
- 设计整体布局和导航
- 实现照片上传与识别组件
- 实现视频上传与识别组件
- 实现提示词输入组件
- 实现识别结果展示组件（带框）
- 实现历史记录管理组件
- 实现API调用服务

### 4. 集成与测试
- 前后端联调
- 模型推理测试
- 功能完整性测试
- 性能优化

## API接口设计

### 1. 单照片识别
- **URL**：`/api/recognize/image`
- **方法**：POST
- **请求体**：`multipart/form-data`，包含image文件和prompt参数
- **响应**：JSON格式，包含识别结果（边界框坐标、类别等）

### 2. 视频识别
- **URL**：`/api/recognize/video`
- **方法**：POST
- **请求体**：`multipart/form-data`，包含video文件和prompt参数
- **响应**：JSON格式，包含处理状态和结果URL

### 3. 历史记录
- **URL**：`/api/history`
- **方法**：GET
- **响应**：JSON格式，包含所有历史记录

### 4. 历史记录详情
- **URL**：`/api/history/:id`
- **方法**：GET
- **响应**：JSON格式，包含单条历史记录详情

### 5. 删除历史记录
- **URL**：`/api/history/:id`
- **方法**：DELETE
- **响应**：JSON格式，包含删除结果

## 技术要点

1. **SAM3模型集成**：
   - 使用PyTorch加载预训练SAM3模型
   - 实现图像预处理和后处理
   - 处理模型推理的性能优化

2. **前端结果展示**：
   - 使用Canvas或SVG绘制边界框
   - 实现实时预览功能
   - 支持结果缩放和查看

3. **视频处理**：
   - 实现视频帧提取
   - 批量处理视频帧
   - 生成处理后的视频文件

4. **历史记录管理**：
   - 实现分页查询
   - 支持按类型和时间筛选
   - 实现结果导出功能

## 项目结构

```
aicamera/
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── services/      # API服务
│   │   ├── types/         # TypeScript类型定义
│   │   └── App.tsx        # 主应用组件
│   ├── package.json
│   └── vite.config.ts
├── backend/               # 后端项目
│   ├── app.py             # Flask主应用
│   ├── models/            # SAM3模型封装
│   ├── routes/            # API路由
│   ├── utils/             # 工具函数
│   ├── database.py        # 数据库操作
│   └── requirements.txt
└── README.md
```