# jimeng2me_newapi

即梦 AI OpenAI 兼容接口服务，支持：

- `POST /v1/chat/completions`
- `POST /v1/images/generations`
- `POST /v1/videos/generations`
- `GET /v1/models`

本项目默认端口为 `15745`。

## 特性

- 支持文生图、图生图、视频生成
- 支持 OpenAI 图片接口格式
- 支持 OpenAI `chat/completions` 格式发图
- `chat/completions` 额外支持 `image_config` 和 `images`
- 支持多个 `sessionid` 轮询

## 环境要求

- Node.js 16+
- Docker
- Chromium 浏览器依赖会在镜像构建时自动处理

## Docker 部署

### 首次部署

```bash
git clone https://github.com/445022889/jimeng2me_newapi.git
cd jimeng2me_newapi

docker build -t jimeng2me_newapi:latest .

docker rm -f jimeng2me_newapi 2>/dev/null || true

docker run -d \
  --name jimeng2me_newapi \
  --restart unless-stopped \
  -p 15745:15745 \
  -e TZ=Asia/Shanghai \
  jimeng2me_newapi:latest
```

如果构建时想看完整日志：

```bash
docker build --no-cache --progress=plain -t jimeng2me_newapi:latest .
```

### 更新代码后重新部署

```bash
cd jimeng2me_newapi
git pull

docker build -t jimeng2me_newapi:latest .

docker rm -f jimeng2me_newapi

docker run -d \
  --name jimeng2me_newapi \
  --restart unless-stopped \
  -p 15745:15745 \
  -e TZ=Asia/Shanghai \
  jimeng2me_newapi:latest
```

### 启动后测试

```bash
curl http://127.0.0.1:15745/v1/models
```

## 本地开发

```bash
git clone https://github.com/445022889/jimeng2me_newapi.git
cd jimeng2me_newapi

npm install
npx playwright-core install chromium --with-deps

npm run dev
```

## 鉴权说明

本项目现在支持两种即梦鉴权传法：

### 1. 直接调用本项目

在 `Authorization` 头中传入即梦站点的 `sessionid`：

```text
Authorization: Bearer your_sessionid
```

多个账号可用逗号分隔：

```text
Authorization: Bearer sessionid1,sessionid2,sessionid3
```

### 2. 通过 NewAPI 之类的网关调用

如果请求头里的 `Authorization` 需要留给 NewAPI 自己的个人令牌使用，就把即梦 `sessionid` 放进请求体里的 `token`：

```json
{
  "token": "你的即梦 sessionid"
}
```

当前接口会优先读取：

1. `body.token`
2. `headers.authorization`

## 接口列表

| 端点 | 方法 | 说明 |
|------|------|------|
| `/v1/chat/completions` | POST | OpenAI 对话兼容接口，已增强支持生图参数 |
| `/v1/images/generations` | POST | OpenAI 图片生成接口 |
| `/v1/images/compositions` | POST | 图生图兼容接口 |
| `/v1/videos/generations` | POST | 视频生成接口 |
| `/v1/models` | GET | 模型列表 |

## OpenAI 请求示例

### 1. OpenAI 图片接口格式

请求地址：

```text
POST /v1/images/generations
```

请求体：

```json
{
  "token": "your_sessionid",
  "model": "jimeng-4.5",
  "prompt": "美丽的日落风景，湖边的小屋",
  "ratio": "16:9",
  "resolution": "2k"
}
```

`curl` 示例：

```bash
curl -X POST http://127.0.0.1:15745/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_newapi_key" \
  -d '{
    "token": "your_sessionid",
    "model": "jimeng-4.5",
    "prompt": "美丽的日落风景，湖边的小屋",
    "ratio": "16:9",
    "resolution": "2k"
  }'
```

### 2. OpenAI Chat 格式文生图

请求地址：

```text
POST /v1/chat/completions
```

请求体：

```json
{
  "token": "your_sessionid",
  "model": "jimeng-5.0",
  "messages": [
    {
      "role": "user",
      "content": "美丽的日落风景，湖边的小屋"
    }
  ],
  "stream": false,
  "image_config": {
    "ratio": "16:9",
    "resolution": "2k"
  }
}
```

`curl` 示例：

```bash
curl -X POST http://127.0.0.1:15745/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_newapi_key" \
  -d '{
    "token": "your_sessionid",
    "model": "jimeng-5.0",
    "messages": [
      {
        "role": "user",
        "content": "美丽的日落风景，湖边的小屋"
      }
    ],
    "stream": false,
    "image_config": {
      "ratio": "16:9",
      "resolution": "2k"
    }
  }'
```

### 3. OpenAI Chat 格式图生图

请求地址：

```text
POST /v1/chat/completions
```

请求体：

```json
{
  "token": "your_sessionid",
  "model": "jimeng-5.0",
  "messages": [
    {
      "role": "user",
      "content": "将这两张图片融合成电影感海报"
    }
  ],
  "stream": true,
  "image_config": {
    "ratio": "9:16",
    "resolution": "2k"
  },
  "images": [
    "https://example.com/1.jpg",
    "https://example.com/2.jpg"
  ]
}
```

`curl` 示例：

```bash
curl -X POST http://127.0.0.1:15745/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_newapi_key" \
  -d '{
    "token": "your_sessionid",
    "model": "jimeng-5.0",
    "messages": [
      {
        "role": "user",
        "content": "将这两张图片融合成电影感海报"
      }
    ],
    "stream": true,
    "image_config": {
      "ratio": "9:16",
      "resolution": "2k"
    },
    "images": [
      "https://example.com/1.jpg",
      "https://example.com/2.jpg"
    ]
  }'
```

### 4. OpenAI 图片接口图生图

```bash
curl -X POST http://127.0.0.1:15745/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_newapi_key" \
  -d '{
    "token": "your_sessionid",
    "model": "jimeng-4.5",
    "prompt": "将两张图融合成梦幻风格",
    "images": [
      "https://example.com/1.jpg",
      "https://example.com/2.jpg"
    ],
    "ratio": "1:1",
    "resolution": "2k",
    "sample_strength": 0.5
  }'
```

### 5. 视频生成

```bash
curl -X POST http://127.0.0.1:15745/v1/videos/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_newapi_key" \
  -d '{
    "token": "your_sessionid",
    "model": "jimeng-video-3.5-pro",
    "prompt": "一只可爱的小猫在草地上玩耍",
    "ratio": "16:9",
    "resolution": "720p",
    "duration": 5
  }'
```

## Chat 生图扩展参数

`/v1/chat/completions` 在标准 OpenAI Chat 格式基础上，额外支持：

| 字段 | 类型 | 说明 |
|------|------|------|
| `image_config.ratio` | string | 图片比例，如 `1:1`、`16:9`、`9:16` |
| `image_config.resolution` | string | 图片分辨率，如 `1k`、`2k`、`4k` |
| `image_config.sample_strength` | number | 图生图强度 |
| `image_config.negative_prompt` | string | 反向提示词 |
| `image_config.intelligent_ratio` | boolean | 是否启用智能比例 |
| `images` | array | 图生图输入图片 URL 数组，最多 10 张 |
| `token` | string | 即梦自己的 `sessionid`，适合通过 NewAPI 透传 |

兼容驼峰写法：

- `imageConfig`
- `sampleStrength`
- `negativePrompt`
- `intelligentRatio`

## 常见问题

### 1. Docker 容器无法启动

- 检查端口 `15745` 是否被占用
- 检查 Docker 服务是否正常
- 查看日志：`docker logs jimeng2me_newapi`

### 2. 返回 session 相关错误

- 检查 `sessionid` 是否有效
- 重新登录即梦网站获取新的 `sessionid`
- 可以配置多个 `sessionid` 提高可用性

### 3. `chat/completions` 提示缺少 `messages`

你发的是 Chat 接口，请求体必须带：

```json
{
  "messages": [
    {
      "role": "user",
      "content": "你的提示词"
    }
  ]
}
```

### 4. `images/generations` 不支持 `size`

本项目使用：

- `ratio`
- `resolution`

不要使用：

- `size`
- `width`
- `height`

## 说明

本项目仅供学习和自用，请自行评估使用风险。
