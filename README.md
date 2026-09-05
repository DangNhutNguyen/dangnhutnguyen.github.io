# Static portfolio

This folder is a standalone HTML, CSS, and JavaScript edition of the portfolio.
It does not require React, Next.js, Vinext, a package manager, or a build step.

Visible labels, ordering, page copy, projects, papers, books, and writing behavior
are controlled by `config/portfolio.config.js`.
All bilingual article text lives directly in the `writings/` folder as Markdown.
The standalone renderer reads those files when served locally and uses the
generated fallback when the HTML files are opened directly.

## Preview locally

From this folder, run:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

## Project structure

```text
html-css-js/
├── config/
│   ├── portfolio.config.js        # edit all site content and UI labels here
│   ├── README.md                  # configuration examples
│   └── generated/
│       └── writing-content.js     # generated Markdown fallback; do not edit
├── css/
│   └── styles.css                 # theme, layout, and responsive styles
├── js/
│   ├── site.js                    # shared page/header/footer renderer
│   └── writings.js                # Markdown archive and article renderer
├── writings/                      # paired English/Vietnamese Markdown articles
├── assets/
│   ├── books/                     # book PDFs
│   │   └── covers/                # book cover images
│   └── writings/                  # images used inside Markdown articles
├── vendor/                        # local third-party Markdown renderer
├── index.html                     # About
├── research.html                  # Research
├── projects.html                  # Projects + Research Papers
├── books.html                     # Books
├── blog.html                      # Writing archive
├── writing.html                   # individual article
├── activities.html                # Timeline
├── library.html                   # Library
├── papers.html                    # redirect to Works / Research Papers
└── generate-writing-content.py    # rebuilds direct-file Markdown data
```

## Pages and supporting files

- `index.html` - About
- `research.html` - Research
- `projects.html` - Works
- `papers.html` - compatibility redirect to the Research Papers section in Works
- `books.html` - Books written by Nguyễn Huỳnh Đăng Nhựt
- `blog.html` - Writing
- `writing.html` - individual writing/article view
- `activities.html` - Timeline
- `library.html` - Library
- `writings/` - all article sources as paired `*.en.md` and `*.vi.md` files
- `config/portfolio.config.js` - the single editable source for site content
- `config/generated/writing-content.js` - generated fallback for direct file opening
- `generate-writing-content.py` - builds that fallback from `writings/*.md`
- `css/styles.css` - all responsive and theme styles
- `js/site.js` - renders every page from the config and controls shared interactions
- `js/writings.js` - writing index and article renderer
- `vendor/marked.umd.js` - local Markdown renderer used by the standalone edition
- `vendor/marked-LICENSE.md` - license notice for the bundled Markdown renderer
- `assets/` - profile image, résumé, favicon, app icon, and social preview
- `assets/books/` - book PDFs and their cover images

## Update the portfolio

Open `config/portfolio.config.js` and edit the relevant section. Detailed examples
are in `config/README.md`.

- `site` - name, education, email, profile image, web icon, résumé, and footer.
- `ui` - shared button labels, loading text, units, accessibility text, and errors.
- `navigation` - menu labels and order.
- `profiles` - GitHub, LinkedIn, ORCID, or additional profiles.
- `pages.about` - introduction and current focus.
- `pages.research` - research questions and working method.
- `pages.projects.items` - projects.
- `pages.projects.papers` - papers and manuscripts shown below the projects.
- `pages.books.items` - books, language labels, page counts, covers, and PDF files.
- `pages.activities.items` - education, awards, and leadership.
- `pages.library.items` - reading topics.
- `writingOptions` - default language, EN/VN labels, and post-only language switching.
- `writings` - writing order, URL slugs, Markdown source paths, and bilingual categories.

## Add a writing

Add the English and Vietnamese Markdown files directly to `writings/`, using the
same base filename and the suffixes `.en.md` and `.vi.md`. Then add a new entry to
the `writings` array in `config/portfolio.config.js`.

When previewing through `python3 -m http.server 8080`, the browser reads the
Markdown files directly. To also support opening `blog.html` or `writing.html`
directly from the file system, refresh the Jekyll-like static bundle after editing:

```bash
python3 generate-writing-content.py
```

The article view supports Jekyll-style Markdown including headings, emphasis,
links, lists, blockquotes, fenced code blocks, tables, task lists, images, and
horizontal rules. Raw HTML is filtered before it reaches the page.

Each entry may include:

- `slug` for the article URL.
- `index` for display order.
- `sources.en` and `sources.vi` for the two Markdown file paths.
- `category.en` and `category.vi` for the localized category label.
- `translations` for optional per-language metadata overrides.

Put article images in `assets/writings/`. A more detailed example is included in that folder.
