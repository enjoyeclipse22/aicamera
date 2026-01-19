from flask import request, jsonify, g
from app import app
import os
import sqlite3
import json
from aidetect import AiDetectModel

# 获取数据库连接
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row
    return g.db

# 关闭数据库连接
@app.teardown_appcontext
def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

# 初始化AiDetect模型
detect_model = AiDetectModel()

# 单照片识别
@app.route('/api/recognize/image', methods=['POST'])
def recognize_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    image_file = request.files['image']
    prompt = request.form.get('prompt', '')
    
    # 保存图片
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_file.filename)
    image_file.save(image_path)
    
    # 调用AiDetect模型进行识别
    result = detect_model.recognize(image_path, prompt)
    
    # 保存到数据库
    db = get_db()
    db.execute(
        'INSERT INTO recognition_history (type, prompt, file_path, result) VALUES (?, ?, ?, ?)',
        ('image', prompt, image_path, json.dumps(result))
    )
    db.commit()
    
    return jsonify({'success': True, 'result': result})

# 视频识别
@app.route('/api/recognize/video', methods=['POST'])
def recognize_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    video_file = request.files['video']
    prompt = request.form.get('prompt', '')
    
    # 保存视频
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], video_file.filename)
    video_file.save(video_path)
    
    # 调用AiDetect模型进行视频识别
    result = detect_model.recognize_video(video_path, prompt)
    
    # 保存到数据库
    db = get_db()
    db.execute(
        'INSERT INTO recognition_history (type, prompt, file_path, result) VALUES (?, ?, ?, ?)',
        ('video', prompt, video_path, json.dumps(result))
    )
    db.commit()
    
    return jsonify({'success': True, 'result': result})

# 获取历史记录
@app.route('/api/history', methods=['GET'])
def get_history():
    db = get_db()
    history = db.execute('SELECT * FROM recognition_history ORDER BY timestamp DESC').fetchall()
    
    return jsonify({'success': True, 'history': [dict(row) for row in history]})

# 获取单条历史记录
@app.route('/api/history/<int:id>', methods=['GET'])
def get_history_item(id):
    db = get_db()
    item = db.execute('SELECT * FROM recognition_history WHERE id = ?', (id,)).fetchone()
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    return jsonify({'success': True, 'item': dict(item)})

# 删除历史记录
@app.route('/api/history/<int:id>', methods=['DELETE'])
def delete_history_item(id):
    db = get_db()
    # 先获取文件路径
    item = db.execute('SELECT file_path FROM recognition_history WHERE id = ?', (id,)).fetchone()
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    # 删除文件
    try:
        os.remove(item['file_path'])
    except:
        pass
    
    # 删除数据库记录
    db.execute('DELETE FROM recognition_history WHERE id = ?', (id,))
    db.commit()
    
    return jsonify({'success': True, 'message': 'Item deleted successfully'})