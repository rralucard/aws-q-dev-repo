# 自动化GitHub仓库创建和AWS部署

本文档介绍如何使用提供的脚本自动创建GitHub仓库并部署到AWS环境。

## 前提条件

1. 已安装 Node.js（版本 12 或更高）
2. 已安装 Git
3. 已安装 AWS CLI 并已配置（对于AWS部署）
4. GitHub 个人访问令牌（对于GitHub仓库创建）

## 1. 自动创建GitHub仓库

`create-github-repo.js` 脚本可以帮助您自动创建GitHub仓库并将本地代码推送到该仓库。

### 使用方法

1. 首先，确保脚本具有执行权限：

```bash
chmod +x create-github-repo.js
```

2. 运行脚本：

```bash
# 方式1：直接运行（脚本将提示您输入所需信息）
node create-github-repo.js

# 方式2：指定仓库名称
node create-github-repo.js my-repository

# 方式3：指定仓库名称和描述
node create-github-repo.js my-repository "这是我的项目描述"

# 指定GitHub令牌为环境变量
GITHUB_TOKEN=your_github_token node create-github-repo.js
```

### 脚本功能

- 通过GitHub API创建新仓库
- 自动初始化本地Git仓库
- 创建标准的.gitignore文件
- 提交所有代码并推送到GitHub
- 自动处理分支命名（支持main或master）

## 2. 自动部署到AWS

`deploy-to-aws.js` 脚本可以帮助您将项目部署到AWS环境，包括S3、CloudFront等服务。

### 使用方法

1. 首先，确保脚本具有执行权限：

```bash
chmod +x deploy-to-aws.js
```

2. 确保已配置AWS CLI凭证：

```bash
aws configure
```

3. 运行部署脚本：

```bash
# 方式1：直接运行（脚本将提示您输入S3桶名称）
node deploy-to-aws.js

# 方式2：指定S3桶名称
node deploy-to-aws.js my-bucket-name
```

### 脚本功能

- 检查AWS CLI配置
- 安装项目依赖
- 构建并导出Next.js应用
- 更新infrastructure/lib/website-stack.ts中的S3桶名称
- 引导AWS CDK环境（如果需要）
- 部署AWS CDK堆栈
- 显示部署完成后的CloudFront域名

## 常见问题

### GitHub仓库创建

1. **问题**: 创建仓库时显示认证失败
   **解决方案**: 确保您的GitHub令牌具有正确的权限（至少需要`repo`权限）

2. **问题**: 推送代码失败
   **解决方案**: 检查您是否有对本地仓库的写入权限，以及远程仓库URL是否正确

### AWS部署

1. **问题**: AWS CLI认证失败
   **解决方案**: 运行`aws configure`重新配置您的AWS凭证

2. **问题**: CDK部署失败
   **解决方案**: 检查错误消息，可能需要更新S3桶名称（S3桶名称必须全球唯一）

3. **问题**: Next.js构建失败
   **解决方案**: 检查项目依赖是否正确安装，以及项目代码是否有错误

## 自定义

您可以根据需要修改这些脚本：

- 在`create-github-repo.js`中修改.gitignore文件内容
- 在`deploy-to-aws.js`中调整CDK部署参数