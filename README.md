# Long Video Assistant (LVA) - 长视频创作助手

LVA 是一个基于 AI 驱动的个人长视频生产力工具。它旨在自动化从灵感到成片的繁琐流程。

本项目采用 **Local-First** 架构，数据优先存储在本地 IndexedDB，支持离线使用，并能与 Cloudflare D1 (数据库) 和 R2 (对象存储) 进行云端同步。

## 🛠 部署指南 (Cloudflare Pages)

### 第一步：准备资源 (Cloudflare Dashboard)

1.  **创建 D1 数据库**:
    *   登录 Cloudflare Dashboard -> **Workers & Pages** -> **D1 SQL Database**。
    *   点击 **Create**，命名为 `lva-db`。
    *   创建后，复制 **Database ID** (一串 UUID)。

2.  **创建 R2 存储桶**:
    *   进入 **R2 Object Storage**。
    *   点击 **Create bucket**，命名为 `lva-images`。
    *   **重要：配置 CORS** (为了让前端能下载图片)：
        *   进入 `lva-images` -> **Settings** -> **CORS Policy**。
        *   添加以下配置：
        ```json
        [
          {
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
            "AllowedHeaders": ["*"]
          }
        ]
        ```

### 第二步：代码推送与构建

1.  将代码推送到 GitHub。
2.  在 Cloudflare Dashboard -> **Workers & Pages** -> **Create application** -> **Connect to Git**。
3.  选择您的仓库。
4.  **Build settings (构建设置)**:
    *   **Framework preset**: Vite
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist`

### 第三步：绑定资源 (关键步骤)

在部署详情页面（或部署完成后进入 Settings -> Functions）：

1.  **D1 Database Bindings**:
    *   Variable name: `DB` (必须完全一致)
    *   Value: 选择你刚才创建的 `lva-db`。

2.  **R2 Bucket Bindings**:
    *   Variable name: `BUCKET` (必须完全一致)
    *   Value: 选择你刚才创建的 `lva-images`。

3.  **Environment Variables (环境变量)**:
    *   添加变量 `API_KEY`，值为您的 Google Gemini API Key。

### 第四步：重新部署

保存上述绑定设置后，进入 **Deployments** 选项卡，点击 **Retry deployment** (或 Create deployment) 以应用绑定。

---

## 🚀 本地开发指南

1.  安装依赖: `npm install`
2.  修改 `wrangler.toml`: 将您的 D1 Database ID 填入。
3.  启动开发服务器: `npx wrangler pages dev -- npm run dev`
    *   首次运行会自动创建本地 SQLite 数据库文件。

## License

MIT License
