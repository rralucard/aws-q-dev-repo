#!/usr/bin/env node

/**
 * 使用方法:
 * 1. 确保已安装Node.js
 * 2. 在终端中运行: `node cleanup-aws.js`
 * 3. 根据提示确认删除操作
 *
 *
 * AWS CDK资源清理脚本
 * 
 * 此脚本用于清理由CDK创建的所有AWS资源，包括：
 * - S3存储桶
 * - CloudFront分发
 * - IAM角色和策略
 * - 其他相关资源
 */

const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('AWS CDK资源清理工具');
console.log('-------------------');
console.log('该脚本将删除通过CDK部署的所有AWS资源。');
console.log('包括: S3存储桶、CloudFront分发及其他相关资源。');
console.log('此操作不可逆，请谨慎操作！\n');

rl.question('您确定要继续删除所有资源吗？(y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    console.log('\n开始删除资源...');
    
    // 切换到infrastructure目录执行cdk destroy命令
    const cdkProcess = spawn('npx', ['cdk', 'destroy', '--force'], { 
      cwd: './infrastructure',
      shell: true,
      stdio: 'inherit'
    });

    cdkProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ 资源清理完成！所有CDK部署的资源已被删除。');
      } else {
        console.error(`\n❌ 资源清理失败，退出码: ${code}`);
        console.log('您可以尝试手动运行以下命令:');
        console.log('cd infrastructure && npx cdk destroy --force');
      }
      rl.close();
    });
  } else {
    console.log('操作已取消，资源未被删除。');
    rl.close();
  }
});

// 添加错误处理
process.on('uncaughtException', (err) => {
  console.error('\n❌ 发生错误:', err);
  console.log('您可以尝试手动运行以下命令:');
  console.log('cd infrastructure && npx cdk destroy --force');
  process.exit(1);
});