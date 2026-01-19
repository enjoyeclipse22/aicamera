import torch
from segment_anything import SamPredictor, sam_model_registry
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import cv2
import os
import sys

class SAM3Model:
    def __init__(self):
        # 初始化SAM模型
        print("Initializing SAM3 model...")
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # 确保输出目录存在
        self.output_dir = "output"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # 加载SAM模型
        self.model = self.load_sam_model()
        self.predictor = SamPredictor(self.model)
        
        print("SAM3 model initialized successfully")
    
    def load_sam_model(self):
        # 加载SAM模型
        print("Loading SAM model...")
        
        # 模型配置
        model_type = "vit_h"
        sam_checkpoint = "sam_vit_h_4b8939.pth"
        
        # 检查模型文件是否存在
        if not os.path.exists(sam_checkpoint):
            print(f"SAM model checkpoint not found: {sam_checkpoint}")
            print("Please download the model from:")
            print("https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth")
            print("Or use a smaller model like sam_vit_b_01ec64.pth")
            print("Using lightweight fallback implementation")
            
            # 使用轻量级回退实现
            return self.load_fallback_model()
        
        # 加载SAM模型
        sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
        sam.to(device=self.device)
        return sam
    
    def load_fallback_model(self):
        # 轻量级回退实现
        print("Loading lightweight fallback model...")
        # 这里使用一个简单的模型结构作为回退
        class FallbackModel:
            def __init__(self):
                self.image_encoder = type('obj', (object,), {'img_size': 1024})
                self.prompt_encoder = type('obj', (object,), {})
                self.mask_decoder = type('obj', (object,), {})
        
        return FallbackModel()
    
    def recognize(self, image_path, prompt):
        # 图像识别
        print(f"Recognizing image: {image_path} with prompt: {prompt}")
        
        # 读取图像
        image = Image.open(image_path