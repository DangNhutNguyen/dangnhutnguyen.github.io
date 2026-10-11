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

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
  }

  function highlightCodeElement(codeEl, lang) {
    const rawCode = codeEl.textContent || '';
    if (!rawCode.trim()) return;

    const tokenRegex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[\s\S]*?`|(?:\/\/|#)[^\n]*|\/\*[\s\S]*?\*\/)|(\b(?:def|class|import|from|return|if|elif|else|for|while|try|except|finally|with|as|in|is|lambda|yield|async|await|break|continue|pass|const|let|var|function|new|switch|case|default|typeof|instanceof|auto|int|float|double|char|bool|void|struct|template|typename|public|private|protected|namespace|using|virtual|override|constexpr|include)\b)|(\b(?:True|False|None|true|false|null|nullptr|self|this)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_]\w*(?=\s*\())|(@\w+)/g;

    let lastIndex = 0;
    let match;
    let result = '';

    while ((match = tokenRegex.exec(rawCode)) !== null) {
      if (match.index > lastIndex) {
        result += escapeHTML(rawCode.slice(lastIndex, match.index));
      }

      if (match[1]) {
        const isComment = match[1].startsWith('#') || match[1].startsWith('//') || match[1].startsWith('/*');
        const cls = isComment ? 'token-comment' : 'token-string';
        result += `<span class="${cls}">${escapeHTML(match[1])}</span>`;
      } else if (match[2]) {
        result += `<span class="token-keyword">${escapeHTML(match[2])}</span>`;
      } else if (match[3]) {
        result += `<span class="token-boolean">${escapeHTML(match[3])}</span>`;
      } else if (match[4]) {
        result += `<span class="token-number">${escapeHTML(match[4])}</span>`;
      } else if (match[5]) {
        result += `<span class="token-function">${escapeHTML(match[5])}</span>`;
      } else if (match[6]) {
        result += `<span class="token-decorator">${escapeHTML(match[6])}</span>`;
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < rawCode.length) {
      result += escapeHTML(rawCode.slice(lastIndex));
    }

    codeEl.innerHTML = result;
  }

  function enhanceArticleContent(bodyEl, language) {
    const isVi = language === 'vi';

    // 1. Enhanced Code Blocks with language badge, dots, and copy button
    bodyEl.querySelectorAll('pre').forEach((pre) => {
      const code = pre.querySelector('code');
      if (!code) return;

      const langClass = (code.className || '').match(/language-([\w+-]+)/);
      const lang = langClass ? langClass[1] : (code.dataset.language || 'code');
      const displayLang = lang.toUpperCase();

      highlightCodeElement(code, lang);

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-container';

      const header = document.createElement('div');
      header.className = 'code-block-header';

      const left = document.createElement('div');
      left.className = 'code-header-left';
      left.innerHTML = `
        <div class="code-header-dots" aria-hidden="true">
          <span class="code-dot red"></span>
          <span class="code-dot yellow"></span>
          <span class="code-dot green"></span>
        </div>
        <span class="code-lang-badge">${escapeHTML(displayLang)}</span>
      `;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.type = 'button';
      copyBtn.setAttribute('aria-label', isVi ? 'Sao chép mã' : 'Copy code');
      copyBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>${isVi ? 'Sao chép' : 'Copy'}</span>
      `;

      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.textContent || '');
          copyBtn.classList.add('is-copied');
          copyBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${isVi ? 'Đã sao chép' : 'Copied!'}</span>
          `;
          setTimeout(() => {
            copyBtn.classList.remove('is-copied');
            copyBtn.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>${isVi ? 'Sao chép' : 'Copy'}</span>
            `;
          }, 2000);
        } catch (_) {}
      });

      header.append(left, copyBtn);
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.append(header, pre);
    });

    // 2. Images, Figures, and Galleries
    bodyEl.querySelectorAll('p').forEach((p) => {
      const images = Array.from(p.querySelectorAll('img'));
      if (images.length > 0 && p.textContent.trim() === '') {
        if (images.length === 1) {
          const img = images[0];
          const figure = document.createElement('figure');
          figure.className = 'article-figure';

          const inner = document.createElement('div');
          inner.className = 'article-figure-inner';
          img.remove();
          inner.append(img);
          figure.append(inner);

          const captionText = img.getAttribute('title') || img.getAttribute('alt');
          if (captionText && captionText.trim() && !/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(captionText.trim())) {
            const figcaption = document.createElement('figcaption');
            figcaption.textContent = captionText;
            figure.append(figcaption);
          }
          p.replaceWith(figure);
        } else {
          const gallery = document.createElement('div');
          gallery.className = 'article-gallery';
          images.forEach((img) => {
            const figure = document.createElement('figure');
            figure.className = 'article-figure';
            const inner = document.createElement('div');
            inner.className = 'article-figure-inner';
            img.remove();
            inner.append(img);
            figure.append(inner);

            const captionText = img.getAttribute('title') || img.getAttribute('alt');
            if (captionText && captionText.trim() && !/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(captionText.trim())) {
              const figcaption = document.createElement('figcaption');
              figcaption.textContent = captionText;
              figure.append(figcaption);
            }
            gallery.append(figure);
          });
          p.replaceWith(gallery);
        }
      }
    });

    // 3. Callout Notes & Tips
    bodyEl.querySelectorAll('blockquote').forEach((bq) => {
      const firstP = bq.querySelector('p');
      if (!firstP) return;
      const text = firstP.textContent.trim();

      let type = null;
      let label = '';
      let icon = '';

      if (/^\[!(NOTE|INFO)\]/i.test(text) || /^\*\*(Lưu ý|Ghi chú|Note):\*\*/i.test(text)) {
        type = 'note';
        label = isVi ? 'Ghi chú' : 'Note';
        icon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        firstP.innerHTML = firstP.innerHTML.replace(/^\[!(NOTE|INFO)\]/i, '').replace(/^\*\*(Lưu ý|Ghi chú|Note):\*\*/i, '').trim();
      } else if (/^\[!TIP\]/i.test(text) || /^\*\*(Mẹo|Gợi ý|Tip):\*\*/i.test(text)) {
        type = 'tip';
        label = isVi ? 'Mẹo thực hành' : 'Tip';
        icon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z"></path></svg>';
        firstP.innerHTML = firstP.innerHTML.replace(/^\[!TIP\]/i, '').replace(/^\*\*(Mẹo|Gợi ý|Tip):\*\*/i, '').trim();
      } else if (/^\[!(WARNING|CAUTION)\]/i.test(text) || /^\*\*(Cảnh báo|Lưu tâm|Warning):\*\*/i.test(text)) {
        type = 'warning';
        label = isVi ? 'Cảnh báo' : 'Warning';
        icon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
        firstP.innerHTML = firstP.innerHTML.replace(/^\[!(WARNING|CAUTION)\]/i, '').replace(/^\*\*(Cảnh báo|Lưu tâm|Warning):\*\*/i, '').trim();
      }

      if (type) {
        const callout = document.createElement('div');
        callout.className = `callout callout-${type}`;
        callout.innerHTML = `
          <div class="callout-header">${icon} <span>${label}</span></div>
          <div class="callout-body">${bq.innerHTML}</div>
        `;
        bq.replaceWith(callout);
      }
    });

    // 4. Responsive table wrapping
    bodyEl.querySelectorAll('table').forEach((table) => {
      if (table.parentElement?.classList.contains('table-scroll-wrapper')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'table-scroll-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.append(table);
    });
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
    'FIGCAPTION',
    'FIGURE',
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
    'MARK',
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
    CODE: new Set(['class', 'data-language']),
    FIGCAPTION: new Set(['class']),
    FIGURE: new Set(['class']),
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
      date: item.date || translation.date || '',
      updatedAt: item.updatedAt || translation.updatedAt || '',
      thought: item.thought || translation.thought || '',
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

  function pickLang(val, lang) {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[lang] || val.en || val.vi || '';
  }

  let currentLanguage = localStorage.getItem('portfolio-writing-lang') || 'en';
  let activeSearchQuery = '';
  let activeCategoryFilter = 'all';

  function openPhotoLightbox(imgSrc, titleText, captionText, noteText, metaText) {
    let modal = document.querySelector('.album-lightbox-modal');
    if (!modal) {
      modal = element('div', 'album-lightbox-modal');
      const backdrop = element('div', 'album-lightbox-backdrop');
      const dialog = element('div', 'album-lightbox-dialog');
      
      const imgWrap = element('div', 'album-lightbox-img-wrap');
      const img = element('img', 'album-lightbox-img');
      img.alt = 'Enlarged archival artifact';
      imgWrap.append(img);

      const meta = element('div', 'album-lightbox-meta');
      const metaTextEl = element('div', 'album-lightbox-meta-text');
      const heading = element('h4', 'album-lightbox-title');
      const metaBadge = element('span', 'album-lightbox-badge');
      const caption = element('p', 'album-lightbox-caption');
      const noteBox = element('div', 'album-lightbox-note-box');
      
      metaTextEl.append(heading, metaBadge, caption, noteBox);

      const closeBtn = element('button', 'album-lightbox-close');
      closeBtn.type = 'button';
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close photo');

      meta.append(metaTextEl, closeBtn);
      dialog.append(imgWrap, meta);
      modal.append(backdrop, dialog);
      document.body.append(modal);

      function closeModal() {
        modal.classList.remove('is-open');
        document.removeEventListener('keydown', handleKeyDown);
      }

      function handleKeyDown(e) {
        if (e.key === 'Escape') closeModal();
      }

      backdrop.addEventListener('click', closeModal);
      closeBtn.addEventListener('click', closeModal);
    }

    const img = modal.querySelector('.album-lightbox-img');
    const heading = modal.querySelector('.album-lightbox-title');
    const metaBadge = modal.querySelector('.album-lightbox-badge');
    const caption = modal.querySelector('.album-lightbox-caption');
    const noteBox = modal.querySelector('.album-lightbox-note-box');

    img.src = imgSrc;
    heading.textContent = titleText || '';
    if (metaBadge) {
      metaBadge.textContent = metaText || '';
      metaBadge.style.display = metaText ? 'inline-block' : 'none';
    }
    if (caption) {
      caption.textContent = captionText || '';
      caption.style.display = captionText ? 'block' : 'none';
    }
    if (noteBox) {
      if (noteText) {
        noteBox.innerHTML = `<strong>ATTACHED NOTE:</strong><p>${escapeHTML(noteText)}</p>`;
        noteBox.style.display = 'block';
      } else {
        noteBox.style.display = 'none';
      }
    }

    modal.classList.add('is-open');

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        modal.classList.remove('is-open');
        document.removeEventListener('keydown', handleKeyDown);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
  }

  let openAlbumExternal = null;

  function renderResearchInterests(language) {
    const interestsMount = document.querySelector('[data-writing-interests]');
    if (!interestsMount) return;
    const data = config.pages?.writing?.researchInterests;
    if (!data) {
      interestsMount.style.display = 'none';
      return;
    }
    const localized = data[language] || data.en || data.vi;
    if (!localized || !localized.lead) {
      interestsMount.style.display = 'none';
      return;
    }

    interestsMount.style.display = 'block';
    interestsMount.replaceChildren();

    const card = element('div', 'writing-interests-card');
    const header = element('div', 'writing-interests-header');
    const overline = element('p', 'overline', language === 'vi' ? 'Chủ đề quan tâm & Định hướng' : 'Research Interests & Open Questions');
    const title = element('h2', 'writing-interests-title', localized.title || (language === 'vi' ? 'Chủ đề & câu hỏi đang tìm hiểu' : 'Research interests & open questions'));
    header.append(overline, title);

    const body = element('p', 'writing-interests-body', localized.lead);
    card.append(header, body);
    interestsMount.append(card);
  }

  function renderExplorations(language) {
    const explorationsMount = document.querySelector('[data-writing-explorations]');
    if (!explorationsMount) return;
    const items = config.pages?.writing?.explorations;
    if (!Array.isArray(items) || !items.length) {
      explorationsMount.style.display = 'none';
      return;
    }

    const labels = copy[language] || copy.en || defaultCopy.en;
    explorationsMount.style.display = 'block';
    explorationsMount.replaceChildren();

    const header = element('div', 'writing-explorations-header');
    const overline = element('p', 'overline', language === 'vi' ? 'Dự án & Thử nghiệm thực địa' : 'Projects & Explorations');
    const title = element('h2', 'writing-explorations-title', labels.explorationsTitle || (language === 'vi' ? 'Dự án & Hướng tìm hiểu' : 'Projects & Explorations'));
    const lead = element('p', 'writing-explorations-lead', labels.explorationsSubtitle || (language === 'vi' ? 'Các dự án thực tế, triển khai mã nguồn và hướng tìm hiểu đang phát triển.' : 'Active investigations, mathematical implementations, and ongoing exploration tracks.'));
    header.append(overline, title, lead);
    explorationsMount.append(header);

    const grid = element('div', 'explorations-grid');
    items.forEach(exp => {
      const card = element('article', 'exploration-card');

      const topRow = element('div', 'exploration-top-row');
      const statusKey = exp.status || 'in-progress';
      const statusLabel = pickLang(exp.statusLabel, language) || (statusKey === 'completed' ? (language === 'vi' ? 'Đã hoàn thành' : 'Completed') : statusKey === 'paused' ? (language === 'vi' ? 'Tạm dừng' : 'Paused') : (language === 'vi' ? 'Đang thực hiện' : 'In progress'));
      const statusBadge = element('span', `exploration-status-badge status-${statusKey}`, statusLabel);
      topRow.append(statusBadge);

      const titleEl = element('h3', 'exploration-card-title', pickLang(exp.title, language) || '');
      const problemText = pickLang(exp.problem, language) || '';
      const problemEl = element('p', 'exploration-problem', problemText);

      const actionsRow = element('div', 'exploration-actions');
      if (exp.href) {
        const actionBtn = element('a', 'exploration-action-btn');
        actionBtn.href = exp.href;
        const actLabel = pickLang(exp.actionLabel, language) || (language === 'vi' ? 'Đọc ghi chép' : 'Read research notes');
        actionBtn.innerHTML = `${escapeHTML(actLabel)} <span class="arrow" aria-hidden="true">&rarr;</span>`;
        actionsRow.append(actionBtn);
      }

      if (exp.albumId) {
        const albumLink = element('a', 'exploration-album-btn');
        albumLink.href = `album-viewer.html?id=${encodeURIComponent(exp.albumId)}`;
        albumLink.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> ${language === 'vi' ? 'Xem Album thật' : 'View Album'}`;
        actionsRow.append(albumLink);
      }

      card.append(topRow, titleEl, problemEl, actionsRow);
      grid.append(card);
    });

    explorationsMount.append(grid);
  }

  function renderMemories(language) {
    const memoriesMount = document.querySelector('[data-writing-memories]');
    if (!memoriesMount) return;
    const items = config.pages?.writing?.memories;
    if (!Array.isArray(items) || !items.length) {
      memoriesMount.style.display = 'none';
      return;
    }

    memoriesMount.style.display = 'block';
    memoriesMount.replaceChildren();

    const header = element('div', 'writing-memories-header');
    const overline = element('p', 'overline', language === 'vi' ? 'Kỷ niệm & Dấu mốc cuộc đời' : 'Memories & Milestones');
    const title = element('h2', 'writing-memories-title', language === 'vi' ? 'Kỷ niệm & Dấu mốc' : 'Memories & Milestones');
    const lead = element('p', 'writing-memories-lead', language === 'vi' ? 'Những khoảnh khắc, kỷ vật, năm tháng học trò và chặng đường trưởng thành gắn liền với các ghi chép.' : 'Key moments, personal archives, childhood journeys, and memories interwoven with the field notes.');
    header.append(overline, title, lead);
    memoriesMount.append(header);

    const grid = element('div', 'memories-grid');
    items.forEach(mem => {
      const card = element('article', 'memory-card');

      const topRow = element('div', 'memory-top-row');
      const tagText = pickLang(mem.tag, language) || (language === 'vi' ? 'Kỷ niệm' : 'Memory');
      const tagBadge = element('span', 'memory-tag-badge', tagText);
      topRow.append(tagBadge);

      const titleEl = element('h3', 'memory-card-title', pickLang(mem.title, language) || '');
      const narrativeText = pickLang(mem.narrative, language) || '';
      const narrativeEl = element('p', 'memory-narrative', narrativeText);

      const actionsRow = element('div', 'memory-actions');
      if (mem.href) {
        const actionBtn = element('a', 'memory-action-btn');
        actionBtn.href = mem.href;
        const actLabel = pickLang(mem.actionLabel, language) || (language === 'vi' ? 'Đọc câu chuyện' : 'Read personal story');
        actionBtn.innerHTML = `${escapeHTML(actLabel)} <span class="arrow" aria-hidden="true">&rarr;</span>`;
        actionsRow.append(actionBtn);
      }

      if (mem.albumId) {
        const albumLink = element('a', 'memory-album-btn');
        albumLink.href = `album-viewer.html?id=${encodeURIComponent(mem.albumId)}`;
        albumLink.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> ${language === 'vi' ? 'Xem Memory Album' : 'View Memory Album'}`;
        actionsRow.append(albumLink);
      }

      card.append(topRow, titleEl, narrativeEl, actionsRow);
      grid.append(card);
    });

    memoriesMount.append(grid);
  }

  function renderWritingAlbum(language, customMount = null) {
    const rawAlbums = config.pages?.writing?.albums || config.pages?.writing?.albumPages || [];
    if (!rawAlbums.length) return;

    let container = customMount || document.querySelector('[data-standalone-album-mount]') || document.querySelector('[data-writing-album]');
    if (!container) return;

    const labels = copy[language] || copy.en || defaultCopy.en;

    // Chuẩn hóa dữ liệu album (hỗ trợ cả schema mới albums và backward-compat albumPages)
    const normalizedAlbums = rawAlbums.map((item, idx) => {
      let albumType = item.type;
      if (!albumType) {
        albumType = item.category?.en?.includes('Advocacy') ? 'Memories' : (item.category?.en?.includes('Physics') ? 'Projects' : 'Drafts');
      } else if (albumType === 'Logbook') {
        albumType = 'Projects';
      } else if (albumType === 'Moments') {
        albumType = 'Memories';
      } else if (albumType === 'Draft') {
        albumType = 'Drafts';
      }

      if (!item.pages && item.photos) {
        return {
          id: item.id || `album-${idx + 1}`,
          title: item.title,
          type: albumType,
          defaultView: item.defaultView || 'flip',
          period: item.period || '',
          version: item.version || '',
          published: item.published !== false,
          coverImage: item.coverImage || item.image,
          coverCrop: item.coverCrop || 'center center',
          lead: item.lead || item.caption,
          whatStayedWithMe: item.whatStayedWithMe || item.notes,
          pages: (item.photos || []).map(p => ({
            type: 'photo',
            image: p.src,
            title: p.title,
            caption: p.caption || '',
            date: p.date || p.meta || '',
            context: p.context || '',
            transcription: p.transcription || null,
            reflection: p.note || p.reflection,
            relatedSlug: (item.relatedSlugs && item.relatedSlugs[0]) || ''
          }))
        };
      }
      return {
        ...item,
        id: item.id || `album-${idx + 1}`,
        type: albumType,
        defaultView: item.defaultView || 'flip',
        pages: item.pages || []
      };
    });

    // Chỉ hiển thị album đã xuất bản (published !== false)
    const publicAlbums = normalizedAlbums.filter(a => a.published !== false);
    if (!publicAlbums.length) return;

    // Trạng thái cục bộ
    let activeCategory = 'all';
    let albumSearchQuery = '';
    let currentAlbumId = null;
    let currentPageIndex = 0;
    let currentViewMode = 'flip'; // 'read' hoặc 'flip'
    let savedCatalogScrollY = 0;
    let isThumbnailsOpen = false;
    let showTranscriptionMap = {};

    openAlbumExternal = (albumId) => {
      openAlbum(albumId, 0);
    };

    // Đọc URL ban đầu để hỗ trợ liên kết trực tiếp (?id=... hoặc ?album=...)
    function parseUrlParams() {
      const urlParams = new URLSearchParams(window.location.search);
      const albumParam = urlParams.get('id') || urlParams.get('album');
      const pageParam = parseInt(urlParams.get('page'), 10);
      const viewParam = urlParams.get('view');
      if (albumParam && publicAlbums.some(a => a.id === albumParam)) {
        currentAlbumId = albumParam;
        const targetAlbum = publicAlbums.find(a => a.id === albumParam);
        const maxPages = targetAlbum ? (targetAlbum.pages.length + (targetAlbum.whatStayedWithMe ? 1 : 0)) : 1;
        currentPageIndex = (!isNaN(pageParam) && pageParam >= 1 && pageParam <= maxPages) ? pageParam - 1 : 0;
        currentViewMode = (viewParam === 'read' || viewParam === 'flip') ? viewParam : (targetAlbum.defaultView || 'flip');
      } else {
        currentAlbumId = null;
        currentPageIndex = 0;
      }
    }

    function syncUrl(push = true) {
      const url = new URL(window.location.href);
      if (currentAlbumId) {
        url.searchParams.set('id', currentAlbumId);
        url.searchParams.delete('album');
        url.searchParams.set('page', String(currentPageIndex + 1));
        url.searchParams.set('view', currentViewMode);
      } else {
        url.searchParams.delete('id');
        url.searchParams.delete('album');
        url.searchParams.delete('page');
        url.searchParams.delete('view');
      }
      if (push) {
        window.history.pushState({ id: currentAlbumId, page: currentPageIndex, view: currentViewMode }, '', url.toString());
      } else {
        window.history.replaceState({ id: currentAlbumId, page: currentPageIndex, view: currentViewMode }, '', url.toString());
      }
    }

    window.addEventListener('popstate', () => {
      parseUrlParams();
      renderMain();
    });

    parseUrlParams();

    function renderMain() {
      container.replaceChildren();

      if (currentAlbumId) {
        renderAlbumReader(currentAlbumId);
      } else {
        renderAlbumCatalog();
      }
    }

    // 1. GIAO DIỆN DANH SÁCH ALBUM (CATALOG GRID VIEW)
    function renderAlbumCatalog() {
      const catalogWrap = element('div', 'album-catalog-wrap');

      // Standalone Catalog Header
      const catalogTop = element('div', 'album-viewer-catalog-top');
      const topRow = element('div', 'album-viewer-catalog-top-row');

      const backWritingLink = element('a', 'album-reader-back-writing', `← ${language === 'vi' ? 'Quay lại bài viết & sổ tay' : 'Back to writing'}`);
      backWritingLink.href = 'blog.html';

      const langToggleBox = element('div', 'album-catalog-lang-toggle');
      Object.keys(languages).forEach(opt => {
        const btn = element('button', `album-lang-btn${language === opt ? ' is-active' : ''}`, languages[opt].label || opt.toUpperCase());
        btn.type = 'button';
        btn.addEventListener('click', () => {
          if (currentLanguage !== opt) {
            currentLanguage = opt;
            localStorage.setItem('portfolio-writing-lang', currentLanguage);
            renderWritingAlbum(currentLanguage, container);
          }
        });
        langToggleBox.append(btn);
      });

      topRow.append(backWritingLink, langToggleBox);

      const titleBox = element('div', 'album-viewer-catalog-title-box');
      titleBox.append(
        element('p', 'overline', language === 'vi' ? 'Kho tư liệu & Sổ tay thực địa' : 'Visual Archive & Field Notebooks'),
        element('h1', 'album-viewer-catalog-heading', language === 'vi' ? 'Sổ tay, Bản vẽ & Album tư liệu' : 'Notebooks, Schematics & Visual Albums'),
        element('p', 'album-viewer-catalog-desc', language === 'vi' ? 'Khám phá các trang sổ tay scan thực tế, sơ đồ mạch, nhật ký học tập và tư liệu ảnh đúc kết từ 2019 đến 2026. Lật từng trang để xem ghi chú và suy ngẫm.' : 'Explore original scanned notebooks, circuit schematics, learning journals, and archival photographs from 2019 to 2026. Flip through pages to inspect handwritten notes, transcriptions, and reflections.')
      );

      catalogTop.append(topRow, titleBox);
      catalogWrap.append(catalogTop);

      // Nhận diện các phân loại thực tế đang có
      const availableTypes = new Set(publicAlbums.map(a => a.type));
      const filterPills = [{ key: 'all', label: labels.filterAll || (language === 'vi' ? 'Tất cả' : 'All') }];
      if (availableTypes.has('Projects')) {
        filterPills.push({ key: 'Projects', label: language === 'vi' ? 'Dự án (Album thật)' : 'Projects & Schematics' });
      }
      if (availableTypes.has('Memories')) {
        filterPills.push({ key: 'Memories', label: language === 'vi' ? 'Kỷ niệm (Memory Album)' : 'Memory Albums' });
      }
      if (availableTypes.has('Notebooks')) filterPills.push({ key: 'Notebooks', label: labels.filterNotebooks || 'Notebooks' });
      if (availableTypes.has('Drafts')) filterPills.push({ key: 'Drafts', label: labels.filterDrafts || 'Drafts' });
      if (availableTypes.has('Photos')) filterPills.push({ key: 'Photos', label: labels.filterPhotos || 'Photos' });
      availableTypes.forEach(t => {
        if (!['Projects', 'Memories', 'Notebooks', 'Drafts', 'Photos'].includes(t)) {
          filterPills.push({ key: t, label: t });
        }
      });

      // Thanh công cụ tìm kiếm và bộ lọc album
      const toolbar = element('div', 'album-catalog-toolbar');

      // Thanh tìm kiếm nhanh album
      const searchBox = element('div', 'album-search-box');
      const searchIcon = element('span', 'album-search-icon');
      searchIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
      const searchInput = element('input', 'album-search-input');
      searchInput.type = 'search';
      searchInput.value = albumSearchQuery;
      searchInput.placeholder = labels.searchAlbumsPlaceholder || (language === 'vi' ? 'Tìm sổ tay theo tên, từ khóa…' : 'Filter notebooks by name or concept…');
      searchInput.addEventListener('input', (e) => {
        albumSearchQuery = e.target.value.trim().toLowerCase();
        renderMain();
      });
      searchBox.append(searchIcon, searchInput);
      toolbar.append(searchBox);

      // Chỉ hiển thị thanh lọc nếu có từ 2 danh mục trở lên
      if (filterPills.length > 2) {
        const filterBar = element('div', 'album-catalog-filter-bar');
        filterPills.forEach(f => {
          const pillBtn = element('button', `album-catalog-pill${activeCategory === f.key ? ' is-active' : ''}`, f.label);
          pillBtn.type = 'button';
          pillBtn.addEventListener('click', () => {
            activeCategory = f.key;
            renderMain();
          });
          filterBar.append(pillBtn);
        });
        toolbar.append(filterBar);
      }

      catalogWrap.append(toolbar);

      // Lưới album (Desktop 2 cột, Mobile 1 cột, không phụ thuộc vào hover)
      const grid = element('div', 'album-catalog-grid');
      let filteredList = activeCategory === 'all' 
        ? publicAlbums 
        : publicAlbums.filter(a => (a.type || '').toLowerCase() === activeCategory.toLowerCase());

      if (albumSearchQuery) {
        filteredList = filteredList.filter(a => {
          const tVi = (typeof a.title === 'object' ? a.title.vi : a.title || '').toLowerCase();
          const tEn = (typeof a.title === 'object' ? a.title.en : a.title || '').toLowerCase();
          const lVi = (typeof a.lead === 'object' ? a.lead.vi : a.lead || '').toLowerCase();
          const lEn = (typeof a.lead === 'object' ? a.lead.en : a.lead || '').toLowerCase();
          const p = (a.period || '').toLowerCase();
          const typ = (a.type || '').toLowerCase();
          return tVi.includes(albumSearchQuery) || tEn.includes(albumSearchQuery) ||
                 lVi.includes(albumSearchQuery) || lEn.includes(albumSearchQuery) ||
                 p.includes(albumSearchQuery) || typ.includes(albumSearchQuery);
        });
      }

      if (!filteredList.length) {
        const emptyBox = element('div', 'album-empty-state');
        emptyBox.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <p>${language === 'vi' ? 'Không tìm thấy sổ tay hoặc bộ tư liệu phù hợp.' : 'No matching notebooks or visual albums found.'}</p>
        `;
        catalogWrap.append(emptyBox);
        container.append(catalogWrap);
        return;
      }

      filteredList.forEach(album => {
        const card = element('article', 'album-cover-card');

        // Bìa ảnh đại diện
        const coverFrame = element('div', 'album-cover-frame');
        const img = element('img', 'album-cover-img');
        const initialSrc = album.coverImage || (album.pages[0]?.image) || 'assets/profile.jpg';
        img.src = initialSrc;
        img.alt = pickLang(album.title, language) || 'Album cover';
        img.loading = 'lazy';
        img.addEventListener('error', () => {
          img.src = 'assets/profile.jpg';
        });
        if (album.coverCrop) {
          img.style.objectPosition = album.coverCrop;
        }

        const tagBadges = element('div', 'album-cover-badges');
        const typeBadge = element('span', 'album-type-badge', album.type || 'Notebooks');
        tagBadges.append(typeBadge);

        if (album.period) {
          const periodBadge = element('span', 'album-period-badge', album.period);
          tagBadges.append(periodBadge);
        }

        coverFrame.append(img, tagBadges);

        // Nội dung tóm lược của bìa
        const body = element('div', 'album-cover-body');

        const titleText = pickLang(album.title, language) || '';
        const titleEl = element('h3', 'album-cover-title', titleText);

        const metaRow = element('div', 'album-cover-meta-row');
        const pageCountText = `${album.pages.length} ${labels.pagesLabel || 'pages'}`;
        const pageCountEl = element('span', 'album-cover-count', pageCountText);
        metaRow.append(pageCountEl);

        if (album.version) {
          const verEl = element('span', 'album-cover-ver', album.version);
          metaRow.append(verEl);
        }

        const leadText = pickLang(album.lead, language) || '';
        const leadEl = element('p', 'album-cover-lead', leadText);

        // Nút hành động Mở xem album
        const openBtn = element('button', 'album-open-action-btn');
        openBtn.type = 'button';
        openBtn.innerHTML = `${escapeHTML(labels.openAlbum || 'View album')} <span class="arrow" aria-hidden="true">&rarr;</span>`;
        openBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          savedCatalogScrollY = window.scrollY;
          openAlbum(album.id);
        });

        body.append(titleEl, metaRow, leadEl, openBtn);

        card.append(coverFrame, body);
        card.addEventListener('click', () => {
          savedCatalogScrollY = window.scrollY;
          openAlbum(album.id);
        });

        grid.append(card);
      });

      catalogWrap.append(grid);
      container.append(catalogWrap);
    }

    function openAlbum(albumId, targetPage = 0, viewMode = null) {
      currentAlbumId = albumId;
      currentPageIndex = targetPage;
      const targetAlbum = publicAlbums.find(a => a.id === albumId);
      currentViewMode = viewMode || (targetAlbum ? targetAlbum.defaultView : 'flip') || 'flip';
      syncUrl(true);
      renderMain();
      // Cuộn êm lên phần mở đầu album
      const topOffset = container.getBoundingClientRect().top + window.scrollY - 30;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    }

    function closeAlbumReader() {
      currentAlbumId = null;
      currentPageIndex = 0;
      syncUrl(true);
      renderMain();
      window.scrollTo({ top: Math.max(0, savedCatalogScrollY), behavior: 'smooth' });
    }

    // 2. GIAO DIỆN TRÌNH XEM ALBUM (PAGES & MOMENTS READER VIEW)
    function renderAlbumReader(albumId) {
      const album = publicAlbums.find(a => a.id === albumId);
      if (!album) {
        closeAlbumReader();
        return;
      }

      const reader = element('div', 'album-reader-view');

      // Top Bar: Trở lại danh sách + Thông tin album + Bộ chuyển đổi chế độ xem
      const topBar = element('div', 'album-reader-topbar');

      const headerLeft = element('div', 'album-reader-header-left');
      
      const navLinks = element('div', 'album-reader-nav-links');
      const backWritingLink = element('a', 'album-reader-back-writing', `← ${language === 'vi' ? 'Quay lại bài viết & sổ tay' : 'Back to writing'}`);
      backWritingLink.href = 'blog.html';

      const backBtn = element('button', 'album-reader-back-btn');
      backBtn.type = 'button';
      backBtn.innerHTML = `<span aria-hidden="true">&larr;</span> ${escapeHTML(labels.backToAlbums || (language === 'vi' ? 'Tất cả album' : 'All albums'))}`;
      backBtn.addEventListener('click', () => {
        closeAlbumReader();
      });
      navLinks.append(backWritingLink, backBtn);

      const albumMetaWrap = element('div', 'album-reader-meta-wrap');
      const overline = element('div', 'album-reader-overline');
      overline.innerHTML = `<strong>${escapeHTML(album.type || 'Notebooks')}</strong> · ${escapeHTML(album.period || '')}${album.version ? ` · <span>${escapeHTML(album.version)}</span>` : ''}`;

      const titleEl = element('h3', 'album-reader-title', pickLang(album.title, language) || '');
      const leadEl = element('p', 'album-reader-lead', pickLang(album.lead, language) || '');

      albumMetaWrap.append(overline, titleEl, leadEl);
      headerLeft.append(navLinks, albumMetaWrap);

      const headerRight = element('div', 'album-reader-header-right');

      // Bộ chuyển đổi chế độ xem: Read vs Flip through
      const viewSwitcher = element('div', 'album-view-switcher');
      viewSwitcher.setAttribute('role', 'group');
      viewSwitcher.setAttribute('aria-label', 'Album reading mode');

      const readModeBtn = element('button', `album-view-btn${currentViewMode === 'read' ? ' is-active' : ''}`);
      readModeBtn.type = 'button';
      readModeBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> ${escapeHTML(labels.readMode || 'Read')}`;
      readModeBtn.addEventListener('click', () => {
        if (currentViewMode !== 'read') {
          currentViewMode = 'read';
          syncUrl(false);
          renderMain();
          // Cuộn đến trang đang đọc
          setTimeout(() => {
            const targetCard = container.querySelector(`.album-read-page-card[data-page-index="${currentPageIndex}"]`);
            if (targetCard) {
              targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 60);
        }
      });

      const flipModeBtn = element('button', `album-view-btn${currentViewMode === 'flip' ? ' is-active' : ''}`);
      flipModeBtn.type = 'button';
      flipModeBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> ${escapeHTML(labels.flipMode || 'Flip through')}`;
      flipModeBtn.addEventListener('click', () => {
        if (currentViewMode !== 'flip') {
          currentViewMode = 'flip';
          syncUrl(false);
          renderMain();
        }
      });

      viewSwitcher.append(readModeBtn, flipModeBtn);

      const langToggle = element('div', 'album-reader-lang-toggle');
      Object.keys(languages).forEach(opt => {
        const btn = element('button', `album-lang-btn${language === opt ? ' is-active' : ''}`, languages[opt].label || opt.toUpperCase());
        btn.type = 'button';
        btn.addEventListener('click', () => {
          if (currentLanguage !== opt) {
            currentLanguage = opt;
            localStorage.setItem('portfolio-writing-lang', currentLanguage);
            renderWritingAlbum(currentLanguage, container);
          }
        });
        langToggle.append(btn);
      });

      headerRight.append(viewSwitcher, langToggle);
      topBar.append(headerLeft, headerRight);
      reader.append(topBar);

      // Tổng số trang hiển thị
      const hasWhatStayed = Boolean(album.whatStayedWithMe);
      const totalDisplayPages = album.pages.length + (hasWhatStayed ? 1 : 0);
      if (currentPageIndex >= totalDisplayPages) currentPageIndex = 0;

      // CHẾ ĐỘ 1: READ MODE (CUỘN DỌC LIÊN TỤC CHO NỘI DUNG DÀI)
      if (currentViewMode === 'read') {
        const streamContainer = element('div', 'album-read-stream');

        album.pages.forEach((pData, pIdx) => {
          const cardWrap = element('article', 'album-read-page-card');
          cardWrap.dataset.pageIndex = String(pIdx);

          const cardHeader = element('div', 'album-read-card-header');
          const pageNumBadge = element('span', 'album-read-card-num', `${labels.pageCounter || 'Page'} ${pIdx + 1} / ${totalDisplayPages}`);
          const typeLabel = element('span', 'album-read-card-type', pData.type === 'text' ? (language === 'vi' ? 'Trang ghi chép' : 'Text Note') : (language === 'vi' ? 'Hình ảnh tư liệu' : 'Visual Artifact'));
          cardHeader.append(pageNumBadge, typeLabel);

          const pageContent = renderSinglePageContent(pData, album, pIdx);
          cardWrap.append(cardHeader, pageContent);
          streamContainer.append(cardWrap);
        });

        if (hasWhatStayed) {
          const closingWrap = element('article', 'album-read-page-card album-read-closing-card');
          closingWrap.dataset.pageIndex = String(album.pages.length);

          const closingHeader = element('div', 'album-read-card-header');
          const closingBadge = element('span', 'album-read-card-num', labels.whatStayedLabel || 'What stayed with me');
          closingHeader.append(closingBadge);

          const closingPageEl = element('div', 'album-page-closing');
          const heading = element('h4', 'album-closing-title', pickLang(album.title, language) || '');
          const closingBody = element('div', 'album-closing-body');
          const essayP = element('p', 'album-closing-text', pickLang(album.whatStayedWithMe, language) || '');
          closingBody.append(essayP);
          closingPageEl.append(heading, closingBody);

          closingWrap.append(closingHeader, closingPageEl);
          streamContainer.append(closingWrap);
        }

        // Theo dõi cuộn để đồng bộ currentPageIndex
        if (typeof IntersectionObserver !== 'undefined') {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const idx = parseInt(entry.target.dataset.pageIndex, 10);
                if (!isNaN(idx) && idx !== currentPageIndex) {
                  currentPageIndex = idx;
                  syncUrl(false);
                }
              }
            });
          }, { threshold: 0.4 });

          streamContainer.querySelectorAll('.album-read-page-card').forEach(card => {
            observer.observe(card);
          });
        }

        reader.append(streamContainer);
      } else {
        // CHẾ ĐỘ 2: FLIP THROUGH MODE (LẬT TRANG MÔ PHỎNG SỔ TAY)
        const bookStage = element('div', 'album-book-stage');
        const bookPaper = element('div', 'album-book-paper');

        const isClosingPage = hasWhatStayed && currentPageIndex === album.pages.length;

        if (isClosingPage) {
          const closingPageEl = element('div', 'album-page-closing');
          const closingHeader = element('div', 'album-closing-header');
          const badge = element('span', 'album-closing-badge', labels.whatStayedLabel || 'What stayed with me');
          const heading = element('h4', 'album-closing-title', pickLang(album.title, language) || '');
          closingHeader.append(badge, heading);

          const closingBody = element('div', 'album-closing-body');
          const essayP = element('p', 'album-closing-text', pickLang(album.whatStayedWithMe, language) || '');
          closingBody.append(essayP);

          const restartBtn = element('button', 'album-restart-btn');
          restartBtn.type = 'button';
          restartBtn.innerHTML = `&larr; ${escapeHTML(labels.pagePrev || 'Previous page')}`;
          restartBtn.addEventListener('click', () => {
            goToPage(currentPageIndex - 1);
          });

          closingPageEl.append(closingHeader, closingBody, restartBtn);
          bookPaper.append(closingPageEl);
        } else {
          const pageData = album.pages[currentPageIndex];
          const pageItemEl = renderSinglePageContent(pageData, album, currentPageIndex);
          bookPaper.append(pageItemEl);
        }

        bookStage.append(bookPaper);
        reader.append(bookStage);

        // THANH ĐIỀU HƯỚNG DƯỚI (PAGINATION CONTROLS)
        const navBar = element('div', 'album-reader-navbar');

        const prevBtn = element('button', 'album-page-nav-btn album-btn-prev');
        prevBtn.type = 'button';
        prevBtn.disabled = currentPageIndex === 0;
        prevBtn.innerHTML = `<span aria-hidden="true">&larr;</span> ${escapeHTML(labels.pagePrev || 'Previous page')}`;
        prevBtn.addEventListener('click', () => {
          if (currentPageIndex > 0) goToPage(currentPageIndex - 1, 'prev');
        });

        const centerInfo = element('div', 'album-page-center-info');
        const counterText = `${labels.pageCounter || 'Page'} ${currentPageIndex + 1} ${labels.ofLabel || 'of'} ${totalDisplayPages}`;
        const pageCounterEl = element('span', 'album-page-counter-badge', counterText);

        const thumbToggleBtn = element('button', 'album-thumb-toggle-btn');
        thumbToggleBtn.type = 'button';
        thumbToggleBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> ${escapeHTML(labels.viewThumbnails || 'Thumbnails')}`;
        thumbToggleBtn.addEventListener('click', () => {
          isThumbnailsOpen = !isThumbnailsOpen;
          thumbToggleBtn.classList.toggle('is-active', isThumbnailsOpen);
          thumbDrawer.classList.toggle('is-open', isThumbnailsOpen);
        });

        centerInfo.append(pageCounterEl, thumbToggleBtn);

        const nextBtn = element('button', 'album-page-nav-btn album-btn-next');
        nextBtn.type = 'button';
        nextBtn.disabled = currentPageIndex === totalDisplayPages - 1;
        nextBtn.innerHTML = `${escapeHTML(labels.pageNext || 'Next page')} <span aria-hidden="true">&rarr;</span>`;
        nextBtn.addEventListener('click', () => {
          if (currentPageIndex < totalDisplayPages - 1) goToPage(currentPageIndex + 1, 'next');
        });

        navBar.append(prevBtn, centerInfo, nextBtn);
        reader.append(navBar);

        // NGĂN THUMBNAIL (THUMBNAIL DRAWER)
        const thumbDrawer = element('div', `album-thumb-drawer${isThumbnailsOpen ? ' is-open' : ''}`);
        const thumbList = element('div', 'album-thumb-list');

        album.pages.forEach((p, pIdx) => {
          const thumbCard = element('button', `album-thumb-item${pIdx === currentPageIndex ? ' is-active' : ''}`);
          thumbCard.type = 'button';
          
          if (p.type === 'photo' && p.image) {
            const tImg = element('img', 'album-thumb-img');
            tImg.src = p.image;
            tImg.alt = pickLang(p.title, language) || `Page ${pIdx + 1}`;
            tImg.loading = 'lazy';
            thumbCard.append(tImg);
          } else {
            const tText = element('div', 'album-thumb-text-preview');
            tText.textContent = pickLang(p.title, language) || `P.${pIdx + 1}`;
            thumbCard.append(tText);
          }

          const tLabel = element('span', 'album-thumb-num', String(pIdx + 1));
          thumbCard.append(tLabel);

          thumbCard.addEventListener('click', () => {
            goToPage(pIdx);
          });
          thumbList.append(thumbCard);
        });

        if (hasWhatStayed) {
          const stayThumb = element('button', `album-thumb-item album-thumb-closing${currentPageIndex === album.pages.length ? ' is-active' : ''}`);
          stayThumb.type = 'button';
          stayThumb.innerHTML = `<div class="album-thumb-text-preview">&bull;</div><span class="album-thumb-num">${labels.whatStayedLabel || 'Closing'}</span>`;
          stayThumb.addEventListener('click', () => {
            goToPage(album.pages.length);
          });
          thumbList.append(stayThumb);
        }

        thumbDrawer.append(thumbList);
        reader.append(thumbDrawer);

        function goToPage(targetIdx, direction = 'next') {
          if (targetIdx < 0 || targetIdx >= totalDisplayPages) return;
          currentPageIndex = targetIdx;
          syncUrl(false);

          bookPaper.classList.remove('flip-in-next', 'flip-in-prev');
          void bookPaper.offsetWidth;
          bookPaper.classList.add(direction === 'prev' ? 'flip-in-prev' : 'flip-in-next');

          renderMain();
        }
      }

      // Điều hướng bàn phím khi đang trong trình xem
      function handleKeyNav(e) {
        if (e.key === 'ArrowLeft') {
          if (currentViewMode === 'flip' && currentPageIndex > 0) {
            currentPageIndex--;
            syncUrl(false);
            renderMain();
          }
        } else if (e.key === 'ArrowRight') {
          if (currentViewMode === 'flip' && currentPageIndex < totalDisplayPages - 1) {
            currentPageIndex++;
            syncUrl(false);
            renderMain();
          }
        } else if (e.key === 'Escape') {
          closeAlbumReader();
        }
      }

      reader.tabIndex = 0;
      reader.addEventListener('keydown', handleKeyNav);

      // Cảm ứng vuốt trên thiết bị di động
      let touchStartX = 0;
      reader.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      reader.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (currentViewMode === 'flip') {
          if (touchEndX < touchStartX - 50) {
            if (currentPageIndex < totalDisplayPages - 1) {
              currentPageIndex++;
              syncUrl(false);
              renderMain();
            }
          } else if (touchEndX > touchStartX + 50) {
            if (currentPageIndex > 0) {
              currentPageIndex--;
              syncUrl(false);
              renderMain();
            }
          }
        }
      }, { passive: true });

      container.append(reader);
    }

    // 3. HIỂN THỊ NỘI DUNG 1 TRANG: PHOTO / TEXT / SCAN KÈM SUY NGẪM
    function renderSinglePageContent(pageData, album, pageIdx) {
      const pageWrap = element('div', `album-page-content-wrap layout-${pageData.type || 'photo'}`);

      // TRƯỜNG HỢP 1: TRANG CHỈ CÓ CHỮ (DẪN DẮT CÂU CHUYỆN)
      if (pageData.type === 'text') {
        const textCol = element('div', 'album-text-page-col');
        
        if (pageData.date || pageData.context) {
          const pMeta = element('span', 'album-text-page-meta', `${pageData.date || ''}${pageData.context ? ` · ${pageData.context}` : ''}`);
          textCol.append(pMeta);
        }

        const titleText = pickLang(pageData.title, language);
        if (titleText) {
          textCol.append(element('h4', 'album-text-page-heading', titleText));
        }

        const reflectionText = pickLang(pageData.reflection, language);
        if (reflectionText) {
          const bodyEl = element('div', 'album-text-page-body');
          reflectionText.split('\n\n').forEach(paragraph => {
            if (paragraph.trim()) {
              bodyEl.append(element('p', '', paragraph.trim()));
            }
          });
          textCol.append(bodyEl);
        }

        if (pageData.relatedSlug) {
          const matchedWriting = writings.find(w => w.slug === pageData.relatedSlug);
          if (matchedWriting) {
            const relLink = element('a', 'album-connected-writing-link');
            relLink.href = `writing.html?slug=${encodeURIComponent(matchedWriting.slug)}`;
            relLink.innerHTML = `<span class="tag">${escapeHTML(labels.connectedWritingLabel || 'Connected writing')}</span> <strong>${escapeHTML(pickLang(matchedWriting.thought, language) || matchedWriting.slug)}</strong> <span class="arrow" aria-hidden="true">&rarr;</span>`;
            textCol.append(relLink);
          }
        }

        pageWrap.append(textCol);
        return pageWrap;
      }

      // TRƯỜNG HỢP 2: TRANG CÓ ẢNH / ẢNH SCAN + CHIA SẺ
      const visualCol = element('div', 'album-visual-col');

      // Khung ảnh bảo toàn trọn vẹn tỉ lệ thực (không cắt chữ viết tay hay mép trang)
      const frame = element('div', 'album-scan-frame');
      const img = element('img', 'album-scan-img');
      img.src = pageData.image;
      const localizedTitle = pickLang(pageData.title, language) || `Plate ${pageIdx + 1}`;
      img.alt = localizedTitle;
      img.loading = 'eager';

      // Nút phóng to ảnh chi tiết
      const zoomBtn = element('button', 'album-scan-zoom-btn');
      zoomBtn.type = 'button';
      zoomBtn.title = labels.zoomImage || 'Zoom image';
      zoomBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg> ${escapeHTML(labels.zoomImage || 'Zoom image')}`;
      zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openPhotoLightbox(
          pageData.image,
          localizedTitle,
          pickLang(pageData.caption, language),
          pickLang(pageData.reflection, language),
          pageData.date || album.period
        );
      });

      frame.append(img, zoomBtn);
      frame.addEventListener('click', () => {
        openPhotoLightbox(
          pageData.image,
          localizedTitle,
          pickLang(pageData.caption, language),
          pickLang(pageData.reflection, language),
          pageData.date || album.period
        );
      });

      visualCol.append(frame);

      // Cột ghi chú và chia sẻ đi cùng ảnh (Desktop bên phải, Mobile ở dưới)
      const narrativeCol = element('div', 'album-narrative-col');

      // Metadata ngày & bối cảnh
      if (pageData.date || pageData.context) {
        const metaLine = element('div', 'album-page-context-meta');
        metaLine.textContent = `${pageData.date || ''}${pageData.context ? ` · ${pageData.context}` : ''}`;
        narrativeCol.append(metaLine);
      }

      // Tiêu đề ngắn của trang
      if (localizedTitle) {
        narrativeCol.append(element('h4', 'album-page-entry-title', localizedTitle));
      }

      // Chú thích ảnh (Caption)
      const localizedCaption = pickLang(pageData.caption, language);
      if (localizedCaption) {
        const captionEl = element('p', 'album-page-caption-text', localizedCaption);
        narrativeCol.append(captionEl);
      }

      // Tùy chọn xem bản chép lại (Read transcription) nếu có chữ viết tay
      const localizedTranscription = pickLang(pageData.transcription, language);
      if (localizedTranscription) {
        const transKey = `${album.id}-${pageIdx}`;
        const isTransOpen = Boolean(showTranscriptionMap[transKey]);

        const transToggle = element('button', `album-transcription-btn${isTransOpen ? ' is-active' : ''}`);
        transToggle.type = 'button';
        transToggle.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> ${isTransOpen ? escapeHTML(labels.hideTranscription || 'Hide transcription') : escapeHTML(labels.readTranscription || 'Read transcription')}`;
        
        const transBox = element('div', `album-transcription-box${isTransOpen ? ' is-open' : ''}`);
        transBox.innerHTML = `<strong>TRANSCRIPTION:</strong><p>${escapeHTML(localizedTranscription)}</p>`;

        transToggle.addEventListener('click', () => {
          showTranscriptionMap[transKey] = !showTranscriptionMap[transKey];
          renderMain();
        });

        narrativeCol.append(transToggle, transBox);
      }

      // Đoạn chia sẻ suy ngẫm (Field Reflection / What I realized)
      const localizedReflection = pickLang(pageData.reflection, language);
      if (localizedReflection) {
        const refBox = element('div', 'album-reflection-card');
        const refTag = element('span', 'album-reflection-tag', labels.reflectionLabel || 'Field Reflection');
        const refText = element('p', 'album-reflection-text', localizedReflection);
        refBox.append(refTag, refText);
        narrativeCol.append(refBox);
      }

      // Liên kết tới bài Writing liên quan
      if (pageData.relatedSlug) {
        const matchedWriting = writings.find(w => w.slug === pageData.relatedSlug);
        if (matchedWriting) {
          const relLink = element('a', 'album-connected-writing-link');
          relLink.href = `writing.html?slug=${encodeURIComponent(matchedWriting.slug)}`;
          relLink.innerHTML = `<span class="tag">${escapeHTML(labels.connectedWritingLabel || 'Connected writing')}</span> <strong>${escapeHTML(pickLang(matchedWriting.thought, language) || matchedWriting.slug)}</strong> <span class="arrow" aria-hidden="true">&rarr;</span>`;
          narrativeCol.append(relLink);
        }
      }

      pageWrap.append(visualCol, narrativeCol);
      return pageWrap;
    }

    renderMain();
  }

  async function renderIndex() {
    const language = currentLanguage;
    const labels = copy[language] || copy.en || defaultCopy.en;
    const introOverline = document.querySelector('.page-intro .overline');
    const introTitle = document.querySelector('.page-intro h1');
    const introLead = document.querySelector('.page-intro p:not(.overline)');
    if (introOverline) introOverline.textContent = language === 'vi' ? 'Bài viết & Sổ tay' : 'Writing';
    if (introTitle) introTitle.textContent = language === 'vi' ? 'Sổ tay thực địa.' : 'Field notes.';
    if (introLead) introLead.textContent = language === 'vi' ? 'Nhật ký nghiên cứu, ghi chép học tập và đúc kết dự án. Viết chậm rãi, hiệu đính cẩn trọng.' : 'Research logs, learning notes, and project retrospectives. Written slowly, revised carefully.';

    const reachSection = document.querySelector('.section.reach');
    if (reachSection) {
      const reachH2 = reachSection.querySelector('h2');
      const reachP = reachSection.querySelector('.prose');
      const reachLink = reachSection.querySelector('.inline-links a');
      if (reachH2) reachH2.textContent = language === 'vi' ? 'Câu hỏi tạo nên những bài luận hay.' : 'Questions make good essays.';
      if (reachP) reachP.textContent = language === 'vi' ? 'Nếu một ghi chép kết nối với công việc của bạn, tôi rất vui được lắng nghe phản hồi.' : 'If a note connects with your work, I would be glad to hear from you.';
      if (reachLink) reachLink.innerHTML = (language === 'vi' ? 'Bắt đầu trò chuyện' : 'Start a conversation') + ' <span class="arrow" aria-hidden="true">↗</span>';
    }

    const overlineEl = document.querySelector('[data-album-overline]');
    if (overlineEl) overlineEl.textContent = labels.albumLogbooksOverline || 'Visual Archive & Field Notes';

    const titleEl = document.querySelector('[data-album-title]');
    if (titleEl) titleEl.textContent = labels.albumLogbooksTitle || 'Album Logbooks';

    const subtitleEl = document.querySelector('[data-album-subtitle]');
    if (subtitleEl) subtitleEl.textContent = labels.albumLogbooksSubtitle || 'An archival timeline of research plates, apparatus schematics, and field logbooks from 2019 to 2026.';

    const langToggleMount = document.querySelector('[data-writing-language-control]');
    if (langToggleMount) {
      langToggleMount.replaceChildren();
      const toggleGroup = element('div', 'writing-language-toggle');
      toggleGroup.setAttribute('role', 'group');
      toggleGroup.setAttribute('aria-label', labels.languageLabel || 'Writing language');

      Object.keys(languages).forEach((option) => {
        const btn = element('button', '', languages[option].label || option.toUpperCase());
        btn.type = 'button';
        btn.setAttribute('aria-pressed', String(language === option));
        btn.addEventListener('click', () => {
          if (currentLanguage !== option) {
            currentLanguage = option;
            localStorage.setItem('portfolio-writing-lang', currentLanguage);
            renderIndex();
          }
        });
        toggleGroup.append(btn);
      });
      langToggleMount.append(toggleGroup);
    }

    renderResearchInterests(language);
    renderExplorations(language);
    renderMemories(language);
    renderWritingAlbum(language);

    const listHeadingEl = document.querySelector('[data-writings-heading]');
    if (listHeadingEl) listHeadingEl.textContent = labels.bottomWritingHeading || 'Shared Field Notes & Logbooks';

    const counterEl = document.querySelector('[data-writing-count]');
    if (counterEl) {
      counterEl.textContent = `${String(writings.length).padStart(2, '0')} ${labels.archiveLabel}`;
    }

    const mount = document.querySelector('[data-writing-list]');
    if (!mount) return;

    const localizedWritings = await Promise.all(
      writings.map((item) => localizedWriting(item, language)),
    );

    const filterBarMount = document.querySelector('[data-writing-filter-bar]');
    if (filterBarMount) {
      filterBarMount.replaceChildren();

      const searchBox = element('div', 'writing-search-box');
      const searchIcon = element('span', 'writing-search-icon');
      searchIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
      const searchInput = element('input', 'writing-search-input');
      searchInput.type = 'search';
      searchInput.value = activeSearchQuery;
      searchInput.placeholder = labels.searchPlaceholder || 'Search notes by title, thought, or keyword…';
      searchInput.addEventListener('input', (e) => {
        activeSearchQuery = e.target.value.trim().toLowerCase();
        drawCards();
      });
      searchBox.append(searchIcon, searchInput);

      const catFilterWrap = element('div', 'writing-cat-filter');
      const categoriesSet = new Set();
      localizedWritings.forEach(w => {
        if (w.category) categoriesSet.add(w.category);
      });

      const allPill = element('button', `writing-cat-pill${activeCategoryFilter === 'all' ? ' is-active' : ''}`, labels.allCategories || 'All Categories');
      allPill.type = 'button';
      allPill.addEventListener('click', () => {
        activeCategoryFilter = 'all';
        drawCards();
      });
      catFilterWrap.append(allPill);

      Array.from(categoriesSet).forEach(cat => {
        const catPill = element('button', `writing-cat-pill${activeCategoryFilter === cat ? ' is-active' : ''}`, cat);
        catPill.type = 'button';
        catPill.addEventListener('click', () => {
          activeCategoryFilter = cat;
          drawCards();
        });
        catFilterWrap.append(catPill);
      });

      filterBarMount.append(searchBox, catFilterWrap);
    }

    function drawCards() {
      mount.replaceChildren();

      const filteredItems = writings.map((item, index) => ({
        item,
        localized: localizedWritings[index],
      })).filter(({ item, localized }) => {
        const matchesCategory = activeCategoryFilter === 'all' || localized.category === activeCategoryFilter;
        if (!matchesCategory) return false;

        if (!activeSearchQuery) return true;
        const q = activeSearchQuery;
        const thoughtText = (pickLang(item.thought, language) || localized.thought || '').toLowerCase();
        const titleText = (localized.title || '').toLowerCase();
        const summaryText = (localized.summary || '').toLowerCase();
        const indexText = (item.index || '').toLowerCase();

        return titleText.includes(q) || thoughtText.includes(q) || summaryText.includes(q) || indexText.includes(q);
      });

      if (counterEl) {
        counterEl.textContent = `${String(filteredItems.length).padStart(2, '0')} / ${String(writings.length).padStart(2, '0')} ${labels.archiveLabel}`;
      }

      if (!filteredItems.length) {
        const emptyBox = element('div', 'writing-notice');
        emptyBox.textContent = labels.emptyArchive || 'No logbooks found.';
        mount.append(emptyBox);
        return;
      }

      filteredItems.forEach(({ item, localized }) => {
        const link = element('a', 'writing-card');
        link.href = `writing.html?slug=${encodeURIComponent(item.slug)}`;
        link.setAttribute('aria-label', `${labels.read}: ${localized.title}`);
        link.append(element('span', 'writing-card-index', item.index));

        const card = element('div', 'writing-card-content');
        const meta = element('div', 'writing-card-eyebrow');
        const dateText = localized.date || item.date || '';
        meta.append(
          element('span', '', localized.category),
          element('span', '', `${dateText ? dateText + ' · ' : ''}${localized.readingTime}`),
        );
        card.append(meta, element('h3', '', localized.title));

        const thoughtText = pickLang(item.thought, language) || localized.thought || '';
        if (thoughtText) {
          card.append(element('p', 'writing-card-thought', thoughtText));
        }
        card.append(element('p', '', localized.summary));

        const footer = element('div', 'writing-card-footer');
        const read = element('strong', '', labels.read);
        read.append(element('span', 'arrow', '↗'));
        footer.append(read);
        card.append(footer);
        link.append(card);
        mount.append(link);
      });
    }

    drawCards();
  }

  function renderDetail() {
    const mount = document.querySelector('[data-writing-detail]');
    if (!mount) return;
    const slug = new URLSearchParams(window.location.search).get('slug');
    const itemIndex = writings.findIndex((entry) => entry.slug === slug);
    const item = writings[itemIndex];
    let language = localStorage.getItem('portfolio-writing-lang') || defaultLanguage;
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
            localStorage.setItem('portfolio-writing-lang', language);
            draw();
          }),
        );
      }
      mount.append(toolbar);

      const header = element('header', 'writing-article-header');
      const dateText = localized.date || item.date || '';
      header.append(
        element('p', 'overline', `${localized.category} · #${item.index}${dateText ? ' · ' + dateText : ''}`),
      );
      header.append(element('h1', '', localized.title));

      const meta = element('div', 'writing-meta');
      const isVi = language === 'vi';
      const timeDetail = dateText ? (item.updatedAt ? `${isVi ? 'Mốc:' : 'Timeline:'} ${dateText} (${isVi ? 'Cập nhật:' : 'Updated:'} ${item.updatedAt})` : `${isVi ? 'Thời gian:' : 'Time:'} ${dateText}`) : '';
      meta.append(
        element('span', '', localized.logbook),
        element('span', '', `${timeDetail ? timeDetail + ' · ' : ''}${localized.readingTime}`),
      );
      header.append(meta);
      mount.append(header);

      const albumsList = config.pages?.writing?.albums || config.pages?.writing?.albumPages || [];
      const connectedAlbum = albumsList.find(a => {
        if (a.relatedSlugs && a.relatedSlugs.includes(item.slug)) return true;
        if (a.pages && a.pages.some(p => p.relatedSlug === item.slug)) return true;
        return false;
      });
      if (connectedAlbum) {
        const plateCard = element('div', 'writing-connected-plate');
        const plateInfo = element('div');
        const albumTitle = pickLang(connectedAlbum.title, language);
        plateInfo.append(
          element('span', '', `${connectedAlbum.type || 'Album'} · ${connectedAlbum.period || ''}`),
          element('strong', '', albumTitle),
        );
        const plateLink = element('a', '', `${labels.albumLogbooksTitle || 'Pages & Moments'} ↗`);
        plateLink.href = `album-viewer.html?id=${encodeURIComponent(connectedAlbum.id)}`;
        plateCard.append(plateInfo, plateLink);
        mount.append(plateCard);
      }

      const body = element('div', 'writing-body');
      body.append(renderMarkdown(localized.body));
      enhanceArticleContent(body, language);
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

  function initAlbumViewer() {
    const standaloneMount = document.querySelector('[data-standalone-album-mount]');
    if (!standaloneMount) return;
    renderWritingAlbum(currentLanguage, standaloneMount);
  }

  renderIndex();
  renderDetail();
  initAlbumViewer();
})();
