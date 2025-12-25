"""
动物识别专家系统 - Flask 后端
基于产生式系统的正向推理和反向推理引擎
"""

from flask import Flask, request, jsonify, render_template
import json
import os

app = Flask(__name__)

# 规则库文件路径
RULES_FILE = os.path.join(os.path.dirname(__file__), 'rules.json')

# ==================== 数据读写 ====================

def load_rules():
    """从 JSON 文件加载规则库"""
    with open(RULES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_rules(data):
    """保存规则库到 JSON 文件"""
    with open(RULES_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ==================== 正向推理引擎 ====================

def forward_reasoning(initial_facts):
    """
    正向推理（自底向上）
    从已知事实出发，逐步推导出结论
    
    参数:
        initial_facts: 初始事实列表（用户选择的特征）
    
    返回:
        dict: 包含 success, animal, log, facts
    """
    data = load_rules()
    rules = data['rules']
    animals = data['animals']
    
    facts = set(initial_facts)
    process_log = []
    triggered_rules = set()  # 已触发的规则，避免重复
    
    iteration = 0
    max_iterations = 100  # 防止死循环
    
    while iteration < max_iterations:
        iteration += 1
        rule_triggered = False
        
        for rule in rules:
            rule_id = rule['id']
            conditions = set(rule['conditions'])
            conclusion = rule['conclusion']
            
            # 检查：前提满足 + 结论未在事实库 + 规则未触发过
            if (conditions.issubset(facts) and 
                conclusion not in facts and 
                rule_id not in triggered_rules):
                
                # 触发规则
                facts.add(conclusion)
                triggered_rules.add(rule_id)
                
                process_log.append({
                    'rule_id': rule_id,
                    'conditions': list(conditions),
                    'conclusion': conclusion,
                    'description': rule.get('description', '')
                })
                
                rule_triggered = True
                
                # 检查是否得出最终动物
                if conclusion in animals:
                    return {
                        'success': True,
                        'animal': conclusion,
                        'log': process_log,
                        'facts': list(facts)
                    }
                
                break  # 触发一条后重新扫描（冲突消解策略）
        
        if not rule_triggered:
            break  # 没有新规则被触发，推理结束
    
    # 未能识别出具体动物
    return {
        'success': False,
        'animal': None,
        'log': process_log,
        'facts': list(facts),
        'message': '无法识别具体动物，可能特征不足'
    }

# ==================== 反向推理引擎 ====================

class BackwardReasoner:
    """反向推理器（自顶向下）"""
    
    def __init__(self):
        self.data = load_rules()
        self.rules = self.data['rules']
        self.animals = self.data['animals']
        self.intermediates = self.data['intermediates']
        self.features = self.data['features']
        self.known_facts = set()
        self.denied_facts = set()
        self.log = []
        self.current_goal = None
        # 目标栈：每个元素是 {'rule': rule, 'condition_index': int, 'pending_condition': str}
        self.goal_stack = []
        self.current_question = None  # 当前正在询问的条件
    
    def start(self, target_animal):
        """开始反向推理"""
        self.current_goal = target_animal
        self.known_facts = set()
        self.denied_facts = set()
        self.log = []
        self.goal_stack = []
        self.current_question = None
        
        # 找到目标动物对应的规则
        rule = self._find_rule_for_conclusion(target_animal)
        if not rule:
            return {
                'status': 'error',
                'message': f'找不到识别 {target_animal} 的规则'
            }
        
        # 将目标规则压入栈
        self.goal_stack.append({
            'rule': rule,
            'condition_index': 0
        })
        
        # 开始验证
        return self._process_next()
    
    def answer(self, response):
        """处理用户回答"""
        if not self.current_question:
            return {'status': 'error', 'message': '没有待回答的问题'}
        
        condition = self.current_question
        
        if response == 'yes':
            self.known_facts.add(condition)
            self.log.append(f'✓ 确认: {condition}')
            self.current_question = None
            return self._process_next()
            
        elif response == 'no':
            self.denied_facts.add(condition)
            self.log.append(f'✗ 否认: {condition}')
            self.current_question = None
            return {
                'status': 'failed',
                'message': f'因为不满足条件 "{condition}"，无法确认是 {self.current_goal}',
                'log': self.log
            }
            
        elif response == 'unknown':
            # 尝试通过其他规则推导这个条件
            if condition in self.intermediates:
                rule = self._find_rule_for_conclusion(condition)
                if rule:
                    self.log.append(f'? 不确定 "{condition}"，尝试推导...')
                    # 将子规则压入栈
                    self.goal_stack.append({
                        'rule': rule,
                        'condition_index': 0
                    })
                    self.current_question = None
                    return self._process_next()
            # 无法推导
            self.denied_facts.add(condition)
            self.current_question = None
            return {
                'status': 'failed',
                'message': f'无法确认条件 "{condition}"',
                'log': self.log
            }
        
        return {'status': 'error', 'message': '无效的回答'}
    
    def _find_rule_for_conclusion(self, conclusion):
        """找到结论为指定值的规则"""
        for rule in self.rules:
            if rule['conclusion'] == conclusion:
                return rule
        return None
    
    def _process_next(self):
        """处理下一个验证步骤"""
        while self.goal_stack:
            current = self.goal_stack[-1]
            rule = current['rule']
            conditions = rule['conditions']
            
            # 检查当前规则的所有条件
            while current['condition_index'] < len(conditions):
                condition = conditions[current['condition_index']]
                
                if condition in self.known_facts:
                    # 条件已满足，检查下一个
                    current['condition_index'] += 1
                    continue
                    
                if condition in self.denied_facts:
                    # 条件被否认，规则失败
                    return {
                        'status': 'failed',
                        'message': f'条件 "{condition}" 已被否认，无法确认 {self.current_goal}',
                        'log': self.log
                    }
                
                # 需要询问这个条件
                self.current_question = condition
                current['condition_index'] += 1  # 移动到下一个，下次从这里继续
                
                is_intermediate = condition in self.intermediates
                
                return {
                    'status': 'asking',
                    'question': condition,
                    'is_intermediate': is_intermediate,
                    'hint': f'验证 "{self.current_goal}" 需要确认: {condition}',
                    'log': self.log
                }
            
            # 当前规则的所有条件都满足
            conclusion = rule['conclusion']
            self.known_facts.add(conclusion)
            self.log.append(f'✓ 推导出: {conclusion}')
            
            # 弹出已完成的规则
            self.goal_stack.pop()
            
            # 检查是否达成最终目标
            if conclusion == self.current_goal:
                return {
                    'status': 'success',
                    'message': f'✓ 确认! 该动物是 {self.current_goal}',
                    'animal': self.current_goal,
                    'log': self.log
                }
        
        # 栈空，检查是否达成目标
        if self.current_goal in self.known_facts:
            return {
                'status': 'success',
                'message': f'✓ 确认! 该动物是 {self.current_goal}',
                'animal': self.current_goal,
                'log': self.log
            }
        
        return {
            'status': 'failed',
            'message': f'验证过程结束，但无法确认 {self.current_goal}',
            'log': self.log
        }

# 存储反向推理会话
backward_sessions = {}

# ==================== API 路由 ====================

@app.route('/')
def index():
    """主页"""
    return render_template('index.html')

@app.route('/api/rules', methods=['GET'])
def get_rules():
    """获取所有规则"""
    data = load_rules()
    return jsonify(data)

@app.route('/api/rules', methods=['POST'])
def add_rule():
    """添加新规则"""
    data = load_rules()
    new_rule = request.json
    
    # 生成新的规则 ID
    existing_ids = [int(r['id'][1:]) for r in data['rules'] if r['id'].startswith('R')]
    new_id = f"R{max(existing_ids) + 1}" if existing_ids else "R1"
    
    new_rule['id'] = new_id
    if 'type' not in new_rule:
        # 根据结论判断类型
        if new_rule['conclusion'] in data['animals']:
            new_rule['type'] = 'final'
        else:
            new_rule['type'] = 'classification'
    
    data['rules'].append(new_rule)
    save_rules(data)
    
    return jsonify({'success': True, 'rule': new_rule})

@app.route('/api/rules/<rule_id>', methods=['PUT'])
def update_rule(rule_id):
    """修改规则"""
    data = load_rules()
    updated_rule = request.json
    
    for i, rule in enumerate(data['rules']):
        if rule['id'] == rule_id:
            updated_rule['id'] = rule_id
            data['rules'][i] = updated_rule
            save_rules(data)
            return jsonify({'success': True, 'rule': updated_rule})
    
    return jsonify({'success': False, 'message': '规则不存在'}), 404

@app.route('/api/rules/<rule_id>', methods=['DELETE'])
def delete_rule(rule_id):
    """删除规则"""
    data = load_rules()
    
    for i, rule in enumerate(data['rules']):
        if rule['id'] == rule_id:
            deleted = data['rules'].pop(i)
            save_rules(data)
            return jsonify({'success': True, 'deleted': deleted})
    
    return jsonify({'success': False, 'message': '规则不存在'}), 404

@app.route('/api/features', methods=['GET'])
def get_features():
    """获取所有特征"""
    data = load_rules()
    return jsonify({
        'features': data['features'],
        'categories': data.get('featureCategories', {})
    })

@app.route('/api/forward', methods=['POST'])
def forward():
    """正向推理"""
    req_data = request.json
    features = req_data.get('features', [])
    
    if not features:
        return jsonify({
            'success': False,
            'message': '请至少选择一个特征'
        })
    
    result = forward_reasoning(features)
    return jsonify(result)

@app.route('/api/backward/start', methods=['POST'])
def backward_start():
    """开始反向推理"""
    req_data = request.json
    target = req_data.get('target')
    session_id = req_data.get('session_id', 'default')
    
    data = load_rules()
    if target not in data['animals']:
        return jsonify({
            'status': 'error',
            'message': f'无效的目标动物: {target}'
        })
    
    # 创建新的推理器
    reasoner = BackwardReasoner()
    backward_sessions[session_id] = reasoner
    
    result = reasoner.start(target)
    return jsonify(result)

@app.route('/api/backward/answer', methods=['POST'])
def backward_answer():
    """回答反向推理问题"""
    req_data = request.json
    response = req_data.get('response')  # 'yes', 'no', 'unknown'
    session_id = req_data.get('session_id', 'default')
    
    if session_id not in backward_sessions:
        return jsonify({
            'status': 'error',
            'message': '会话不存在，请重新开始'
        })
    
    reasoner = backward_sessions[session_id]
    result = reasoner.answer(response)
    
    # 如果推理结束，清理会话
    if result['status'] in ['success', 'failed', 'error']:
        del backward_sessions[session_id]
    
    return jsonify(result)

@app.route('/api/animals', methods=['GET'])
def get_animals():
    """获取所有动物"""
    data = load_rules()
    return jsonify({
        'animals': data['animals'],
        'emojis': data.get('animalEmojis', {})
    })

# ==================== 主程序 ====================

if __name__ == '__main__':
    print("🦁 动物识别专家系统启动中...")
    print("📍 访问地址: http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
