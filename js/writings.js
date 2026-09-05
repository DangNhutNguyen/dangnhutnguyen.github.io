(function () {
  const config = window.PORTFOLIO_CONFIG || {};
  const writings = Array.isArray(config.writings) ? config.writings : [];
  const markdownCache = new Map();
  const options = config.writingOptions || {};
  const languages = options.languages || {
    en: { label: 'EN', name: 'English' },
    vi: { label: 'VN', name: 'Tiếng Việt' },
  };
  const defaultLanguage = languages[options.defaultLanguage]
    ? options.defaultLanguage
    : 'en';

  const defaultCopy = {
    en: {
      back: 'All writing',
      read: 'Read logbook',
      end: 'End of logbook',
      discuss: 'Discuss this note',
      previous: 'Previous',
      next: 'Next',
      missingTitle: 'Field note not found.',
      missingText:
        'The requested note may have moved or is not part of this archive yet.',
      writingOverline: 'Writing',
      languageLabel: 'Writing language',
      adjacentLabel: 'Adjacent logbooks',
      readingTime: 'min read',
      archiveLabel: 'logbooks · 2019-2026',
      emptyArchive: 'No logbooks have been added yet.',
      markdownUnavailable: 'Markdown renderer is unavailable.',
    },
    vi: {
      back: 'Tất cả bài viết',
      read: 'Đọc logbook',
      end: 'Hết logbook',
      discuss: 'Trao đổi về bài viết',
      previous: 'Bài trước',
      next: 'Bài tiếp',
      missingTitle: 'Không tìm thấy bài viết.',
      missingText:
        'Bài viết bạn tìm có thể đã được chuyển hoặc chưa nằm trong kho lưu trữ.',
      writingOverline: 'Bài viết',
      languageLabel: 'Ngôn ngữ bài viết',
      adjacentLabel: 'Các logbook liền kề',
      readingTime: 'phút đọc',
      archiveLabel: 'logbook · 2019-2026',
      emptyArchive: 'Chưa có logbook nào.',
      markdownUnavailable: 'Không thể tải trình hiển thị Markdown.',
    },
  };
  const copy = options.copy || defaultCopy;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function summarize(text) {
    const normalized = String(text || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (normalized.length <= 190) return normalized;
    return `${normalized.slice(0, 190).replace(/\s+\S*$/, '')}…`;
  }

  function readingTime(text, language) {
    const words = String(text || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const minutes = Math.max(
      1,
      Math.ceil(words / (language === 'en' ? 220 : 260)),
    );
    const labels = copy[language] || defaultCopy[language] || defaultCopy.en;
    return `${minutes} ${labels.readingTime}`;
  }

  function markdownToPlainText(source) {
    if (!window.marked?.parse) return String(source || '');
    const template = document.createElement('template');
    template.innerHTML = window.marked.parse(String(source || ''), {
      gfm: true,
      breaks: false,
    });
    return template.content.textContent || '';
  }

  const allowedMarkdownTags = new Set([
    'A',
    'BLOCKQUOTE',
    'BR',
    'CODE',
    'DEL',
    'EM',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HR',
    'IMG',
    'INPUT',
    'LI',
    'OL',
    'P',
    'PRE',
    'S',
    'STRONG',
    'SUB',
    'SUP',
    'TABLE',
    'TBODY',
    'TD',
    'TH',
    'THEAD',
    'TR',
    'UL',
  ]);
  const discardedMarkdownTags = new Set([
    'BUTTON',
    'EMBED',
    'FORM',
    'IFRAME',
    'MATH',
    'OBJECT',
    'SCRIPT',
    'STYLE',
    'SVG',
  ]);
  const allowedMarkdownAttributes = {
    A: new Set(['href', 'title']),
    CODE: new Set(['class']),
    IMG: new Set(['alt', 'height', 'src', 'title', 'width']),
    INPUT: new Set(['checked', 'disabled', 'type']),
    LI: new Set(['class']),
    OL: new Set(['start']),
    TD: new Set(['align']),
    TH: new Set(['align']),
    UL: new Set(['class']),
  };

  function isSafeMarkdownUrl(value, isImage = false) {
    const candidate = String(value || '').trim();
    if (!candidate) return false;

    // Keep ordinary Markdown paths usable when these pages are opened either
    // through a local web server or directly with the file:// protocol. An
    // explicit scheme is still checked below, so javascript: and data: remain
    // blocked by the sanitizer.
    const hasExplicitScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(candidate);
    if (!hasExplicitScheme && !candidate.startsWith('//')) return true;

    try {
      const url = new URL(candidate, window.location.href);
      return isImage
        ? ['http:', 'https:'].includes(url.protocol)
        : ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
    } catch {
      return false;
    }
  }

  function sanitizeMarkdown(fragment) {
    Array.from(fragment.querySelectorAll('*')).forEach((node) => {
      if (discardedMarkdownTags.has(node.tagName)) {
        node.remove();
        return;
      }
      if (!allowedMarkdownTags.has(node.tagName)) {
        node.replaceWith(...Array.from(node.childNodes));
        return;
      }

      const allowed = allowedMarkdownAttributes[node.tagName] || new Set();
      Array.from(node.attributes).forEach((attribute) => {
        if (!allowed.has(attribute.name)) node.removeAttribute(attribute.name);
      });

      if (node.tagName === 'A') {
        const href = node.getAttribute('href');
        if (!isSafeMarkdownUrl(href)) node.removeAttribute('href');
        else {
          const url = new URL(href, window.location.href);
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            node.target = '_blank';
            node.rel = 'noopener noreferrer';
          }
        }
      }

      if (node.tagName === 'IMG') {
        if (!isSafeMarkdownUrl(node.getAttribute('src'), true)) {
          node.remove();
          return;
        }
        node.loading = 'lazy';
        node.decoding = 'async';
      }

      if (node.tagName === 'INPUT') {
        if (node.getAttribute('type') !== 'checkbox') {
          node.remove();
          return;
        }
        node.disabled = true;
      }

      if (node.tagName === 'CODE') {
        const className = node.getAttribute('class') || '';
        const language = className.match(/(?:^|\s)language-([\w-]+)/)?.[1];
        if (language) {
          node.className = `language-${language}`;
          node.dataset.language = language;
        } else node.removeAttribute('class');
      }

      if (node.tagName === 'UL' || node.tagName === 'LI') {
        const permittedClass = node.tagName === 'UL'
          ? 'contains-task-list'
          : 'task-list-item';
        if (node.className !== permittedClass) node.removeAttribute('class');
      }
    });
    return fragment;
  }

  function renderMarkdown(source) {
    const fragment = document.createDocumentFragment();
    if (!window.marked?.parse) {
      const labels = copy[document.documentElement.lang] || copy.en || defaultCopy.en;
      fragment.append(
        element('p', 'writing-notice', labels.markdownUnavailable),
      );
      return fragment;
    }

    const template = document.createElement('template');
    template.innerHTML = window.marked.parse(String(source || ''), {
      gfm: true,
      breaks: false,
    });
    return sanitizeMarkdown(template.content);
  }

  function parseMarkdown(source, language) {
    const lines = String(source || '')
      .replace(/\r\n/g, '\n')
      .trim()
      .split('\n');
    const title = (lines.shift() || '').replace(/^#\s+/, '').trim();
    while (lines[0]?.trim() === '') lines.shift();
    const logbook = markdownToPlainText(lines.shift() || '').trim();
    const body = lines.join('\n').trim();
    const firstBlock = body.split(/\n\s*\n/, 1)[0] || '';
    const plainBody = markdownToPlainText(body);

    return {
      title,
      logbook,
      summary: summarize(markdownToPlainText(firstBlock)),
      body,
      readingTime: readingTime(plainBody, language),
    };
  }

  function categoryFor(item, language) {
    if (typeof item.category === 'string') return item.category;
    return item.category?.[language] || item.category?.[defaultLanguage] || '';
  }

  async function loadMarkdown(path) {
    if (!path) return '';
    if (!markdownCache.has(path)) {
      const bundledSource = window.WRITING_CONTENT?.[path];
      if (window.location.protocol === 'file:' && bundledSource !== undefined) {
        markdownCache.set(path, Promise.resolve(bundledSource));
        return markdownCache.get(path);
      }
      markdownCache.set(
        path,
        fetch(path).then((response) => {
          if (!response.ok) {
            throw new Error(`Could not load writing source: ${path}`);
          }
          return response.text();
        }).catch((error) => {
          if (bundledSource !== undefined) return bundledSource;
          throw error;
        }),
      );
    }
    return markdownCache.get(path);
  }

  async function localizedWriting(item, language) {
    let parsed = parseMarkdown('', language);
    const sourcePath = item.sources?.[language];
    if (sourcePath) {
      try {
        parsed = parseMarkdown(await loadMarkdown(sourcePath), language);
      } catch (error) {
        console.error(error);
      }
    }
    const translation = item.translations?.[language] || {};
    const legacy = language === defaultLanguage ? item : {};
    const translatedParagraphs = Array.isArray(translation.paragraphs)
      ? translation.paragraphs.join('\n\n')
      : '';
    const legacyParagraphs = Array.isArray(legacy.paragraphs)
      ? legacy.paragraphs.join('\n\n')
      : '';

    return {
      title: translation.title || parsed.title || legacy.title || '',
      logbook: translation.logbook || parsed.logbook || legacy.logbook || '',
      summary: translation.summary || parsed.summary || legacy.summary || '',
      body:
        translation.body ||
        translatedParagraphs ||
        parsed.body ||
        legacy.body ||
        legacyParagraphs ||
        '',
      readingTime:
        translation.readingTime ||
        parsed.readingTime ||
        legacy.readingTime ||
        '',
      category: categoryFor(item, language),
    };
  }

  function hasLanguage(item, language) {
    return Boolean(item.sources?.[language] || item.translations?.[language]);
  }

  function createLanguageToggle(item, language, onChange) {
    const control = element('div', 'writing-language-control');
    const toggle = element('div', 'writing-language-toggle');
    toggle.setAttribute('role', 'group');
    const labels = copy[language] || copy.en || defaultCopy.en;
    toggle.setAttribute('aria-label', labels.languageLabel);

    Object.keys(languages).forEach((option) => {
      const button = element(
        'button',
        '',
        languages[option].label || option.toUpperCase(),
      );
      button.type = 'button';
      button.setAttribute('aria-label', languages[option].name || option);
      button.setAttribute('aria-pressed', String(language === option));
      button.disabled = !hasLanguage(item, option);
      button.addEventListener('click', () => onChange(option));
      toggle.append(button);
    });

    control.append(toggle);
    return control;
  }

  async function renderIndex() {
    const mount = document.querySelector('[data-writing-list]');
    if (!mount) return;
    const language = defaultLanguage;
    const labels = copy[language] || copy.en;
    document.documentElement.lang = language;
    mount.replaceChildren();

    const counter = document.querySelector('[data-writing-count]');
    if (counter)
      counter.textContent = `${String(writings.length).padStart(2, '0')} ${labels.archiveLabel}`;

    if (!writings.length) {
      mount.append(
        element('p', 'writing-notice', labels.emptyArchive),
      );
      return;
    }

    const localizedWritings = await Promise.all(
      writings.map((item) => localizedWriting(item, language)),
    );

    writings.forEach((item, index) => {
      const localized = localizedWritings[index];
      const link = element('a', 'writing-card');
      link.href = `writing.html?slug=${encodeURIComponent(item.slug)}`;
      link.setAttribute('aria-label', `${labels.read}: ${localized.title}`);
      link.append(element('span', 'writing-card-index', item.index));

      const card = element('div', 'writing-card-content');
      const meta = element('div', 'writing-card-eyebrow');
      meta.append(
        element('span', '', localized.category),
        element('span', '', localized.readingTime),
      );
      card.append(
        meta,
        element('h3', '', localized.title),
        element('p', '', localized.summary),
      );

      const footer = element('div', 'writing-card-footer');
      const read = element('strong', '', labels.read);
      read.append(element('span', 'arrow', '↗'));
      footer.append(read);
      card.append(footer);
      link.append(card);
      mount.append(link);
    });
  }

  function renderDetail() {
    const mount = document.querySelector('[data-writing-detail]');
    if (!mount) return;
    const slug = new URLSearchParams(window.location.search).get('slug');
    const itemIndex = writings.findIndex((entry) => entry.slug === slug);
    const item = writings[itemIndex];
    let language = defaultLanguage;
    let drawVersion = 0;

    async function draw() {
      const version = ++drawVersion;
      const labels = copy[language] || copy.en;
      document.documentElement.lang = language;
      mount.replaceChildren();

      if (!item) {
        const error = element('div', 'writing-empty');
        error.append(element('p', 'overline', labels.writingOverline));
        error.append(element('h1', '', labels.missingTitle));
        error.append(element('p', '', labels.missingText));
        const back = element('a', 'writing-back-inline', `${labels.back} ←`);
        back.href = 'blog.html';
        error.append(back);
        mount.append(error);
        document.title = `${labels.missingTitle} - ${config.site?.name || 'Portfolio'}`;
        return;
      }

      const previous = writings[itemIndex - 1];
      const next = writings[itemIndex + 1];
      const [localized, previousLocalized, nextLocalized] = await Promise.all([
        localizedWriting(item, language),
        previous ? localizedWriting(previous, language) : null,
        next ? localizedWriting(next, language) : null,
      ]);
      if (version !== drawVersion) return;

      document.title = `${localized.title} - ${config.site?.name || 'Portfolio'}`;
      const metaDescription = document.querySelector(
        'meta[name="description"]',
      );
      if (metaDescription) metaDescription.content = localized.summary;

      const toolbar = element('div', 'writing-article-toolbar');
      const back = element('a', 'writing-back', `← ${labels.back}`);
      back.href = 'blog.html';
      toolbar.append(back);
      if (options.languageSwitcher === 'post') {
        toolbar.append(
          createLanguageToggle(item, language, (nextLanguage) => {
            language = nextLanguage;
            draw();
          }),
        );
      }
      mount.append(toolbar);

      const header = element('header', 'writing-article-header');
      header.append(
        element('p', 'overline', `${localized.category} · ${item.index}`),
      );
      header.append(element('h1', '', localized.title));
      const meta = element('div', 'writing-meta');
      meta.append(
        element('span', '', localized.logbook),
        element('span', '', localized.readingTime),
      );
      header.append(meta);
      mount.append(header);

      const body = element('div', 'writing-body');
      body.append(renderMarkdown(localized.body));
      mount.append(body);

      const end = element('div', 'writing-article-end');
      end.setAttribute('role', 'contentinfo');
      end.append(element('span', '', labels.end));
      const email = element('a', '', `${labels.discuss} ↗`);
      email.href = `mailto:${config.site?.email || 'penciltalk0910@gmail.com'}`;
      end.append(email);
      mount.append(end);

      if (previous || next) {
        const navigation = element('nav', 'writing-neighbors');
        navigation.setAttribute('aria-label', labels.adjacentLabel);
        if (previous) {
          const link = element('a');
          link.href = `writing.html?slug=${encodeURIComponent(previous.slug)}`;
          link.rel = 'prev';
          link.append(element('small', '', `← ${labels.previous}`));
          link.append(element('strong', '', previousLocalized.title));
          navigation.append(link);
        } else navigation.append(element('span'));
        if (next) {
          const link = element('a');
          link.href = `writing.html?slug=${encodeURIComponent(next.slug)}`;
          link.rel = 'next';
          link.append(element('small', '', `${labels.next} →`));
          link.append(element('strong', '', nextLocalized.title));
          navigation.append(link);
        } else navigation.append(element('span'));
        mount.append(navigation);
      }
    }

    draw();
  }

  renderIndex();
  renderDetail();
})();
