(function () {
  const root = document.documentElement;
  const config = window.PORTFOLIO_CONFIG;
  const ui = config?.ui || {};
  const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
  const sunIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const moonIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

  let savedTheme = null;
  try { savedTheme = localStorage.getItem('portfolio-theme'); } catch (_) {}
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = savedTheme || (systemDark ? 'dark' : 'light');

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function safeHref(value) {
    const href = String(value || '').trim();
    if (/^(?:https?:|mailto:|#)/i.test(href)) return href;
    if (/^(?:\.\/|\.\.\/)?[a-z0-9_./?=&%#-]+$/i.test(href)) return href;
    return '#';
  }

  function richText(value) {
    return escapeHTML(value)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => `<a href="${escapeHTML(safeHref(href))}">${label}</a>`)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function externalAttributes(link) {
    const external = link.external === true || /^https?:/i.test(link.href || '');
    return external ? ' target="_blank" rel="noreferrer"' : '';
  }

  function renderLinks(links) {
    if (!Array.isArray(links) || !links.length) return '';
    return `<div class="inline-links">${links.map(link => `<a href="${escapeHTML(safeHref(link.href))}"${externalAttributes(link)}>${escapeHTML(link.label)} ${arrow}</a>`).join('')}</div>`;
  }

  function renderParagraphs(paragraphs) {
    return `<div class="prose">${(paragraphs || []).map(text => `<p>${richText(text)}</p>`).join('')}</div>`;
  }

  function renderPageIntro(page) {
    return `<header class="page-intro"><p class="overline">${escapeHTML(page.overline)}</p><h1>${escapeHTML(page.title)}</h1><p>${escapeHTML(page.description)}</p></header>`;
  }

  function renderReach(page) {
    if (!page.reachTitle) return '';
    return `<section class="section reach"><h2>${escapeHTML(page.reachTitle)}</h2>${page.reachText ? `<p class="prose">${richText(page.reachText)}</p>` : ''}${renderLinks(page.reachLinks)}</section>`;
  }

  function renderYearList(items) {
    return `<div class="year-list">${(items || []).map(item => `<div><time>${escapeHTML(item.label)}</time><p>${richText(item.text)}</p></div>`).join('')}</div>`;
  }

  function renderAbout(page) {
    const site = config.site;
    return `
      <section class="intro">
        <div><p class="overline">${escapeHTML(page.overline)}</p><h1>${escapeHTML(site.name)}</h1><p class="role">${escapeHTML(site.role)}</p></div>
        <img class="avatar" src="${escapeHTML(safeHref(site.profileImage))}" width="96" height="96" alt="${escapeHTML(site.name)}">
      </section>
      <section class="section"><h2>${escapeHTML(page.greeting)}</h2>${renderParagraphs(page.introduction)}${renderLinks(page.introductionLinks)}</section>
      <section class="section"><h2>${escapeHTML(page.nowTitle)}</h2>${renderYearList(page.now)}</section>
      <section class="section"><h2>${escapeHTML(page.exploreTitle)}</h2><p class="prose">${richText(page.explore)}</p></section>
      <section class="section reach"><h2>${escapeHTML(page.reachTitle)}</h2>${renderLinks(page.reachLinks)}</section>
      <div data-site-footer></div>`;
  }

  function renderResearch(page) {
    const directions = (page.directions || []).map(item => `
      <article><span>${escapeHTML(item.number)}</span><div><small>${escapeHTML(item.title)}</small><h3>${escapeHTML(item.question)}</h3><p>${escapeHTML(item.detail)}</p></div></article>`).join('');

    const works = (page.works || []).map(work => {
      const tags = (work.tags || []).map(t => `<span class="tag-badge">${escapeHTML(t)}</span>`).join('');
      const links = [];
      if (work.paperUrl) links.push(`<a class="research-link-btn" href="${escapeHTML(safeHref(work.paperUrl))}" target="_blank" rel="noreferrer">Paper / Manuscript ${arrow}</a>`);
      if (work.codeUrl) links.push(`<a class="research-link-btn" href="${escapeHTML(safeHref(work.codeUrl))}" target="_blank" rel="noreferrer">Source Code ${arrow}</a>`);
      if (work.demoUrl) links.push(`<a class="research-link-btn" href="${escapeHTML(safeHref(work.demoUrl))}" target="_blank" rel="noreferrer">Live Demo ${arrow}</a>`);

      return `
        <article class="research-work-card">
          <div class="research-work-header">
            <div>
              <div class="research-work-meta">
                <span class="research-status">${escapeHTML(work.status || 'Research')}</span>
                ${work.period ? `<time class="research-period">${escapeHTML(work.period)}</time>` : ''}
              </div>
              <h3 class="research-work-title">
                <a class="research-title-link" href="research-detail.html?id=${encodeURIComponent(work.id)}">${escapeHTML(work.title)}</a>
              </h3>
            </div>
          </div>
          <p class="research-work-abstract">${escapeHTML(work.abstract || '')}</p>
          ${work.explanation ? `
            <div class="research-explanation">
              <strong>Core Mechanism:</strong>
              <p>${richText(work.explanation)}</p>
            </div>
          ` : ''}
          <div class="research-work-footer">
            <div class="research-tags">${tags}</div>
            <div class="research-links">
              <a class="research-dossier-btn" href="research-detail.html?id=${encodeURIComponent(work.id)}">Research Dossier ${arrow}</a>
              ${links.join('')}
            </div>
          </div>
        </article>
      `;
    }).join('');

    return `${renderPageIntro(page)}
      <section class="section"><h2>${escapeHTML(page.listTitle || 'Current directions')}</h2><div class="research-list">${directions}</div></section>
      ${works ? `<section class="section"><h2>${escapeHTML(page.worksTitle || 'Research Works & Initiatives')}</h2><div class="research-works-list">${works}</div></section>` : ''}
      <section class="section"><h2>${escapeHTML(page.methodTitle || 'Working method')}</h2>${renderParagraphs(page.method)}${renderLinks(page.methodLinks)}</section>
      ${renderReach(page)}<div data-site-footer></div>`;
  }

  function renderResearchDetail() {
    const researchPage = config.pages?.research || {};
    const works = researchPage.works || [];
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const work = works.find(w => w.id === id) || works[0];

    if (!work) {
      return `
        <div class="research-detail-notfound">
          <a class="writing-back" href="research.html"><span aria-hidden="true">&larr;</span> All research directions</a>
          <h2>Research initiative not found.</h2>
          <p>The requested initiative may have moved or is not yet configured.</p>
        </div>
      `;
    }

    if (work.title) {
      document.title = `${work.title} - Nguyễn Huỳnh Đăng Nhựt`;
    }

    const tags = (work.tags || []).map(t => `<span class="tag-badge">${escapeHTML(t)}</span>`).join('');
    const resourceLinks = [];
    if (work.paperUrl) resourceLinks.push(`<a class="research-link-btn primary" href="${escapeHTML(safeHref(work.paperUrl))}" target="_blank" rel="noreferrer">Paper / Manuscript ${arrow}</a>`);
    if (work.codeUrl) resourceLinks.push(`<a class="research-link-btn" href="${escapeHTML(safeHref(work.codeUrl))}" target="_blank" rel="noreferrer">Source Code ${arrow}</a>`);
    if (work.demoUrl) resourceLinks.push(`<a class="research-link-btn" href="${escapeHTML(safeHref(work.demoUrl))}" target="_blank" rel="noreferrer">Live Demo ${arrow}</a>`);

    let relatedHtml = '';
    const relatedSlugs = work.relatedWritings || [];
    const allWritings = config.writings || [];
    if (relatedSlugs.length) {
      const relatedCards = relatedSlugs.map(slug => {
        const item = allWritings.find(w => w.slug === slug);
        if (!item) return '';
        const cat = typeof item.category === 'object' ? (item.category.en || item.category.vi) : item.category;
        const thought = typeof item.thought === 'object' ? (item.thought.en || item.thought.vi) : item.thought;
        return `
          <a class="research-related-card" href="writing.html?slug=${encodeURIComponent(item.slug)}">
            <span class="research-related-index">Logbook ${escapeHTML(item.index || '')}</span>
            <div class="research-related-body">
              <h4>${escapeHTML(thought || item.slug)}</h4>
              <p>${escapeHTML(cat || '')} · ${escapeHTML(item.date || '')}</p>
            </div>
            ${arrow}
          </a>
        `;
      }).filter(Boolean).join('');

      if (relatedCards) {
        relatedHtml = `
          <section class="research-detail-section">
            <h3>Connected Logbooks & Field Notes</h3>
            <div class="research-related-grid">${relatedCards}</div>
          </section>
        `;
      }
    }

    return `
      <div class="research-detail-container">
        <a class="writing-back" href="research.html"><span aria-hidden="true">&larr;</span> All research directions</a>
        
        <header class="research-detail-header">
          <div class="research-work-meta">
            <span class="research-status">${escapeHTML(work.status || 'Research')}</span>
            <time class="research-period">${escapeHTML(work.period || '')}</time>
          </div>
          <h1 class="research-detail-title">${escapeHTML(work.title)}</h1>
          <div class="research-detail-tags">${tags}</div>
          ${resourceLinks.length ? `<div class="research-detail-actions">${resourceLinks.join('')}</div>` : ''}
        </header>

        <div class="research-detail-body">
          <section class="research-detail-section">
            <h3>Abstract & Background</h3>
            <div class="research-abstract-box">
              <p class="prose">${richText(work.abstract || '')}</p>
              ${work.overview ? `<p class="prose" style="margin-top:14px;">${richText(work.overview)}</p>` : ''}
            </div>
          </section>

          ${work.firstPrinciples ? `
            <section class="research-detail-section">
              <h3>First-Principles Foundation</h3>
              <div class="research-theory-box">
                <p class="prose">${richText(work.firstPrinciples)}</p>
              </div>
            </section>
          ` : ''}

          ${work.explanation ? `
            <section class="research-detail-section">
              <h3>Core Mechanism & Theoretical Framework</h3>
              <div class="research-explanation">
                <p class="prose">${richText(work.explanation)}</p>
              </div>
            </section>
          ` : ''}

          ${work.methodology ? `
            <section class="research-detail-section">
              <h3>Methodology & Implementation Architecture</h3>
              <p class="prose">${richText(work.methodology)}</p>
            </section>
          ` : ''}

          ${work.findings ? `
            <section class="research-detail-section">
              <h3>Empirical Findings & Breakthroughs</h3>
              <div class="research-results-box">
                <p class="prose">${richText(work.findings)}</p>
              </div>
            </section>
          ` : ''}

          ${relatedHtml}

          <section class="section reach" style="margin-top:40px; padding-top:24px; border-top:1px solid var(--line);">
            <h3>Academic Inquiry & Collaboration</h3>
            <p class="prose">If you have scientific questions, feedback, or would like to discuss collaboration on this research direction, please reach out via email.</p>
            <div class="inline-links">
              <a href="mailto:${escapeHTML(config.site?.email || 'penciltalk0910@gmail.com')}">Discuss via Email ${arrow}</a>
              ${work.codeUrl ? `<a href="${escapeHTML(safeHref(work.codeUrl))}" target="_blank" rel="noreferrer">Source Repository ${arrow}</a>` : ''}
            </div>
          </section>
        </div>

        <div data-site-footer></div>
      </div>
    `;
  }

  function renderProjects(page) {
    const projects = (page.items || []).map(item => `
      <article><time>${escapeHTML(item.year)}</time><div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.detail)}</p><small>${escapeHTML((item.tags || []).join(' · '))}</small>${item.link ? `<a href="${escapeHTML(safeHref(item.link))}" target="_blank" rel="noreferrer">${escapeHTML(ui.viewProject || 'View project')} ${arrow}</a>` : `<em>${escapeHTML(ui.documentationInProgress || 'Documentation in progress')}</em>`}</div></article>`).join('');
    const papers = (page.papers || []).map((item, index) => `
      <a href="${escapeHTML(safeHref(item.link))}" target="_blank" rel="noreferrer"><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.detail)} · ${escapeHTML(item.language)}</p></div>${arrow}</a>`).join('');
    return `${renderPageIntro(page)}
      <section class="section"><h2>${escapeHTML(page.listTitle)}</h2><div class="work-list">${projects}</div></section>
      <section class="section" id="research-papers"><h2>${escapeHTML(page.paperTitle)}</h2><div class="paper-list">${papers}</div><p class="publication-note">${escapeHTML(page.publicationNote)}</p></section>
      ${renderReach(page)}<div data-site-footer></div>`;
  }

  function renderBooks(page) {
    const items = page.items || [];
    const books = items.map(item => `
      <a class="book-card" href="${escapeHTML(safeHref(item.file))}" target="_blank" rel="noreferrer">
        <div class="book-cover"><img src="${escapeHTML(safeHref(item.cover))}" width="827" height="1169" alt="${escapeHTML(ui.coverOf || 'Cover of')} ${escapeHTML(item.title)}" loading="lazy"></div>
        <p class="book-meta">${escapeHTML(item.year)} · ${escapeHTML(item.language)} · ${escapeHTML(item.pages)} ${escapeHTML(ui.pages || 'pages')}</p>
        <h3>${escapeHTML(item.title)}</h3>
        <p class="book-subtitle">${escapeHTML(item.subtitle)}</p>
        <p class="book-detail">${escapeHTML(item.detail)}</p>
        <span class="book-action">${escapeHTML(ui.readPdf || 'Read PDF')} ${arrow}</span>
      </a>`).join('');
    const totalPages = items.reduce((sum, item) => sum + Number(item.pages || 0), 0);
    const countLabel = `${String(items.length).padStart(2, '0')} ${ui.books || 'books'} · ${totalPages} ${ui.pages || 'pages'}`;
    return `${renderPageIntro(page)}
      <section class="section"><div class="heading-row"><h2>${escapeHTML(page.listTitle)}</h2><span>${escapeHTML(countLabel)}</span></div><div class="book-grid">${books}</div></section>
      <section class="section reach"><h2>${escapeHTML(page.noteTitle)}</h2><p class="prose">${richText(page.note)}</p></section>
      <div data-site-footer></div>`;
  }

  function renderActivities(page) {
    const timeline = (page.items || []).map(item => {
      const actions = [];
      if (item.storySlug) {
        actions.push(`<a href="writing.html?slug=${encodeURIComponent(item.storySlug)}">Story logbook ${arrow}</a>`);
      }
      if (item.albumId) {
        actions.push(`<a href="album-viewer.html?id=${encodeURIComponent(item.albumId)}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Memory Album ${arrow}</a>`);
      }
      if (item.link) {
        actions.push(`<a href="${escapeHTML(safeHref(item.link))}" target="_blank" rel="noreferrer">${escapeHTML(item.linkLabel || 'View details')} ${arrow}</a>`);
      }
      const actionsHtml = actions.length ? `<div class="inline-links" style="margin-top:10px;">${actions.join('')}</div>` : '';

      return `
        <div><time>${escapeHTML(item.year)}</time><div><small>${escapeHTML(item.type)}</small><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.place)}</p>${actionsHtml}</div></div>`;
    }).join('');

    return `${renderPageIntro(page)}
      <section class="section"><h2>${escapeHTML(page.listTitle)}</h2><div class="timeline-list">${timeline}</div></section>
      <section class="section"><h2>${escapeHTML(page.communityTitle)}</h2>${renderYearList(page.community)}</section>
      ${renderReach(page)}<div data-site-footer></div>`;
  }

  function renderLibrary(page) {
    const items = (page.items || []).map((item, index) => `
      <div><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.detail)}</p></div></div>`).join('');

    return `${renderPageIntro(page)}
      <section class="section"><h2>${escapeHTML(page.listTitle || 'Reading map')}</h2><div class="library-list">${items}</div></section>
      <section class="section reach"><h2>${escapeHTML(page.noteTitle || 'Notes')}</h2><p class="prose">${richText(page.note)}</p>${renderLinks(page.noteLinks)}</section>
      <div data-site-footer></div>`;
  }

  function renderWriting(page) {
    return `
      ${renderPageIntro(page)}
      <section class="section writing-interests-section" data-writing-interests style="display:none;"></section>
      <section class="section writing-explorations-section" data-writing-explorations style="display:none;"></section>
      <section class="section writing-memories-section" data-writing-memories style="display:none;"></section>
      <section class="section writings-archive-section" data-writings-archive>
        <div class="writings-archive-header">
          <div class="heading-row">
            <div>
              <p class="overline" data-writings-overline>Archive</p>
              <h2 data-writings-heading>${escapeHTML(page.listTitle || 'Shared Field Notes & Logbooks')}</h2>
            </div>
            <div class="writing-header-controls">
              <span class="writing-count-badge" data-writing-count>${escapeHTML(ui.loadingNotes || 'Loading notes')}</span>
              <div class="writing-language-control" data-writing-language-control></div>
            </div>
          </div>
        </div>

        <div class="writing-filter-toolbar" data-writing-filter-bar></div>

        <div class="writing-index" data-writing-list>
          <p class="writing-notice">${escapeHTML(ui.loadingArchive || 'Loading the writing archive…')}</p>
        </div>
      </section>
      ${renderReach(page)}
      <div data-site-footer></div>
    `;
  }

  function renderWritingDetail() {
    return `<article class="writing-article" data-writing-detail aria-live="polite"><p class="writing-notice">${escapeHTML(ui.loadingArticle || 'Loading field note…')}</p></article><div data-site-footer></div>`;
  }

  function renderAlbumViewer() {
    return `<div class="album-standalone-wrap" data-standalone-album-mount><div class="writing-notice">${escapeHTML(ui.loadingArchive || 'Loading notebook album…')}</div></div><div data-site-footer></div>`;
  }

  function pageKey() {
    return document.body.dataset.page || 'about';
  }

  function setPageMetadata(key) {
    const metadataKey = (key === 'writing-detail' || key === 'album-viewer') ? 'writing' : key === 'research-detail' ? 'research' : key;
    const page = config?.pages?.[metadataKey];
    if (!page) return;
    if (page.metaTitle) document.title = page.metaTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description && page.metaDescription) description.content = page.metaDescription;
  }

  function updateWebIcon() {
    const iconPath = config?.site?.webIcon;
    if (!iconPath) return;
    let icon = document.querySelector('link[rel~="icon"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.rel = 'icon';
      document.head.append(icon);
    }
    icon.href = safeHref(iconPath);
    icon.type = 'image/png';
  }

  function renderPage() {
    const mount = document.querySelector('[data-page-content]');
    if (!mount) return;
    if (!config?.site || !config?.pages) {
      mount.innerHTML = `<section class="page-intro"><p class="overline">${escapeHTML(ui.configErrorOverline || 'Configuration')}</p><h1>${escapeHTML(ui.configErrorTitle || 'Portfolio config could not be loaded.')}</h1><p>${escapeHTML(ui.configErrorText || 'Check config/portfolio.config.js for a syntax error.')}</p></section>`;
      return;
    }

    const key = pageKey();
    const isResearchDetail = key === 'research-detail' || (key === 'research' && Boolean(new URLSearchParams(window.location.search).get('id')));
    const isAlbumViewer = key === 'album-viewer';
    const page = config.pages[key === 'writing-detail' || isAlbumViewer ? 'writing' : key === 'research-detail' ? 'research' : key];
    const renderers = {
      about: renderAbout,
      research: renderResearch,
      'research-detail': renderResearchDetail,
      projects: renderProjects,
      books: renderBooks,
      activities: renderActivities,
      library: renderLibrary,
      writing: renderWriting,
      'album-viewer': renderAlbumViewer
    };
    mount.classList.toggle('article-container', key === 'writing-detail' || isResearchDetail);
    mount.innerHTML = key === 'writing-detail'
      ? renderWritingDetail()
      : isResearchDetail
        ? renderResearchDetail()
        : isAlbumViewer
          ? renderAlbumViewer()
          : renderers[key] && page
            ? renderers[key](page)
            : `<section class="page-intro"><p class="overline">${escapeHTML(ui.notFoundOverline || 'Portfolio')}</p><h1>${escapeHTML(ui.notFoundTitle || 'Page not found.')}</h1><p>${escapeHTML(ui.notFoundText || 'This page is not configured yet.')}</p></section><div data-site-footer></div>`;
    setPageMetadata(key);
  }

  function renderHeader() {
    const mount = document.querySelector('[data-site-header]');
    if (!mount || !config?.site) return;
    const currentKey = pageKey();
    const current = (currentKey === 'writing-detail' || currentKey === 'writing' || currentKey === 'album-viewer')
      ? 'writing'
      : (currentKey === 'research-detail' || currentKey === 'research')
        ? 'research'
        : currentKey;
    const links = (config.navigation || []).map(link =>
      `<a href="${escapeHTML(safeHref(link.href))}"${current === link.key ? ' aria-current="page"' : ''}>${escapeHTML(link.label)}</a>`
    ).join('');
    mount.innerHTML = `
      <a class="skip-link" href="#main-content">${escapeHTML(ui.skipToContent || 'Skip to content')}</a>
      <header class="site-header"><div class="header-inner">
        <a class="brand" href="index.html">${escapeHTML(config.site.shortName)}</a>
        <nav class="main-nav" id="main-nav" aria-label="${escapeHTML(ui.mainNavigation || 'Main navigation')}">${links}</nav>
        <div class="header-tools"><button class="theme-toggle" type="button"></button><button class="menu-toggle" type="button" aria-label="${escapeHTML(ui.openMenu || 'Open menu')}" aria-controls="main-nav" aria-expanded="false"><span class="menu-icon"><span></span></span></button></div>
      </div></header>`;
  }

  function renderFooter() {
    const mount = document.querySelector('[data-site-footer]');
    if (!mount || !config?.site) return;
    const site = config.site;
    const profiles = (config.profiles || []).map(profile => `
      <a href="${escapeHTML(safeHref(profile.href))}" target="_blank" rel="me noreferrer"><span>${escapeHTML(profile.label)}</span><strong>${profile.orcid ? '<i class="orcid-mark">iD</i>' : ''}${escapeHTML(profile.value)}</strong>${arrow}</a>`).join('');
    mount.outerHTML = `
      <footer class="site-footer">
        <div class="footer-main"><div class="footer-identity"><strong>${escapeHTML(site.name)}</strong><span>${escapeHTML(site.footerRole)}</span></div><div class="footer-contact"><span>${escapeHTML(ui.contact || 'Contact')}</span><a href="mailto:${escapeHTML(site.email)}">${escapeHTML(site.email)} ${arrow}</a></div></div>
        <nav class="footer-links" aria-label="${escapeHTML(ui.professionalProfiles || 'Professional profiles')}">${profiles}</nav>
        <div class="footer-bottom"><span>© ${escapeHTML(site.copyrightYear)} ${escapeHTML(site.name)} · ${escapeHTML(site.location)}</span><a class="brainmade" href="${escapeHTML(safeHref(site.brainmadeUrl))}" target="_blank" rel="noreferrer" aria-label="${escapeHTML(ui.brainmadeLabel || 'Learn about the Brainmade mark')}"><img src="${escapeHTML(safeHref(site.brainmadeLogo))}" width="90" height="28" alt="${escapeHTML(ui.brainmadeAlt || 'Brainmade')}" loading="lazy"></a></div>
      </footer>`;
  }

  function updateThemeButton() {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;
    const dark = root.dataset.theme === 'dark';
    button.innerHTML = dark ? moonIcon : sunIcon;
    button.setAttribute('aria-label', dark ? (ui.switchToLight || 'Switch to light mode') : (ui.switchToDark || 'Switch to dark mode'));
    button.title = dark ? (ui.switchToLight || 'Switch to light mode') : (ui.switchToDark || 'Switch to dark mode');
  }

  function bindInteractions() {
    const themeButton = document.querySelector('.theme-toggle');
    const menuButton = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');

    themeButton?.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('portfolio-theme', root.dataset.theme); } catch (_) {}
      updateThemeButton();
    });

    menuButton?.addEventListener('click', function () {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? (ui.closeMenu || 'Close menu') : (ui.openMenu || 'Open menu'));
      nav?.classList.toggle('is-open', open);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !nav?.classList.contains('is-open')) return;
      nav.classList.remove('is-open');
      menuButton?.setAttribute('aria-expanded', 'false');
      menuButton?.setAttribute('aria-label', ui.openMenu || 'Open menu');
      menuButton?.focus();
    });

    document.addEventListener('click', function (event) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (nav?.classList.contains('is-open') && !target.closest('.site-header')) {
        nav.classList.remove('is-open');
        menuButton?.setAttribute('aria-expanded', 'false');
        menuButton?.setAttribute('aria-label', ui.openMenu || 'Open menu');
      }

      const link = target.closest('a');
      if (!link || link.target === '_blank' || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || !destination.pathname.endsWith('.html')) return;
      event.preventDefault();
      document.body.classList.add('is-leaving');
      window.setTimeout(() => { window.location.href = destination.href; }, 140);
    });
  }

  function init() {
    updateWebIcon();
    renderPage();
    renderHeader();
    renderFooter();
    updateThemeButton();
    bindInteractions();
    requestAnimationFrame(() => document.body.classList.add('is-ready'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
