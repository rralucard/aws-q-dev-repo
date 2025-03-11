# GitHub 代码管理与 AWS 部署指南

本文档将指导您如何将项目上传到 GitHub 进行版本控制，以及如何将项目部署到 AWS 环境中。

## 第一部分：GitHub 代码管理

### 1. 创建 GitHub 仓库

1. 登录您的 GitHub 账户，或在 [GitHub](https://github.com) 注册一个新账户
2. 点击右上角的 "+" 图标，选择 "New repository"
3. 填写仓库名称，例如 "interactive-mouse-effects"
4. 可选：添加仓库描述
5. 选择仓库可见性 (公开或私有)
6. 点击 "Create repository"

### 2. 初始化本地 Git 仓库并上传代码

在项目根目录下运行以下命令：

```bash
# 初始化 Git 仓库
git init

# 创建 .gitignore 文件
cat > .gitignore << EOL
node_modules/
.next/
out/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.idea/
.vscode/
EOL

# 添加所有文件到暂存区
git add .

# 提交代码
git commit -m "Initial commit"

# 添加远程仓库地址（替换为您的GitHub仓库URL）
git remote add origin https://github.com/您的用户名/interactive-mouse-effects.git

# 推送代码到 GitHub
git push -u origin main
```

注意：如果您的默认分支是 `master` 而不是 `main`，请相应调整上述命令。

### 3. 使用 GitHub 进行日常代码管理

#### 提交更改

```bash
git add .
git commit -m "描述您所做的更改"
git push origin main
```

#### 创建新分支

```bash
git checkout -b 新分支名称
# 进行代码修改
git add .
git commit -m "分支上的更改描述"
git push origin 新分支名称
```

#### 合并分支

```bash
git checkout main
git merge 分支名称
git push origin main
```

## 第二部分：部署到 AWS

本项目使用 AWS CDK 部署到 S3 和 CloudFront，以下是部署步骤。

### 1. 安装 AWS 命令行工具并配置

```bash
# 安装 AWS CLI
npm install -g aws-cdk

# 配置 AWS 凭证
aws configure
```

系统会提示您输入：
- AWS Access Key ID
- AWS Secret Access Key
- 默认区域 (如 us-east-1)
- 默认输出格式 (如 json)

### 2. 构建 Next.js 应用

在项目根目录下运行：

```bash
# 安装依赖
npm install

# 构建和导出静态网站
npm run build
npm run export
```

此操作将在 `out` 目录中创建静态网站文件。

### 3. 修改基础设施代码

您需要修改 `infrastructure/lib/website-stack.ts` 文件中的 S3 桶名称，将其从占位符 "XXXXXXXXXXXXX" 改为唯一的名称：

```typescript
const websiteBucket = new s3.Bucket(this, 'XXXXXXXXX', {
  // 保持其他配置不变
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  encryption: s3.BucketEncryption.S3_MANAGED,
});
```

### 4. 引导 AWS 环境（仅第一次）

如果这是您第一次在 AWS 账户中使用 CDK，需要引导环境：

```bash
cd infrastructure
cdk bootstrap aws://您的AWS账号/您的区域
```

### 5. 部署基础设施

```bash
cd infrastructure
npm install
npm run build
cdk deploy
```

部署过程中系统可能会询问您是否确认创建某些 IAM 策略，输入 "y" 确认。

部署完成后，CDK 将输出 CloudFront 分发的域名，您可以通过该域名访问网站。

### 6. 更新网站内容

当您修改网站内容后，需要重新构建和部署：

```bash
# 在项目根目录
npm run build
npm run export

# 进入 infrastructure 目录
cd infrastructure
cdk deploy
```

### 7. 清理资源（可选）

如果您想删除所有创建的资源：

```bash
cd infrastructure
cdk destroy
```

## 注意事项

1. **生产环境配置**：当前设置适用于开发和测试环境。对于生产环境，请修改 `website-stack.ts` 中的以下设置，以防止意外数据丢失：
   - 将 `RemovalPolicy.DESTROY` 改为 `RemovalPolicy.RETAIN`
   - 移除或设置 `autoDeleteObjects: false`

2. **域名设置**：如果您想使用自定义域名，需要在 AWS Route 53 中配置并修改 CloudFront 分发配置。

3. **CI/CD 集成**：考虑设置 GitHub Actions 自动化部署流程，在代码推送到特定分支后自动构建和部署。