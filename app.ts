import path from 'path';
import express from 'express';
import responseTime from 'response-time';
import { SassRenderer } from './src/sass-renderer';
import { MarkdownRenderer } from './src/markdown-renderer';

import config from './config.json';

// TODO clean-css

const app = express();
const port = 42069;

const contentPath = path.join(__dirname, config?.contentPath || 'content');
const publicPath = path.join(__dirname, config?.publicPath || 'public');

const md = new MarkdownRenderer();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(responseTime((req, res, time) => {
  console.log('[time]', req.url, time.toFixed(2), 'ms');
}));
app.use(new SassRenderer({
  sourcePath: publicPath
}).middleware);
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  const mdFile = 'index.md';
  const mdPath = path.join(contentPath, mdFile);

  res.render('index', {
    title: config.title,
    main: {
      html: md.render(mdPath)
    }
  });
});

// app.get('/page/*', (req, res) => {
//   console.log(req.path);
//   res.render('index');
// });

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
