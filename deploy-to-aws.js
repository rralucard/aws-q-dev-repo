#!/usr/bin/env node

/**
 * AWS部署脚本
 * 此脚本用于将项目部署到AWS环境
 * 
 * 用法:
 * node deploy-to-aws.js [bucket-name]
 * 
 * 需要已配置 AWS CLI 凭证
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

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
 * 检查AWS CLI是否已安装和配置
 */
function checkAwsCliConfig() {
  try {
    console.log('🔍 检查AWS CLI配置...');
    execSync('aws sts get-caller-identity', { stdio: 'ignore' });
    console.log('✅ AWS CLI已正确配置');
    return true;
  } catch (error) {
    console.error('❌ AWS CLI未配置或凭证无效');
    return false;
  }
}

/**
 * 安装依赖
 */
function installDependencies() {
  try {
    console.log('📦 安装项目依赖...');
    execSync('npm install', { stdio: 'inherit' });
    
    // 检查infrastructure目录是否存在，如果存在则安装其依赖
    if (fs.existsSync('infrastructure')) {
      console.log('📦 安装infrastructure目录中的依赖...');
      execSync('cd infrastructure && npm install', { stdio: 'inherit' });
    }
    
    return true;
  } catch (error) {
    console.error('❌ 安装依赖失败:', error.message);
    return false;
  }
}

/**
 * 构建和导出Next.js应用
 */
function buildAndExportApp() {
  try {
    console.log('🏗️ 构建和导出Next.js应用...');
    execSync('npm run build', { stdio: 'inherit' });
    execSync('npm run export', { stdio: 'inherit' });
    console.log('✅ 应用构建完成，静态文件已导出到out目录');
    return true;
  } catch (error) {
    console.error('❌ 应用构建失败:', error.message);
    return false;
  }
}

/**
 * 更新S3桶名称
 * @param {string} bucketName - S3桶名称
 */
function updateS3BucketName(bucketName) {
  try {
    const filePath = path.join('infrastructure', 'lib', 'website-stack.ts');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ 找不到infrastructure/lib/website-stack.ts文件');
      return false;
    }
    
    console.log('📝 更新S3桶名称...');
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 查找S3桶定义的行并替换名称
    const bucketPattern = /new\s+s3\.Bucket\s*\(\s*this\s*,\s*['"]([^'"]+)['"]\s*,/;
    const bucketMatch = content.match(bucketPattern);
    
    if (bucketMatch) {
      content = content.replace(bucketPattern, `new s3.Bucket(this, 'XXXXXXXXXXXXX',`);
      fs.writeFileSync(filePath, content);
      console.log(`✅ 已将S3桶名称更新为: ${bucketName}`);
      return true;
    } else {
      console.error('❌ 无法在website-stack.ts中找到S3桶定义');
      return false;
    }
  } catch (error) {
    console.error('❌ 更新S3桶名称失败:', error.message);
    return false;
  }
}

/**
 * 引导AWS CDK环境
 */
function bootstrapCdkEnvironment() {
  try {
    console.log('🔄 检查AWS CDK是否需要引导...');
    
    // 检查是否已进行过引导
    try {
      execSync('cd infrastructure && npx cdk ls', { stdio: 'ignore' });
      console.log('✅ AWS CDK环境已准备就绪');
      return true;
    } catch (error) {
      // 需要引导
      console.log('🔄 开始引导AWS CDK环境...');
      execSync('cd infrastructure && npx cdk bootstrap', { stdio: 'inherit' });
      console.log('✅ AWS CDK环境引导完成');
      return true;
    }
  } catch (error) {
    console.error('❌ 引导AWS CDK环境失败:', error.message);
    return false;
  }
}

/**
 * 部署基础设施
 */
function deployCdkStack() {
  try {
    console.log('🚀 部署AWS基础设施...');
    
    // 构建CDK项目
    execSync('cd infrastructure && npm run build', { stdio: 'inherit' });
    
    // 部署CDK堆栈
    execSync('cd infrastructure && npx cdk deploy --require-approval never', { stdio: 'inherit' });
    
    console.log('✅ AWS基础设施部署完成');
    return true;
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    return false;
  }
}

/**
 * 获取CloudFront域名
 */
function getCloudFrontDomain() {
  try {
    console.log('🔍 获取CloudFront域名...');
    
    const output = execSync('cd infrastructure && npx cdk outputs --json', { encoding: 'utf-8' });
    const outputs = JSON.parse(output);
    
    // 查找包含CloudFrontDomain的输出
    const stackName = Object.keys(outputs)[0]; // 假设只有一个堆栈
    const cloudFrontDomain = outputs[stackName]?.CloudFrontDomain;
    
    if (cloudFrontDomain) {
      console.log(`✅ CloudFront域名: ${cloudFrontDomain}`);
      return cloudFrontDomain;
    } else {
      console.log('⚠️ 无法获取CloudFront域名');
      return null;
    }
  } catch (error) {
    console.error('❌ 获取CloudFront域名失败:', error.message);
    return null;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 AWS部署工具');
    console.log('====================\n');

    // 检查AWS CLI配置
    if (!checkAwsCliConfig()) {
      console.log('\n请先配置AWS CLI:');
      console.log('1. 安装AWS CLI: https://aws.amazon.com/cli/');
      console.log('2. 运行 "aws configure" 并输入您的凭证');
      process.exit(1);
    }

    // 获取S3桶名称
    let bucketName = process.argv[2];
    if (!bucketName) {
      // 从package.json获取项目名称作为默认值
      let defaultName;
      try {
        const packageJson = require('./package.json');
        defaultName = packageJson.name.toLowerCase().replace(/[^a-z0-9-]/g, '-') + '-website';
      } catch (error) {
        defaultName = 'interactive-mouse-effects-website';
      }
      
      bucketName = await question(`请输入S3桶名称 (默认: ${defaultName}): `) || defaultName;
    }

    // 获取AWS区域
    let awsRegion;
    try {
      awsRegion = execSync('aws configure get region', { encoding: 'utf-8' }).trim();
    } catch (error) {
      awsRegion = 'us-east-1';
    }
    
    if (!awsRegion) {
      awsRegion = 'us-east-1';
    }
    
    const confirmRegion = await question(`将部署到AWS区域: ${awsRegion}，是否继续? (y/n): `);
    if (confirmRegion.toLowerCase() !== 'y') {
      console.log('❌ 部署已取消');
      process.exit(0);
    }

    console.log('\n📋 部署配置信息:');
    console.log(`- S3桶名称: ${bucketName}`);
    console.log(`- AWS区域: ${awsRegion}`);
    
    const confirmDeploy = await question('\n确认部署? (y/n): ');
    if (confirmDeploy.toLowerCase() !== 'y') {
      console.log('❌ 部署已取消');
      process.exit(0);
    }

    // 安装依赖
    if (!installDependencies()) {
      process.exit(1);
    }

    // 构建和导出Next.js应用
    if (!buildAndExportApp()) {
      process.exit(1);
    }

    // 更新S3桶名称
    if (!updateS3BucketName(bucketName)) {
      process.exit(1);
    }

    // 引导CDK环境
    if (!bootstrapCdkEnvironment()) {
      process.exit(1);
    }

    // 部署CDK堆栈
    if (!deployCdkStack()) {
      process.exit(1);
    }

    // 获取CloudFront域名
    const cloudFrontDomain = getCloudFrontDomain();

    console.log('\n✅ 部署完成!');
    if (cloudFrontDomain) {
      console.log(`🌐 您的网站现已上线: https://${cloudFrontDomain}`);
    } else {
      console.log('⚠️ 部署成功，但无法获取CloudFront域名');
    }
    console.log('⚙️ 您可以通过AWS管理控制台查看资源详情');

  } catch (error) {
    console.error('\n❌ 发生错误:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 执行主函数
main();