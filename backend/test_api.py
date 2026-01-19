import requests
import os

# API端点
url = 'http://localhost:5000/api/recognize/image'

# 测试图片路径
test_image_path = 'D:\\aicamera\\backend\\test.jpg'

# 检查图片是否存在
if not os.path.exists(test_image_path):
    print(f"Test image not found: {test_image_path}")
    exit(1)

# 构建请求数据
files = {
    'image': open(test_image_path, 'rb')
}
data = {
    'prompt': '椅子'
}

# 发送请求
try:
    print(f"Sending request to {url} with image {test_image_path}")
    response = requests.post(url, files=files, data=data)
    print(f"Response status code: {response.status_code}")
    print(f"Response content: {response.text}")
except Exception as e:
    print(f"Error sending request: {str(e)}")