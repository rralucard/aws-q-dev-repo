#!/usr/bin/env node

/**
 * 创建 GitHub 仓库的脚本
 * 此脚本使用 GitHub API 创建新的仓库，并根据当前项目配置初始化它
 * 
 * 用法:
 * node create-github-repo.js <repo-name> [description]
 * 
 * 需要环境变量:
 * - GITHUB_TOKEN: 您的个人访问令牌 (https://github.com/settings/tokens)
 */

const https = require('https');
const { execSync } = require('child_process');
const readline = require('readline');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 获取用户输入的函数
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * 创建GitHub仓库
 * @param {string} token - GitHub个人访问令牌
 * @param {string} repoName - 仓库名称
 * @param {string} description - 仓库描述
 * @param {boolean} isPrivate - 是否为私有仓库
 */
async function createGitHubRepo(token, repoName, description, isPrivate) {
  return new Promise((resolve, reject) => {
    // GitHub API请求数据
    const data = JSON.stringify({
      name: repoName,
      description: description,
      private: isPrivate,
      auto_init: false
    });

    // GitHub API请求选项
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: '/user/repos',
      method: 'POST',
      headers: {
        'User-Agent': 'Node.js GitHub Repository Creator',
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`,
        'Content-Length': data.length
      }
    };

    // 发送请求到GitHub API
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 201) {
          const response = JSON.parse(responseData);
          console.log(`✅ 成功创建GitHub仓库: ${response.html_url}`);
          resolve(response);
        } else {
          console.error(`❌ 创建仓库失败，状态码: ${res.statusCode}`);
          console.error(responseData);
          reject(new Error(`创建仓库失败: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ 请求错误:', error);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * 设置本地Git仓库并推送到GitHub
 * @param {string} repoUrl - GitHub仓库URL
 */
function setupLocalGitRepo(repoUrl) {
  try {
    // 检查是否已经初始化了Git仓库
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
      console.log('📁 Git仓库已经存在，继续使用。');
    } catch (error) {
      console.log('📁 初始化Git仓库...');
      execSync('git init');
    }

    // 创建.gitignore文件
    console.log('📝 创建.gitignore文件...');
    const fs = require('fs');
    const gitignoreContent = `node_modules/
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
.vscode/`;
    fs.writeFileSync('.gitignore', gitignoreContent);

    // 添加所有文件
    console.log('➕ 添加所有文件到Git暂存区...');
    execSync('git add .');

    // 提交更改
    console.log('💾 提交更改...');
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });

    // 添加远程仓库
    console.log('🔗 添加GitHub远程仓库...');
    try {
      execSync('git remote remove origin', { stdio: 'ignore' });
    } catch (error) {
      // 如果origin不存在，忽略错误
    }
    execSync(`git remote add origin ${repoUrl}`);

    // 获取当前分支名称
    let branchName;
    try {
      branchName = execSync('git branch --show-current').toString().trim();
    } catch (error) {
      branchName = 'main'; // 默认使用main
    }
    
    if (!branchName) {
      branchName = 'main';
    }

    // 如果不是main或master分支，创建main分支
    if (branchName !== 'main' && branchName !== 'master') {
      console.log(`🔄 当前在 "${branchName}" 分支，创建并切换到main分支...`);
      execSync('git checkout -b main');
    }

    // 推送到GitHub
    console.log('⬆️ 推送代码到GitHub...');
    execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });

    console.log('✅ 成功推送代码到GitHub！');
  } catch (error) {
    console.error('❌ Git操作失败:', error.message);
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 GitHub仓库创建工具');
    console.log('=============================\n');

    // 获取GitHub令牌
    let token = process.env.GITHUB_TOKEN;
    if (!token) {
      token = await question('请输入您的GitHub个人访问令牌 (https://github.com/settings/tokens): ');
      if (!token) {
        console.error('❌ GitHub令牌是必需的！');
        process.exit(1);
      }
    } else {
      console.log('✓ 已从环境变量获取GitHub令牌');
    }

    // 获取仓库名称
    let repoName = process.argv[2];
    if (!repoName) {
      // 从package.json获取项目名称作为默认值
      let defaultName;
      try {
        const packageJson = require('./package.json');
        defaultName = packageJson.name;
      } catch (error) {
        defaultName = 'interactive-mouse-effects';
      }
      
      repoName = await question(`请输入仓库名称 (默认: ${defaultName}): `) || defaultName;
    }

    // 获取仓库描述
    let description = process.argv[3];
    if (!description) {
      description = await question('请输入仓库描述 (可选): ') || '';
    }

    // 设置仓库可见性
    const isPrivateStr = await question('是否创建私有仓库? (y/n，默认: n): ');
    const isPrivate = isPrivateStr.toLowerCase() === 'y';

    console.log('\n📋 创建仓库的配置信息:');
    console.log(`- 仓库名称: ${repoName}`);
    console.log(`- 描述: ${description || '(无)'}`);
    console.log(`- 可见性: ${isPrivate ? '私有' : '公开'}`);
    
    const confirmCreate = await question('\n确认创建仓库? (y/n): ');
    if (confirmCreate.toLowerCase() !== 'y') {
      console.log('❌ 已取消创建仓库');
      process.exit(0);
    }

    console.log('\n🔄 正在创建GitHub仓库，请稍候...');
    const repo = await createGitHubRepo(token, repoName, description, isPrivate);
    
    // 设置本地Git仓库并推送
    setupLocalGitRepo(repo.clone_url);

    console.log('\n✅ GitHub仓库设置完成!');
    console.log(`📘 仓库URL: ${repo.html_url}`);
    
  } catch (error) {
    console.error('\n❌ 发生错误:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 执行主函数
main();