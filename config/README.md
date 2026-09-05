# Content configuration

Edit `portfolio.config.js` for normal site updates. It is the single source for
visible content and interface labels; HTML, CSS, and renderer files should not
need editing when content changes.

## Main sections

- `site` — identity, role, email, profile image, web icon, résumé, footer, and Brainmade link.
- `ui` — shared interface labels such as menu actions, project/PDF buttons,
  loading messages, book/page units, and error messages.
- `navigation` — menu order, labels, and page links.
- `profiles` — GitHub, LinkedIn, ORCID, and other profile links.
- `pages.about` — introduction, current focus, explore text, and contact links.
- `pages.research` — research directions, method, and related links.
- `pages.projects` — projects plus the Research Papers section.
- `pages.books` — books, covers, PDF files, language, year, and page counts.
- `pages.activities` — timeline, awards, education, and community work.
- `pages.library` — subjects and reading notes.
- `pages.writing` — Writing page heading and contact copy.
- `writingOptions` — default language, post-only language switch, and every
  localized Writing interface label.
- `writings` — writing order, slug, Markdown file paths, and bilingual category.

## Add a project

Add an object to `pages.projects.items`:

```js
{
  year: '2026',
  title: 'Project name',
  detail: 'Short project description.',
  tags: ['AI', 'Research'],
  link: 'https://github.com/...'
}
```

Use an empty `link` to show the configured “documentation in progress” label.

## Add a research paper

Add an object to `pages.projects.papers`:

```js
{
  title: 'Paper title',
  detail: 'Topic · method · contribution',
  language: 'English',
  link: 'https://...'
}
```

## Add a book

Place its PDF in `assets/books/` and cover in `assets/books/covers/`, then add an
object to `pages.books.items`:

```js
{
  title: 'Book title',
  subtitle: 'Book subtitle',
  detail: 'Short description.',
  language: 'Vietnamese',
  year: '2026',
  pages: 120,
  cover: 'assets/books/covers/book-cover.jpg',
  file: 'assets/books/book.pdf'
}
```

The book count and total page count are calculated automatically.

## Add or edit a writing

Article bodies stay in `writings/` as paired `.en.md` and `.vi.md` files. Add or
edit the matching entry in `writings`, then refresh the direct-file fallback:

```bash
python3 generate-writing-content.py
```

Do not edit `generated/writing-content.js` manually; it is rebuilt from the
Markdown sources.
