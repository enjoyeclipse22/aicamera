import torch
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2
import os
import base64
import json
import dashscope

class AiDetectModel:
    def __init__(self):
        # 初始化千问模型
        print("Initializing AiDetect Model with Qwen API...")
        
        # 确保输出目录存在
        self.output_dir = "output"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # 千问API配置
        self.api_key = "sk-9be7351622fb49338d4399e7c19893a3"  # 用户提供的API Key
        
        # 配置dashscope SDK
        dashscope.base_http_api_url = "https://dashscope.aliyuncs.com/api/v1"
        
        # 验证API配置
        self.validate_api_config()
        
        print("AiDetect Model initialized successfully")
    
    def validate_api_config(self):
        # 验证API配置
        if not self.api_key or self.api_key == "your_api_key":
            print("Warning: API Key is not configured")
            print("Please set your_api_key in the code")
            print("You can get it from https://bailian.console.aliyun.com")
        else:
            print("API Key configured successfully")
    
    def recognize(self, image_path, prompt):
        # 图像识别
        print(f"Recognizing image: {image_path} with prompt: {prompt}")
        
        # 读取图像
        image = Image.open(image_path).convert("RGB")
        image_np = np.array(image)
        
        boxes = []
        api_result = None
        error_log = None
        
        # 调用千问API
        try:
            api_result = self.call_qwen_api(image_path, prompt)
            # 解析API结果
            boxes = self.parse_api_result(api_result, image.size)
            
            # 确保每个box都有label字段
            for i, box in enumerate(boxes):
                if "label" not in box:
                    boxes[i]["label"] = prompt
                    print(f"Added label '{prompt}' to box {i}")
                    
            print(f"Final boxes: {boxes}")
        except Exception as e:
            error_log = f"Error in API call: {str(e)}"
            print(error_log)
        
        # 保存图像（如果没有识别到框，直接保存原图像）
        output_path = os.path.join(self.output_dir, f"result_{os.path.basename(image_path)}")
        if boxes:
            # 绘制边界框
            result_image = self.draw_boxes(image, boxes, prompt)
            result_image.save(output_path)
        else:
            # 直接保存原图像
            image.save(output_path)
        print(f"Result image saved to: {output_path}")
        
        # 构建结果
        result = {
            "boxes": boxes,
            "image_path": image_path,
            "prompt": prompt,
            "output_path": output_path,
            "api_result": api_result,
            "error_log": error_log
        }
        
        return result
    
    def call_qwen_api(self, image_path, prompt):
        # 调用千问API进行图像识别
        print("Calling Qwen API...")
        
        # 读取图像并转换为base64，添加正确的前缀
        with open(image_path, "rb") as f:
            image_data = f.read()
        image_base64 = base64.b64encode(image_data).decode("utf-8")
        image_url = f"data:image/jpeg;base64,{image_base64}"
        
        # 优化提示词，结合用户输入，要求返回指定格式的JSON
        user_prompt = f"请识别图片中与'{prompt}'相关的所有物体，并以JSON格式返回检测结果，格式要求：\n{{\n  \"detections\": [\n    {{\n      \"label\": \"物体类别\",\n      \"bbox\": [x1, y1, x2, y2],\n      \"description\": \"物体描述\"\n    }}...\n  ],\n  \"note\": \"备注信息\"\n}}\n其中bbox为物体的边界框坐标，格式为[x1, y1, x2, y2]，x1,y1为左上角坐标，x2,y2为右下角坐标。"        
        
        # 构建messages，参考示例代码
        messages = [
            {
                "role": "user",
                "content": [
                    {"image": image_url},
                    {"text": user_prompt}
                ]
            }
        ]
        
        # 使用dashscope库调用API
        response = dashscope.MultiModalConversation.call(
            api_key=self.api_key,
            model='qwen3-vl-plus',  # 使用示例代码中的模型名称
            messages=messages,
            result_format='json'
        )
        
        print(f"API Response: {response}")
        
        # 检查API调用是否成功
        if not hasattr(response, 'output') or not hasattr(response.output, 'choices'):
            raise Exception(f"Invalid API response: {response}")
        
        # 转换为与原有代码兼容的格式
        result = {
            "output": {
                "choices": []
            }
        }
        
        for choice in response.output.choices:
            result["output"]["choices"].append({
                "message": {
                    "content": choice.message.content
                }
            })
        
        print("API call successful")
        return result
    
    def parse_api_result(self, api_result, image_size):
        # 解析API结果
        print("Parsing API result...")
        
        try:
            # 提取API响应内容
            if "output" in api_result and "choices" in api_result["output"]:
                content = api_result["output"]["choices"][0]["message"]["content"]
                
                # 处理content可能是列表的情况
                if isinstance(content, list):
                    # 提取列表中的text内容
                    json_str = None
                    for item in content:
                        if isinstance(item, dict) and "text" in item:
                            json_str = item["text"]
                            break
                    if not json_str:
                        print("No text content found in API response")
                        return []
                    content = json_str
                
                print(f"Raw content: {content}")
                
                # 确保content是字符串类型
                if not isinstance(content, str):
                    print(f"Unexpected content type: {type(content)}")
                    return []
                
                # 解析JSON
                result_data = json.loads(content)
                
                # 解析边界框
                boxes = []
                if "detections" in result_data:
                    for i, obj in enumerate(result_data["detections"]):
                        if isinstance(obj, dict) and "bbox" in obj:
                            bbox = obj["bbox"]
                            # 确保返回的对象包含label字段
                            boxes.append({
                                "x1": int(bbox[0]),
                                "y1": int(bbox[1]),
                                "x2": int(bbox[2]),
                                "y2": int(bbox[3]),
                                "confidence": 0.9,  # API返回中没有置信度，使用默认值
                                "label": obj.get("label", "物体")  # 使用"物体"作为默认label
                            })
                elif "objects" in result_data:
                    # 兼容旧格式
                    for i, obj in enumerate(result_data["objects"]):
                        if isinstance(obj, dict):
                            if "box" in obj:
                                box = obj["box"]
                                boxes.append({
                                    "x1": int(box[0]),
                                    "y1": int(box[1]),
                                    "x2": int(box[2]),
                                    "y2": int(box[3]),
                                    "confidence": obj.get("confidence", 0.9),
                                    "label": obj.get("label", f"Object {i+1}")
                                })
                            elif all(key in obj for key in ["x1", "y1", "x2", "y2"]):
                                # 完整坐标字段
                                boxes.append({
                                    "x1": int(obj["x1"]),
                                    "y1": int(obj["y1"]),
                                    "x2": int(obj["x2"]),
                                    "y2": int(obj["y2"]),
                                    "confidence": obj.get("confidence", 0.9),
                                    "label": obj.get("label", f"Object {i+1}")
                                })
                        elif isinstance(obj, list) and len(obj) == 4:
                            # 直接坐标格式
                            boxes.append({
                                "x1": int(obj[0]),
                                "y1": int(obj[1]),
                                "x2": int(obj[2]),
                                "y2": int(obj[3]),
                                "confidence": 0.9,
                                "label": f"Object {i+1}"
                            })
                
                print(f"Parsed {len(boxes)} bounding boxes")
                return boxes
            else:
                print("Unexpected API result format")
                return []
        except Exception as e:
            print(f"Error parsing API result: {str(e)}")
            print(f"Raw result: {api_result}")
            import traceback
            traceback.print_exc()
            return []
    
    def draw_boxes(self, image, boxes, prompt):
        # 在图像上绘制边界框
        draw = ImageDraw.Draw(image)
        
        # 尝试加载字体，失败则使用默认字体
        try:
            font = ImageFont.truetype("arial.ttf", 16)
        except:
            font = ImageFont.load_default()
        
        # 绘制每个边界框
        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = box["x1"], box["y1"], box["x2"], box["y2"]
            confidence = box["confidence"]
            label = box["label"]
            
            # 绘制矩形
            draw.rectangle([x1, y1, x2, y2], outline="red", width=3)
            
            # 绘制标签
            text = f"{label} ({confidence:.2f})"
            text_bbox = draw.textbbox((x1, y1 - 25), text, font=font)
            draw.rectangle(text_bbox, fill="red")
            draw.text((x1, y1 - 25), text, fill="white", font=font)
        
        return image
    
    def recognize_video(self, video_path, prompt):
        # 视频识别
        print(f"Recognizing video: {video_path} with prompt: {prompt}")
        
        # 读取视频
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {"error": "Could not open video"}
        
        # 获取视频信息
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # 处理视频帧
        frame_count = 0
        results = []
        
        while frame_count < 10:  # 只处理前10帧
            ret, frame = cap.read()
            if not ret:
                break
            
            # 临时保存帧
            temp_frame_path = f"temp_frame_{frame_count}.jpg"
            cv2.imwrite(temp_frame_path, frame)
            
            # 调用图像识别
            frame_result = self.recognize(temp_frame_path, prompt)
            
            # 添加帧信息
            frame_result["frame"] = frame_count
            results.append(frame_result)
            
            # 删除临时文件
            os.remove(temp_frame_path)
            
            frame_count += 1
        
        cap.release()
        
        return {
            "video_path": video_path,
            "prompt": prompt,
            "fps": fps,
            "width": width,
            "height": height,
            "results": results
        }

# 单元测试
if __name__ == "__main__":
    print("Running AiDetect Model unit tests...")
    
    # 初始化模型
    model = AiDetectModel()
    
    # 测试图片路径
    test_images = [
        "test.jpg",
        "chair.jpg"
    ]
    
    # 测试提示词
    test_prompt = "椅子"
    
    # 运行测试
    for image_path in test_images:
        if os.path.exists(image_path):
            print(f"\n--- Testing {image_path} ---")
            result = model.recognize(image_path, test_prompt)
            print(f"Recognition result:")
            print(f"  - Image: {result['image_path']}")
            print(f"  - Prompt: {result['prompt']}")
            print(f"  - Output: {result['output_path']}")
            print(f"  - Boxes: {len(result['boxes'])} detected")
            for i, box in enumerate(result['boxes']):
                print(f"    Box {i+1}: {box['x1']}, {box['y1']}, {box['x2']}, {box['y2']} (confidence: {box['confidence']:.2f}, label: {box['label']})")
        else:
            print(f"\n--- Skipping {image_path}: File not found ---")
    
    print("\n--- All tests completed ---")