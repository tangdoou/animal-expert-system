/**
 * 动物识别专家系统 - 前端逻辑
 */

// ==================== 全局状态 ====================
let appData = {
    rules: [],
    features: [],
    featureCategories: {},
    animals: [],
    animalEmojis: {},
    currentTab: 'forward',
    backwardSessionId: null
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadData();
});

async function loadData() {
    try {
        // 加载所有数据
        const rulesResponse = await fetch('/api/rules');
        const rulesData = await rulesResponse.json();
        
        appData.rules = rulesData.rules;
        appData.features = rulesData.features;
        appData.featureCategories = rulesData.featureCategories || {};
        appData.animals = rulesData.animals;
        appData.animalEmojis = rulesData.animalEmojis || {};
        
        // 渲染各页面
        renderFeatures();
        renderAnimals();
        renderRules();
        renderAboutAnimals();
        
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}

// ==================== 标签页切换 ====================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    // 更新按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // 更新页面显示
    document.querySelectorAll('.page').forEach(page => {
        page.classList.toggle('active', page.id === `${tab}-page`);
    });
    
    appData.currentTab = tab;
}

// ==================== 正向推理 ====================
function renderFeatures() {
    const container = document.getElementById('features-list');
    container.innerHTML = '';
    
    // 按分类渲染特征
    for (const [category, features] of Object.entries(appData.featureCategories)) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'feature-category';
        
        categoryDiv.innerHTML = `
            <h4>${category}</h4>
            <div class="feature-items">
                ${features.map(feature => `
                    <input type="checkbox" id="feat-${feature}" class="feature-checkbox" value="${feature}">
                    <label for="feat-${feature}" class="feature-label">${feature}</label>
                `).join('')}
            </div>
        `;
        
        container.appendChild(categoryDiv);
    }
    
    // 绑定事件
    document.getElementById('clear-features').addEventListener('click', clearFeatures);
    document.getElementById('start-forward').addEventListener('click', startForwardReasoning);
}

function clearFeatures() {
    document.querySelectorAll('.feature-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('forward-result').innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">🤔</span>
            <p>请选择特征后点击"开始推理"</p>
        </div>
    `;
}

async function startForwardReasoning() {
    const selected = [];
    document.querySelectorAll('.feature-checkbox:checked').forEach(cb => {
        selected.push(cb.value);
    });
    
    if (selected.length === 0) {
        alert('请至少选择一个特征');
        return;
    }
    
    try {
        const response = await fetch('/api/forward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ features: selected })
        });
        
        const result = await response.json();
        renderForwardResult(result);
        
    } catch (error) {
        console.error('推理失败:', error);
    }
}

function renderForwardResult(result) {
    const container = document.getElementById('forward-result');
    
    if (result.success) {
        const emoji = appData.animalEmojis[result.animal] || '🐾';
        
        container.innerHTML = `
            <div class="result-animal">
                <div class="animal-emoji">${emoji}</div>
                <div class="animal-name">${result.animal}</div>
            </div>
            <div class="result-log">
                <h4>推理过程</h4>
                ${result.log.map((step, index) => `
                    <div class="log-step" style="animation-delay: ${index * 0.1}s">
                        <span class="rule-id">${step.rule_id}</span>
                        <span class="conditions">${step.conditions.join(' + ')}</span>
                        <span class="arrow">→</span>
                        <span class="conclusion">${step.conclusion}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">❓</span>
                <p>${result.message || '无法识别，请补充更多特征'}</p>
            </div>
            ${result.log && result.log.length > 0 ? `
                <div class="result-log">
                    <h4>已推导的中间结论</h4>
                    ${result.log.map((step, index) => `
                        <div class="log-step">
                            <span class="rule-id">${step.rule_id}</span>
                            <span class="conditions">${step.conditions.join(' + ')}</span>
                            <span class="arrow">→</span>
                            <span class="conclusion">${step.conclusion}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }
}

// ==================== 反向推理 ====================
function renderAnimals() {
    const container = document.getElementById('animals-grid');
    
    container.innerHTML = appData.animals.map(animal => {
        const emoji = appData.animalEmojis[animal] || '🐾';
        return `
            <div class="animal-card" data-animal="${animal}">
                <span class="animal-card-emoji">${emoji}</span>
                <span class="animal-card-name">${animal}</span>
            </div>
        `;
    }).join('');
    
    // 绑定点击事件
    container.querySelectorAll('.animal-card').forEach(card => {
        card.addEventListener('click', () => {
            // 清除其他选中状态
            container.querySelectorAll('.animal-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            startBackwardReasoning(card.dataset.animal);
        });
    });
}

async function startBackwardReasoning(animal) {
    const chatBox = document.getElementById('chat-box');
    const answerButtons = document.getElementById('answer-buttons');
    
    // 生成唯一会话ID
    appData.backwardSessionId = `session_${Date.now()}`;
    
    // 清空聊天记录
    chatBox.innerHTML = `
        <div class="chat-message system">
            🎯 开始验证目标动物: <strong>${animal}</strong>
        </div>
    `;
    
    try {
        const response = await fetch('/api/backward/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: animal,
                session_id: appData.backwardSessionId
            })
        });
        
        const result = await response.json();
        handleBackwardResult(result);
        
    } catch (error) {
        console.error('反向推理失败:', error);
    }
}

function handleBackwardResult(result) {
    const chatBox = document.getElementById('chat-box');
    const answerButtons = document.getElementById('answer-buttons');
    
    if (result.status === 'asking') {
        // 显示问题
        chatBox.innerHTML += `
            <div class="chat-message system">
                ${result.hint}<br>
                <strong>➤ ${result.question}？</strong>
            </div>
        `;
        
        // 显示回答按钮
        answerButtons.style.display = 'flex';
        
        // 绑定回答事件
        answerButtons.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => answerBackward(btn.dataset.answer);
        });
        
    } else if (result.status === 'success') {
        const emoji = appData.animalEmojis[result.animal] || '🐾';
        chatBox.innerHTML += `
            <div class="chat-message success">
                ${emoji} ${result.message}
            </div>
        `;
        answerButtons.style.display = 'none';
        
    } else if (result.status === 'failed') {
        chatBox.innerHTML += `
            <div class="chat-message failed">
                ❌ ${result.message}
            </div>
        `;
        answerButtons.style.display = 'none';
        
    } else if (result.status === 'error') {
        chatBox.innerHTML += `
            <div class="chat-message failed">
                ⚠️ ${result.message}
            </div>
        `;
        answerButtons.style.display = 'none';
    }
    
    // 滚动到底部
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function answerBackward(answer) {
    const chatBox = document.getElementById('chat-box');
    
    // 显示用户回答
    const answerText = { 'yes': '✓ 是', 'no': '✗ 否', 'unknown': '? 不确定' };
    chatBox.innerHTML += `
        <div class="chat-message user">
            ${answerText[answer]}
        </div>
    `;
    
    try {
        const response = await fetch('/api/backward/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                response: answer,
                session_id: appData.backwardSessionId
            })
        });
        
        const result = await response.json();
        handleBackwardResult(result);
        
    } catch (error) {
        console.error('回答处理失败:', error);
    }
}

// ==================== 规则管理 ====================
function renderRules() {
    const container = document.getElementById('rules-list');
    
    container.innerHTML = appData.rules.map(rule => `
        <div class="rule-item" data-id="${rule.id}">
            <div class="rule-info">
                <div class="rule-header">
                    <span class="rule-id">${rule.id}</span>
                    <span class="rule-type ${rule.type}">${rule.type === 'final' ? '最终结论' : '分类规则'}</span>
                </div>
                <div class="rule-content">
                    IF <span class="conditions">${rule.conditions.join(' AND ')}</span>
                    THEN <span class="conclusion">${rule.conclusion}</span>
                </div>
            </div>
            <div class="rule-actions">
                <button class="edit-btn" onclick="editRule('${rule.id}')">编辑</button>
                <button class="delete-btn" onclick="deleteRule('${rule.id}')">删除</button>
            </div>
        </div>
    `).join('');
    
    // 绑定添加规则按钮
    document.getElementById('add-rule-btn').onclick = () => openRuleModal();
    
    // 绑定搜索
    document.getElementById('rule-search').oninput = (e) => {
        const keyword = e.target.value.toLowerCase();
        document.querySelectorAll('.rule-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(keyword) ? '' : 'none';
        });
    };
}

function openRuleModal(rule = null) {
    const modal = document.getElementById('rule-modal');
    const title = document.getElementById('modal-title');
    const idInput = document.getElementById('rule-id');
    const conditionsInput = document.getElementById('rule-conditions');
    const conclusionInput = document.getElementById('rule-conclusion');
    const descriptionInput = document.getElementById('rule-description');
    
    if (rule) {
        title.textContent = '编辑规则';
        idInput.value = rule.id;
        conditionsInput.value = rule.conditions.join(', ');
        conclusionInput.value = rule.conclusion;
        descriptionInput.value = rule.description || '';
    } else {
        title.textContent = '添加规则';
        idInput.value = '';
        conditionsInput.value = '';
        conclusionInput.value = '';
        descriptionInput.value = '';
    }
    
    modal.classList.add('show');
    
    // 绑定关闭事件
    modal.querySelector('.modal-close').onclick = () => modal.classList.remove('show');
    modal.querySelector('.modal-cancel').onclick = () => modal.classList.remove('show');
    document.getElementById('save-rule-btn').onclick = saveRule;
}

function editRule(ruleId) {
    const rule = appData.rules.find(r => r.id === ruleId);
    if (rule) {
        openRuleModal(rule);
    }
}

async function saveRule() {
    const idInput = document.getElementById('rule-id');
    const conditionsInput = document.getElementById('rule-conditions');
    const conclusionInput = document.getElementById('rule-conclusion');
    const descriptionInput = document.getElementById('rule-description');
    
    const conditions = conditionsInput.value.split(',').map(s => s.trim()).filter(s => s);
    const conclusion = conclusionInput.value.trim();
    const description = descriptionInput.value.trim();
    
    if (conditions.length === 0 || !conclusion) {
        alert('请填写前提条件和结论');
        return;
    }
    
    const ruleData = {
        conditions,
        conclusion,
        description
    };
    
    try {
        let response;
        if (idInput.value) {
            // 更新
            response = await fetch(`/api/rules/${idInput.value}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ruleData)
            });
        } else {
            // 新增
            response = await fetch('/api/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ruleData)
            });
        }
        
        if (response.ok) {
            document.getElementById('rule-modal').classList.remove('show');
            await loadData();  // 重新加载数据
        }
        
    } catch (error) {
        console.error('保存规则失败:', error);
    }
}

async function deleteRule(ruleId) {
    if (!confirm(`确定要删除规则 ${ruleId} 吗？`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/rules/${ruleId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadData();  // 重新加载数据
        }
        
    } catch (error) {
        console.error('删除规则失败:', error);
    }
}

// ==================== 关于页面 ====================
function renderAboutAnimals() {
    const container = document.getElementById('about-animals');
    
    container.innerHTML = appData.animals.map(animal => {
        const emoji = appData.animalEmojis[animal] || '🐾';
        return `<span class="animal-tag">${emoji} ${animal}</span>`;
    }).join('');
}
