# 后端 API 实现指南 - 视频食谱提取

为了完整支持视频链接（YouTube、Bilibili、Instagram、小红书）的食谱提取，你需要创建一个后端 API 服务。

## 为什么需要后端？

1. **CORS 限制**：视频平台的 API 不允许前端直接调用
2. **API 密钥安全**：需要在服务器端保存 API 密钥
3. **字幕提取**：需要服务器端处理视频字幕下载

## 推荐技术栈

- **Node.js + Express** 或 **Python + FastAPI**
- **YouTube Data API v3** (需要 API key)
- **yt-dlp** (Python) 或 **youtube-dl** (Node.js) - 用于提取视频信息

## API 端点设计

### 1. 获取视频元数据

```
POST /api/video/metadata
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=xxxxx"
}

Response:
{
  "platform": "youtube",
  "videoId": "xxxxx",
  "title": "视频标题",
  "description": "视频描述...",
  "thumbnail": "https://...",
  "url": "https://..."
}
```

### 2. 获取视频字幕

```
POST /api/video/captions
Content-Type: application/json

{
  "platform": "youtube",
  "videoId": "xxxxx"
}

Response:
{
  "captions": "字幕文本内容..."
}
```

## 实现示例 (Node.js + Express)

### 安装依赖

```bash
npm install express cors dotenv
npm install youtube-dl-exec  # 或使用 yt-dlp
```

### 实现代码

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { exec } = require('youtube-dl-exec');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 获取视频元数据
app.post('/api/video/metadata', async (req, res) => {
  try {
    const { url } = req.body;
    
    // 使用 yt-dlp 提取视频信息
    const info = await exec(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
    });
    
    res.json({
      platform: detectPlatform(url),
      videoId: extractVideoId(url),
      title: info.title,
      description: info.description || '',
      thumbnail: info.thumbnail || '',
      url: url,
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// 获取视频字幕
app.post('/api/video/captions', async (req, res) => {
  try {
    const { platform, videoId } = req.body;
    const url = constructUrl(platform, videoId);
    
    // 提取字幕
    const captions = await exec(url, {
      writeAutoSub: true,
      skipDownload: true,
      subLang: 'zh,en', // 优先中文，其次英文
    });
    
    // 读取字幕文件内容
    // ... 处理字幕文件
    
    res.json({ captions: captionsText });
  } catch (error) {
    console.error('Error fetching captions:', error);
    res.status(500).json({ error: 'Failed to fetch captions' });
  }
});

app.listen(3001, () => {
  console.log('Backend API server running on http://localhost:3001');
});
```

## 更新前端代码

在 `src/services/videoExtractor.ts` 中，更新函数调用后端 API：

```typescript
// 在 fetchVideoMetadata 中
export async function fetchVideoMetadata(url: string): Promise<VideoMetadata | null> {
  const platform = detectVideoPlatform(url);
  const videoId = extractVideoId(url, platform);

  if (!videoId) {
    return null;
  }

  // 调用后端 API
  const response = await fetch('http://localhost:3001/api/video/metadata', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch video metadata');
  }

  return await response.json();
}

// 在 fetchVideoCaptions 中
export async function fetchVideoCaptions(
  platform: VideoPlatform,
  videoId: string
): Promise<string> {
  const response = await fetch('http://localhost:3001/api/video/captions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ platform, videoId }),
  });

  if (!response.ok) {
    return ''; // 返回空字符串如果获取失败
  }

  const data = await response.json();
  return data.captions || '';
}
```

## 平台特定实现

### YouTube

```javascript
// 使用 YouTube Data API v3
const youtube = require('googleapis').google.youtube('v3');

async function getYouTubeMetadata(videoId) {
  const response = await youtube.videos.list({
    key: process.env.YOUTUBE_API_KEY,
    part: 'snippet',
    id: videoId,
  });
  
  return response.data.items[0].snippet;
}
```

### Bilibili

```javascript
// Bilibili 需要解析 HTML 或使用非官方 API
// 可以使用 puppeteer 或 cheerio 来爬取
const puppeteer = require('puppeteer');

async function getBilibiliMetadata(videoId) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.bilibili.com/video/${videoId}`);
  
  const title = await page.$eval('h1', el => el.textContent);
  const description = await page.$eval('.desc-info-text', el => el.textContent);
  
  await browser.close();
  return { title, description };
}
```

### Instagram / 小红书

这些平台通常需要：
- 登录认证
- 使用官方 API（如果有）
- 或使用爬虫工具（可能违反 ToS）

## 环境变量

创建 `.env` 文件：

```
YOUTUBE_API_KEY=your_youtube_api_key
BACKEND_URL=http://localhost:3001
```

## 部署建议

1. **Vercel / Netlify Functions**：无服务器函数
2. **Railway / Render**：简单的 Node.js 部署
3. **Docker**：容器化部署

## 注意事项

1. **API 限制**：YouTube API 有每日配额限制
2. **法律合规**：确保遵守各平台的使用条款
3. **性能优化**：缓存视频元数据，避免重复请求
4. **错误处理**：优雅处理 API 失败和超时

## 当前实现状态

目前前端代码已经支持视频链接检测和基础提取。在没有后端的情况下，会使用：
- 视频平台检测
- 基础元数据提取（标题、缩略图）
- 简单的文本解析作为后备方案

配置后端 API 后，将能够：
- 获取完整的视频描述
- 提取视频字幕
- 使用 AI 分析视频内容提取详细食谱信息

