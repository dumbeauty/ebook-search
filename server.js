// 引入需要的库
const express = require('express');      // 搭建服务器
const cors = require('cors');            // 允许跨域请求
const axios = require('axios');          // 发网络请求

const app = express();
app.use(cors());                         // 开启跨域
app.use(express.json());                 // 支持JSON请求体

// 搜索接口：前端访问 /search?q=书名 触发这里
app.get('/search', async (req, res) => {
  const q = req.query.q;                 // 获取搜索关键词
  if (!q) return res.json({ results: [] });

  try {
    // 鸠摩搜书的隐藏JSON接口
    const { data } = await axios.post(
      'https://www.jiumodiary.com/search.php',
      `q=${encodeURIComponent(q)}`,      // 以表单格式发送关键词
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://www.jiumodiary.com/',
          'X-Requested-With': 'XMLHttpRequest'  // 告诉服务器这是Ajax请求
        },
        timeout: 10000                   // 10秒超时
      }
    );

    // data已经是JSON，直接提取字段
    const results = (data.result || []).map(item => ({
      title: item.title,                 // 书名
      link: item.unziplink || item.downlink,  // 下载链接
      desc: item.author || '',           // 作者
      format: item.format || '',         // 文件格式（pdf/epub等）
      size: item.size || '',             // 文件大小
      source: '鸠摩搜书'
    }));

    res.json({ results });               // 返回给前端

  } catch (err) {
    console.error(err.message, err.response?.status, err.response?.data);
    res.status(500).json({ error: '搜索失败，请稍后重试' });
  }
});

// Railway会通过环境变量PORT告诉我们用哪个端口
// 本地开发默认用3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});