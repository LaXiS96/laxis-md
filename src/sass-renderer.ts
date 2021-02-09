import path from 'path';
import fs from 'fs';
import sass from "sass";
import { RequestHandler } from 'express';

export class SassRendererOptions {

  /**
   * Path to folder containing SCSS source files
   */
  sourcePath: string = process.cwd();

}

export class SassRenderer {

  private options: SassRendererOptions;
  private cache: Map<string, sass.Result> = new Map();

  constructor(options: SassRendererOptions) {
    this.options = options;
  }

  middleware: RequestHandler = (req, res, next) => {
    // Ignore non-CSS requests
    if (!req.path.endsWith('.css'))
      return next();

    // Derive SCSS file path from CSS request path
    const file = path.join(this.options.sourcePath, req.path).replace('.css', '.scss');
    if (!fs.existsSync(file))
      return res.status(404).end();

    // Compile unless already cached and not changed since last compilation
    const mtimeMs = fs.statSync(file).mtimeMs;
    if (!this.cache.has(req.path) || mtimeMs > (this.cache.get(req.path)?.stats.end ?? 0)) {
      console.log('[sass]', file);

      this.cache.set(req.path, sass.renderSync({
        file,
        includePaths: [path.join(process.cwd(), 'node_modules')],
        // outputStyle: (process.env.NODE_ENV === 'production') ? 'compressed' : 'expanded'
      }));
    }

    res.header('Content-Type', 'text/css');
    res.send(this.cache.get(req.path)?.css.toString());
  };

}
