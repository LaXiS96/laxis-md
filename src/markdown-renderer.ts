import fs from 'fs';
import marked from 'marked';

class CacheEntry {
  mtimeMs: number = 0;
  html: string = '';
}

export class MarkdownRenderer {

  private cache: Map<string, CacheEntry> = new Map();

  constructor() { }

  /**
   * Convert Markdown source file to HTML
   * @param path path to Markdown source file
   * @returns unsanitized HTML
   */
  render(path: string): string {
    const mtimeMs = fs.statSync(path).mtimeMs;
    if (!this.cache.has(path) || mtimeMs > (this.cache.get(path)?.mtimeMs ?? 0)) {
      console.log('[md]', path);

      const md = fs.readFileSync(path);
      this.cache.set(path, {
        mtimeMs: mtimeMs,
        html: marked(md.toString())
      });
    }

    return this.cache.get(path)?.html ?? '';
  }

}
