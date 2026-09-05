# Markdown formatting and writing images

Use standard Markdown inside any `writings/*.md` article:

```md
*Italic text*

**Bold text**

***Bold and italic text***

[Open GitHub](https://github.com/)

![A short description of the image](assets/writings/article-image.jpg)
```

Image paths are resolved from `writing.html`, so a local article image should use
`assets/writings/filename.jpg`. Web image URLs beginning with `https://` also work.
Unsafe links, embedded scripts, and unsupported raw HTML are removed before the
article is shown.

Place cover images and in-article figures in this folder.

Recommended sizes:

- Cover image: `1600 × 900` pixels, JPG or WebP.
- In-article figure: at least `1200` pixels wide.

Reference a cover image from `config/portfolio.config.js` like this:

```js
cover: 'assets/writings/article-cover.jpg'
```

After editing an article, run `python3 generate-writing-content.py` from the
`html-css-js` folder so the changes also appear when opening the HTML files
directly without a local server.
