#!/usr/bin/env node

/**
 * GitHub内容同步脚本
 * 此脚本用于将本地更新的内容同步到GitHub仓库
 * 
 * 用法:
 * node sync-to-github.js [commit-message]
 * 
 * 需要环境变量:
 * - GITHUB_TOKEN: 您的个人访问令牌 (https://github.com/settings/tokens)
 */

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
 * 检查Git仓库状态
 * @returns {Object} 包含状态信息的对象
 */
function checkGitStatus() {
  try {
    // 检查是否在Git仓库中
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    } catch (error) {
      throw new Error('当前目录不是Git仓库。请先运行 git init 或确保在正确的目录中。');
    }

    // 检查远程仓库状态
    try {
      const remoteUrl = execSync('git remote get-url origin').toString().trim();
      console.log(`✓ 已连接到远程仓库: ${remoteUrl}`);
    } catch (error) {
      throw new Error('未设置远程仓库。请先运行 git remote add origin <repo-url>');
    }

    // 获取当前分支
    const currentBranch = execSync('git branch --show-current').toString().trim();
    console.log(`✓ 当前分支: ${currentBranch}`);

    // 检查是否有未提交的更改
    const changes = execSync('git status --porcelain').toString();
    const hasChanges = changes.length > 0;

    return {
      currentBranch,
      hasChanges,
      changesCount: changes.split('\n').filter(line => line.trim() !== '').length
    };
  } catch (error) {
    console.error(`❌ 检查Git状态失败: ${error.message}`);
    process.exit(1);
  }
}

/**
 * 添加、提交并推送更改到GitHub
 * @param {string} commitMessage - 提交信息
 * @param {string} branch - 目标分支
 */
function syncChangesToGitHub(commitMessage, branch) {
  try {
    // 添加所有更改
    console.log('➕ 添加所有更改到Git暂存区...');
    execSync('git add .', { stdio: 'inherit' });

    // 提交更改
    console.log(`💾 提交更改: "${commitMessage}"...`);
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

    // 推送到GitHub
    console.log(`⬆️ 推送更改到GitHub (${branch})...`);
    execSync(`git push -u origin ${branch}`, { stdio: 'inherit' });

    console.log('✅ 成功同步更改到GitHub！');
  } catch (error) {
    console.error(`❌ 同步失败: ${error.message}`);
    process.exit(1);
  }
}

/**
 * 拉取远程更新
 * @param {string} branch - 目标分支
 */
function pullFromGitHub(branch) {
  try {
    console.log(`⬇️ 从GitHub拉取最新更改 (${branch})...`);
    execSync(`git pull origin ${branch}`, { stdio: 'inherit' });
    console.log('✅ 成功拉取最新更改！');
  } catch (error) {
    console.error(`❌ 拉取失败: ${error.message}`);
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🔄 GitHub内容同步工具');
    console.log('===========================\n');

    // 检查Git状态
    const status = checkGitStatus();
    
    // 如果没有更改，检查是否需要拉取
    if (!status.hasChanges) {
      console.log('📝 没有检测到本地更改。');
      const shouldPull = await question('是否要从GitHub拉取最新更改? (y/n): ');
      
      if (shouldPull.toLowerCase() === 'y') {
        pullFromGitHub(status.currentBranch);
        console.log('\n✅ 操作完成！');
        rl.close();
        return;
      } else {
        console.log('\n❓ 没有要同步的更改。');
        rl.close();
        return;
      }
    }
    
    // 有更改时，准备同步
    console.log(`📝 检测到 ${status.changesCount} 个更改。`);

    // 获取提交信息
    let commitMessage = process.argv[2];
    if (!commitMessage) {
      commitMessage = await question('请输入提交信息: ');
      if (!commitMessage) {
        commitMessage = '更新内容';  // 默认提交信息
      }
    }

    // 确认同步
    console.log('\n📋 同步配置:');
    console.log(`- 提交信息: ${commitMessage}`);
    console.log(`- 目标分支: ${status.currentBranch}`);
    
    const confirmSync = await question('\n确认同步这些更改到GitHub? (y/n): ');
    if (confirmSync.toLowerCase() !== 'y') {
      console.log('❌ 已取消同步操作');
      rl.close();
      return;
    }

    // 执行同步
    syncChangesToGitHub(commitMessage, status.currentBranch);
    
    console.log('\n✅ 内容已成功同步到GitHub！');
    
  } catch (error) {
    console.error('\n❌ 发生错误:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 运行主函数
main();