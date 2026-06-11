const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json({ results: [] });

  try {
    // Open Library 官方公开API，无需爬虫
    const { data } = await axios.get(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20`,
      {
        headers: { 'User-Agent': 'ebook-search/1.0' },
        timeout: 15000
      }
    );

    // 提取书籍信息
    const results = (data.docs || []).map(book => ({
      title: book.title,                          // 书名
      author: (book.author_name || []).join(', '), // 作者
      year: book.first_publish_year || '',         // 出版年份
      link: `https://openlibrary.org${book.key}`, // 详情页
      // 如果有可借阅版本，提供借阅链接
      borrow: book.lending_edition_s
        ? `https://openlibrary.org/borrow/ia/${book.lending_edition_s}`
        : null,
      source: 'Open Library'
    }));

    res.json({ results });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: '搜索失败，请稍后重试' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动：http://localhost:${PORT}`);
});