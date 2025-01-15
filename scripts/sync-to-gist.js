const fs = require("fs");
const path = require("path");
const { Octokit } = require("@octokit/rest");

// 配置参数
const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const FILE_PATH = path.join(__dirname, "../../data/sites.json");

if (!GIST_ID || !GITHUB_TOKEN) {
  console.error("请设置 GIST_ID 和 GITHUB_TOKEN 环境变量");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function syncToGist() {
  try {
    // 读取本地文件
    const content = fs.readFileSync(FILE_PATH, "utf8");

    // 更新 Gist
    await octokit.rest.gists.update({
      gist_id: GIST_ID,
      files: {
        "sites.json": {
          content: content,
        },
      },
    });

    console.log("成功同步 sites.json 到 Gist");
  } catch (error) {
    console.error("同步失败:", error);
    process.exit(1);
  }
}

syncToGist();
