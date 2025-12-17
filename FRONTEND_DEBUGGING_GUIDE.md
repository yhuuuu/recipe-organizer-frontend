# 前端调试指南

## ✅ 已完成的修改

### 1. 新增后端 API 调用
创建了 `src/services/backendExtractor.ts`，实现了：
- ✅ 调用后端 `/api/extract` 端点
- ✅ 完整的错误处理和日志记录
- ✅ 网络错误检测
- ✅ CORS 错误检测
- ✅ 数据验证和标准化

### 2. 更新 AddRecipeModal.tsx
- ✅ 导入 `extractRecipeFromBackend` 服务
- ✅ 在 `handleExtract` 中优先调用后端 API
- ✅ 在 `handleExtractAndSave` 中优先调用后端 API
- ✅ 添加详细的控制台日志
- ✅ 后端失败时自动回退到本地提取方法

### 3. 增强的日志记录
所有关键步骤都会在浏览器控制台输出日志：
- 🔵 蓝色：表示正在进行的操作
- ✅ 绿色：表示操作成功
- ⚠️ 黄色：表示警告（回退到备用方案）
- ❌ 红色：表示错误

## 🔍 浏览器控制台检查步骤

### 步骤 1：打开开发者工具
1. 按 `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. 点击 "Console" (控制台) 标签

### 步骤 2：测试提取功能
1. 在应用中点击 "Add Recipe"
2. 粘贴食谱内容或输入 URL
3. 点击 "AI 提取" 或 "AI 提取并添加"

### 步骤 3：查看控制台输出

#### ✅ 成功的调用应该显示：
```
🔵 Calling backend /api/extract...
Request data: { text: "...", url: "..." }
Response status: 200 OK
✅ Received from backend: { title: "...", ingredients: [...], steps: [...] }
✅ Normalized data: { ... }
🔵 Filling form with extracted data: { ... }
✅ Form data updated successfully
```

#### ❌ 常见错误类型：

**1. 网络错误 - 后端未运行**
```
❌ Network error - Backend might not be running: TypeError: Failed to fetch
错误信息：无法连接到后端服务器，请确保后端服务正在运行 (http://localhost:4000)
```
**解决方法：**
- 确保后端服务器正在运行在 `http://localhost:4000`
- 检查后端日志确认服务已启动

**2. CORS 错误**
```
Access to fetch at 'http://localhost:4000/api/extract' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```
**解决方法：**
后端需要配置 CORS，例如（Node.js/Express）：
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

**3. 404 错误 - 端点不存在**
```
Response status: 404 Not Found
❌ Backend API error: 404 Not Found
```
**解决方法：**
- 检查后端是否实现了 `/api/extract` 端点
- 确认后端路由配置正确

**4. 500 错误 - 后端服务器错误**
```
Response status: 500 Internal Server Error
❌ Backend API error: 500 Internal Server Error
```
**解决方法：**
- 检查后端日志查看具体错误
- 确认后端接收到的数据格式正确

### 步骤 4：检查 Network 标签

1. 点击 "Network" (网络) 标签
2. 刷新页面或重新执行提取操作
3. 查找对 `extract` 的请求

#### 检查请求详情：
- **URL**: 应该是 `http://localhost:4000/api/extract`
- **Method**: POST
- **Status**: 200 (成功)
- **Request Headers**: 应包含 `Content-Type: application/json`
- **Request Payload**: 应包含 `{ text: "...", url: "..." }`
- **Response**: 应包含提取的食谱数据

#### 常见问题：
- ❌ 请求显示 `(failed)`：网络连接问题或 CORS 错误
- ❌ 状态码 404：后端端点不存在
- ❌ 状态码 500：后端处理错误
- ❌ 请求未发送：前端代码可能有错误

## 🧪 测试用例

### 测试 1：文本提取
1. 点击 "Add Recipe"
2. 点击 "粘贴内容" 标签
3. 粘贴以下测试内容：
```
家常版酸汤肥牛

【材料】
肥牛、酸菜、豆腐

【做法】
1. 准备材料
2. 煮汤底
3. 加入肥牛
```
4. 点击 "AI 提取食谱"
5. 查看控制台日志

**期望结果：**
- 控制台显示后端调用日志
- 表单自动填充标题、食材、步骤
- 没有错误信息

### 测试 2：URL 提取
1. 点击 "Add Recipe"
2. 在 "Recipe URL" 输入框输入一个食谱 URL
3. 点击 "AI 提取"
4. 查看控制台日志

## 📋 后端 API 要求

### 端点：POST /api/extract

**请求格式：**
```json
{
  "text": "食谱文本内容（可选）",
  "url": "食谱URL（可选）"
}
```

**响应格式：**
```json
{
  "title": "食谱标题",
  "ingredients": ["食材1", "食材2", "食材3"],
  "steps": ["步骤1", "步骤2", "步骤3"],
  "cuisine": "Chinese",
  "image": "https://example.com/image.jpg"
}
```

**错误响应：**
```json
{
  "error": "错误信息"
}
```

## 🔧 环境配置

### 创建 .env 文件
```bash
cp .env.example .env
```

### 配置内容：
```
VITE_API_BASE_URL=http://localhost:4000/api
```

确保后端服务器运行在 `http://localhost:4000`

## 📊 数据流程图

```
用户输入文本/URL
       ↓
点击 "AI 提取"
       ↓
handleExtract() 函数
       ↓
extractRecipeFromBackend(text, url)
       ↓
fetch('http://localhost:4000/api/extract', {...})
       ↓
后端处理 (AI/文本解析)
       ↓
返回 JSON { title, ingredients, steps, cuisine, image }
       ↓
setFormData() 填充表单
       ↓
用户可以编辑或直接保存
```

## 🚨 故障排除清单

- [ ] 后端服务是否运行？(`http://localhost:4000`)
- [ ] 后端是否实现了 `/api/extract` 端点？
- [ ] 后端是否配置了 CORS？
- [ ] `.env` 文件是否存在且配置正确？
- [ ] 浏览器控制台是否有错误？
- [ ] Network 标签是否显示请求？
- [ ] 请求状态码是什么？
- [ ] 请求和响应的数据格式是否正确？

## 📝 下一步

如果遇到问题：
1. 复制控制台的完整错误信息
2. 检查 Network 标签的请求详情
3. 检查后端日志
4. 确认数据格式是否符合 API 要求
