import requests
import os

# 测试视频识别接口
def test_video_recognition():
    print("测试视频识别接口...")
    
    # API地址
    url = "http://localhost:5000/api/recognize/video"
    
    # 测试文件
    video_path = "test.mp4"
    prompt = "椅子"
    
    # 检查文件是否存在
    if not os.path.exists(video_path):
        print(f"测试失败：文件 {video_path} 不存在")
        return
    
    # 构建请求数据
    files = {
        'video': (os.path.basename(video_path), open(video_path, 'rb'), 'video/mp4')
    }
    data = {
        'prompt': prompt
    }
    
    try:
        # 发送请求
        response = requests.post(url, files=files, data=data)
        
        # 打印结果
        print(f"测试结果：{'成功' if response.status_code == 200 else '失败'}")
        print(f"状态码：{response.status_code}")
        print(f"响应内容：{response.text}")
        
        if response.status_code == 200:
            print("\n视频识别接口测试成功！")
        else:
            print(f"\n视频识别接口测试失败，状态码：{response.status_code}")
            print(f"错误信息：{response.text}")
    except Exception as e:
        print(f"测试失败，发生异常：{str(e)}")
    finally:
        # 关闭文件
        for file_tuple in files.values():
            file_tuple[1].close()

# 测试图片识别接口
def test_image_recognition():
    print("\n测试图片识别接口...")
    
    # API地址
    url = "http://localhost:5000/api/recognize/image"
    
    # 测试文件
    image_path = "test.jpg"
    prompt = "椅子"
    
    # 检查文件是否存在
    if not os.path.exists(image_path):
        print(f"测试失败：文件 {image_path} 不存在")
        return
    
    # 构建请求数据
    files = {
        'image': (os.path.basename(image_path), open(image_path, 'rb'), 'image/jpeg')
    }
    data = {
        'prompt': prompt
    }
    
    try:
        # 发送请求
        response = requests.post(url, files=files, data=data)
        
        # 打印结果
        print(f"测试结果：{'成功' if response.status_code == 200 else '失败'}")
        print(f"状态码：{response.status_code}")
        print(f"响应内容：{response.text}")
        
        if response.status_code == 200:
            print("\n图片识别接口测试成功！")
        else:
            print(f"\n图片识别接口测试失败，状态码：{response.status_code}")
            print(f"错误信息：{response.text}")
    except Exception as e:
        print(f"测试失败，发生异常：{str(e)}")
    finally:
        # 关闭文件
        for file_tuple in files.values():
            file_tuple[1].close()

# 测试历史记录接口
def test_history():
    print("\n测试历史记录接口...")
    
    # API地址
    url = "http://localhost:5000/api/history"
    
    try:
        # 发送请求
        response = requests.get(url)
        
        # 打印结果
        print(f"测试结果：{'成功' if response.status_code == 200 else '失败'}")
        print(f"状态码：{response.status_code}")
        print(f"响应内容：{response.text}")
        
        if response.status_code == 200:
            print("\n历史记录接口测试成功！")
        else:
            print(f"\n历史记录接口测试失败，状态码：{response.status_code}")
            print(f"错误信息：{response.text}")
    except Exception as e:
        print(f"测试失败，发生异常：{str(e)}")

# 主函数
if __name__ == "__main__":
    print("开始测试AI相机接口...")
    
    # 测试所有接口
    test_history()
    test_image_recognition()
    test_video_recognition()
    
    print("\n所有接口测试完成！")
