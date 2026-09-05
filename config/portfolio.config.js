/*
  PORTFOLIO CONTENT CONFIG — EDIT THIS FILE
  -----------------------------------------
  This is the single source for all visible site content and interface labels.
  Update profile details, navigation, page copy, projects, papers, books, timeline,
  library, writing settings, or writing metadata here. The HTML, CSS, and renderer
  files do not need editing for normal content updates.

  Text fields marked as rich text support:
  - **bold text**
  - [link label](projects.html)
  - line breaks with \n

  Writing archive:
  - defaultLanguage: language used on the index and when a post opens ('en' or 'vi')
  - languageSwitcher: 'post' shows EN/VN inside a post; 'none' hides it
  - edit labels and names in languages to change the language button copy

  Writing images:
  - cover: 'assets/writings/cover.jpg'
  - inline image block:
    { type: 'image', src: 'assets/writings/figure.jpg', alt: 'Description', caption: 'Optional caption.' }
*/
window.PORTFOLIO_CONFIG = {
  site: {
    name: 'Nguyễn Huỳnh Đăng Nhựt',
    shortName: 'Đăng Nhựt',
    role: 'Artificial Intelligence @ UIT, VNU-HCM',
    footerRole: 'Artificial Intelligence · UIT, VNU-HCM',
    location: 'Vietnam · GMT+7',
    copyrightYear: '2026',
    email: 'penciltalk0910@gmail.com',
    profileImage: 'assets/profile.jpg',
    webIcon: 'assets/icon.png',
    resume: 'assets/nguyenhuynhdangnhut_cv.pdf',
    brainmadeUrl: 'https://brainmade.org/',
    brainmadeLogo: 'https://brainmade.org/black-logo.svg'
  },

  ui: {
    skipToContent: 'Skip to content',
    mainNavigation: 'Main navigation',
    professionalProfiles: 'Professional profiles',
    contact: 'Contact',
    brainmadeLabel: 'Learn about the Brainmade mark',
    brainmadeAlt: 'Brainmade',
    coverOf: 'Cover of',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    viewProject: 'View project',
    documentationInProgress: 'Documentation in progress',
    readPdf: 'Read PDF',
    books: 'books',
    pages: 'pages',
    loadingNotes: 'Loading notes',
    loadingArchive: 'Loading the writing archive…',
    loadingArticle: 'Loading field note…',
    configErrorOverline: 'Configuration',
    configErrorTitle: 'Portfolio config could not be loaded.',
    configErrorText: 'Check config/portfolio.config.js for a syntax error.',
    notFoundOverline: 'Portfolio',
    notFoundTitle: 'Page not found.',
    notFoundText: 'This page is not configured yet.'
  },

  navigation: [
    { key: 'about', label: 'About', href: 'index.html' },
    { key: 'research', label: 'Research', href: 'research.html' },
    { key: 'projects', label: 'Works', href: 'projects.html' },
    { key: 'books', label: 'Books', href: 'books.html' },
    { key: 'writing', label: 'Writing', href: 'blog.html' },
    { key: 'activities', label: 'Timeline', href: 'activities.html' },
    { key: 'library', label: 'Library', href: 'library.html' }
  ],

  profiles: [
    { label: 'GitHub', value: '@DangNhutNguyen', href: 'https://github.com/DangNhutNguyen' },
    { label: 'LinkedIn', value: 'dangnhutnguyen', href: 'https://www.linkedin.com/in/dangnhutnguyen/' },
    { label: 'ORCID', value: '0009-0009-6305-478X', href: 'https://orcid.org/0009-0009-6305-478X', orcid: true }
  ],

  pages: {
    about: {
      metaTitle: 'Nguyễn Huỳnh Đăng Nhựt - Academic Portfolio',
      metaDescription: 'Academic portfolio of Nguyễn Huỳnh Đăng Nhựt - Artificial Intelligence student at UIT, VNU-HCM.',
      overline: 'About',
      greeting: 'Hi there.',
      introduction: [
        'I am an Artificial Intelligence student at the University of Information Technology, VNU-HCM, based in Vietnam.',
        'My interests sit between [machine learning](research.html), applied mathematics, physics, and research tools. I enjoy rebuilding ideas from first principles, then turning them into experiments that are understandable and useful.',
        'This website is a quiet record of the questions I am exploring, the things I build, and what I learn along the way.'
      ],
      introductionLinks: [
        { label: 'View my work', href: 'projects.html' },
        { label: 'Résumé', href: 'assets/nguyenhuynhdangnhut_cv.pdf', external: true }
      ],
      nowTitle: 'Now',
      now: [
        { label: '2026 -', text: 'Studying Artificial Intelligence at **UIT, VNU-HCM**.' },
        { label: 'Research', text: 'Learning systems, computational modeling, and AI-assisted research workflows.' },
        { label: 'Open', text: 'Research conversations and 2026 hackathons in AI, education, data, and sustainability.' }
      ],
      exploreTitle: 'Explore',
      explore: 'Read the full [research directions](research.html), browse [projects and research papers](projects.html), explore my [books](books.html), follow the [academic timeline](activities.html), or visit my [field notes](blog.html).',
      reachTitle: 'Reach me through',
      reachLinks: [
        { label: 'Email', href: 'mailto:penciltalk0910@gmail.com' },
        { label: 'GitHub', href: 'https://github.com/DangNhutNguyen', external: true }
      ]
    },

    research: {
      metaTitle: 'Research - Nguyễn Huỳnh Đăng Nhựt',
      metaDescription: 'Research directions in learning systems, computational modeling, mathematics, and energy.',
      overline: 'Research',
      title: 'Questions before answers.',
      description: 'I use a small set of open questions to connect machine learning, mathematical thinking, and applied physics.',
      listTitle: 'Current directions',
      directions: [
        { number: '01', title: 'Learning systems', question: 'How can intelligent systems learn while making their reasoning easier to understand?', detail: 'Neural networks, interpretability, and productive human–AI collaboration.' },
        { number: '02', title: 'Models and reality', question: 'When does a mathematical model become genuinely useful?', detail: 'Optimization, scientific problem decomposition, and practical decision-making.' },
        { number: '03', title: 'Energy and scale', question: 'How can first-principles physics become a practical energy system?', detail: 'Renewable energy, engineering trade-offs, and credible systems beyond the laboratory.' }
      ],
      methodTitle: 'Working method',
      method: [
        'I begin with first principles, rebuild the smallest useful version, and document where intuition disagrees with experiment.',
        'My current work is exploratory and independent. Formal publications will be listed separately once they are released.'
      ],
      methodLinks: [
        { label: 'Related projects', href: 'projects.html' },
        { label: 'Papers and manuscripts', href: 'projects.html#research-papers' }
      ],
      reachTitle: 'Discuss a question',
      reachText: 'I welcome thoughtful conversations about interpretable systems, research tooling, optimization, and sustainable technology.',
      reachLinks: [{ label: 'Email me', href: 'mailto:penciltalk0910@gmail.com' }]
    },

    projects: {
      metaTitle: 'Works - Nguyễn Huỳnh Đăng Nhựt',
      metaDescription: 'Selected projects and experiments in AI, learning tools, and applied physics.',
      overline: 'Works',
      title: 'Things I build to understand.',
      description: 'Small systems, research experiments, and long-running projects across AI, productivity, and energy.',
      listTitle: 'Selected projects',
      items: [
        { year: '2025 - ', title: 'Focumia', detail: 'Focumia explores how small, intentional constraints can make deep work easier to begin and sustain through timers, task hierarchy, and personal workflow design.', tags: ['Productivity systems', 'Workflow design'], link: 'https://github.com/DangNhutNguyen/Focumia' },
        { year: '2025', title: 'PrompTEA', detail: 'PrompTEA studies prompting as a craft by testing instructions, structures, and feedback loops for learning and research.', tags: ['Prompt engineering', 'LLM tooling'], link: 'https://github.com/DangNhutNguyen/PrompTEA' },
        { year: '2024', title: 'Neural Network from Scratch', detail: 'This project implements forward propagation, gradients, and backpropagation from the mathematical foundations. The priority was understanding, not convenience.', tags: ['Machine learning', 'Backpropagation', 'Python'], link: 'https://github.com/DangNhutNguyen/Neural-Network-from-Scratch' },
        { year: '2024', title: 'MNIST Network Training', detail: 'A practical continuation of the neural-network-from-scratch work, comparing training runs, architecture choices, and hyperparameters on MNIST.', tags: ['Computer vision', 'Model optimization'], link: 'https://github.com/DangNhutNguyen/MNIST-TRAINING' },
        { year: '2024 -', title: 'AI for Research Efficiency', detail: 'An ongoing inquiry into how AI can support literature review, note organization, scientific writing, and useful connections across sources.', tags: ['Research workflow', 'Information synthesis'], link: '' },
        { year: '2023 - 2025', title: 'Concentrated Solar Power', detail: 'The project combines optics, thermodynamics, energy conversion, cost, and feasibility as both a physics question and an engineering design problem.', tags: ['Renewable energy', 'Applied physics'], link: 'https://bit.ly/SolarProject-dangnhutnguyen' }
      ],
      paperTitle: 'Research papers',
      papers: [
        { title: 'LogicPT–GT', detail: 'Logic · problem solving · structured thinking', language: 'Vietnamese', link: 'https://bit.ly/LogicPT-GT' },
        { title: 'AIAPE–Education', detail: 'AI · programming education · learning systems', language: 'English', link: 'https://bit.ly/AIAPE-Education' }
      ],
      publicationNote: 'Peer-reviewed work will be added after formal release, with venue, DOI, abstract, and citation metadata.',
      reachTitle: 'Build with me',
      reachText: 'I am open to 2026 hackathons and student collaborations in AI, education, data, and sustainability.',
      reachLinks: [
        { label: 'Start a conversation', href: 'mailto:penciltalk0910@gmail.com' },
        { label: 'GitHub', href: 'https://github.com/DangNhutNguyen', external: true }
      ]
    },

    books: {
      metaTitle: 'Books - Nguyễn Huỳnh Đăng Nhựt',
      metaDescription: 'Six books on programming, technology, and structured reasoning written by Nguyễn Huỳnh Đăng Nhựt.',
      overline: 'Books',
      title: 'Learning, written from first principles.',
      description: 'Six practical books on programming, embedded systems, structured reasoning, and learning with artificial intelligence.',
      listTitle: 'Written works',
      items: [
        { title: 'LogicPT–GT: Phân tích và Chiến thuật', subtitle: 'Tài liệu tham khảo và tự học Logic · Version 2.2.0', detail: 'Phân tích bài toán sắp xếp, hệ điều kiện, suy luận loại trừ và chiến thuật giải bài có cấu trúc.', language: 'Vietnamese', year: '2026', pages: 36, cover: 'assets/books/covers/logicpt-gt.jpg', file: 'assets/books/logicpt-gt.pdf' },
        { title: 'Python từ trong chăn - Tập 1', subtitle: 'Từ những dòng lệnh đầu tiên đến tư duy lập trình', detail: 'Môi trường, biến, kiểu dữ liệu, nhập xuất, điều kiện, vòng lặp và hàm.', language: 'Vietnamese', year: '2026', pages: 201, cover: 'assets/books/covers/python-tu-trong-chan-tap-1.jpg', file: 'assets/books/python-tu-trong-chan-tap-1.pdf' },
        { title: 'Python từ trong chăn - Tập 2', subtitle: 'Giáo trình tự học tiếp nối Tập 1', detail: 'Cấu trúc dữ liệu, thuật toán, tệp, lỗi, hướng đối tượng, kiểm thử và ứng dụng thực tế.', language: 'Vietnamese', year: '2026', pages: 350, cover: 'assets/books/covers/python-tu-trong-chan-tap-2.jpg', file: 'assets/books/python-tu-trong-chan-tap-2.pdf' },
        { title: 'Arduino từ trong chăn', subtitle: 'Từ một chiếc LED đến hệ thống biết quan sát và phản hồi', detail: 'Điện tử nền tảng, cảm biến, cơ cấu chấp hành, thuật toán thời gian thực và dự án tích hợp.', language: 'Vietnamese', year: '2026', pages: 312, cover: 'assets/books/covers/arduino-tu-trong-chan.jpg', file: 'assets/books/arduino-tu-trong-chan.pdf' },
        { title: 'AI-Assisted Programming: From Zero to Developer', subtitle: 'A practical introduction to learning and building with AI assistance', detail: 'Programming foundations, APIs, debugging, full-stack development, Git, portfolios, and junior developer preparation.', language: 'English', year: '2024', pages: 50, cover: 'assets/books/covers/ai-assisted-programming.jpg', file: 'assets/books/ai-assisted-programming.pdf' },
        { title: 'Question Construction to AIAP', subtitle: 'A field guide to asking better programming questions', detail: 'Problem definition, task decomposition, debugging questions, code feedback, documentation, and AI-assisted learning.', language: 'English', year: '2024', pages: 26, cover: 'assets/books/covers/question-construction-to-aiap.jpg', file: 'assets/books/question-construction-to-aiap.pdf' }
      ],
      noteTitle: 'Projects and publications',
      note: 'Projects and research manuscripts are collected together in [Works](projects.html#research-papers). Longer educational works and practical guides live here in Books.'
    },

    activities: {
      metaTitle: 'Timeline - Nguyễn Huỳnh Đăng Nhựt',
      metaDescription: 'Education, awards, leadership, and academic activities of Nguyễn Huỳnh Đăng Nhựt.',
      overline: 'Timeline',
      title: 'Learning in public.',
      description: 'Education, academic milestones, science competitions, and student leadership.',
      listTitle: 'Bio',
      items: [
        { year: '2026 -', type: 'Education', title: 'Artificial Intelligence student', place: 'University of Information Technology, VNU-HCM' },
        { year: '2026', type: 'Award', title: 'Second Prize · City-Level Academic Excellence Competition', place: 'Physics' },
        { year: '2023', type: 'Award', title: 'First Prize · Provincial ViSEF', place: 'Science and Engineering Fair' },
        { year: '2023', type: 'Award', title: 'Second Prize · Provincial VIFOTEC', place: 'Science and technology innovation' },
        { year: '2021 - 23', type: 'Leadership', title: "Vice President · Provincial Children's Council", place: 'Bà Rịa–Vũng Tàu' },
        { year: '2019', type: 'Leadership', title: "National Delegate · 6th National Children's Forum", place: 'Youth voice and child advocacy' }
      ],
      communityTitle: 'Community',
      community: [{ label: '2023 -', text: '**CodliRo - Code Like Professional.**\nA student-led programming community built around learning together and sharing practical knowledge.' }],
      reachTitle: 'Hackathon mode',
      reachText: 'Open for 2026 AI, data, education, and sustainability challenges.',
      reachLinks: [{ label: 'Build with me', href: 'mailto:penciltalk0910@gmail.com' }]
    },

    library: {
      metaTitle: 'Library - Nguyễn Huỳnh Đăng Nhựt',
      metaDescription: 'A growing reading map across mathematics, intelligent systems, physics, and research practice.',
      overline: 'My library',
      title: 'A map of what I am learning.',
      description: 'Subjects, references, and reading notes that support my research and projects.',
      listTitle: 'Reading map',
      items: [
        { title: 'Mathematics', detail: 'Combinatorics, probability, and mathematical reasoning' },
        { title: 'Intelligent systems', detail: 'Neural networks, optimization, and human–AI collaboration' },
        { title: 'Physics and energy', detail: 'Renewable energy, thermodynamics, and systems design' },
        { title: 'Research practice', detail: 'Scientific writing, literature synthesis, and workflow design' }
      ],
      noteTitle: 'Notes',
      note: 'Book-level notes and references will be added as the collection evolves. For now, this page records the structure of the library rather than pretending the shelves are complete.',
      noteLinks: [{ label: 'Go to field notes', href: 'blog.html' }]
    },

    writing: {
      metaTitle: 'Sixteen Logbooks - Nguyễn Huỳnh Đăng Nhựt',
      metaDescription: 'Sixteen bilingual logbooks on learning, building, fairness, and artificial intelligence by Nguyễn Huỳnh Đăng Nhựt.',
      overline: 'Writing',
      title: 'Sixteen logbooks.',
      description: 'A chronological record of learning, building, choosing, and growing-from a children’s forum in 2019 to questions about AI and memory in 2026.',
      listTitle: 'The notebook',
      reachTitle: 'Questions make good essays.',
      reachText: 'If a note connects with your work, I would be glad to hear from you.',
      reachLinks: [{ label: 'Start a conversation', href: 'mailto:penciltalk0910@gmail.com' }]
    }
  },

  writingOptions: {
    defaultLanguage: 'en',
    languageSwitcher: 'post',
    languages: {
      en: { label: 'EN', name: 'English' },
      vi: { label: 'VN', name: 'Tiếng Việt' }
    },
    copy: {
      en: {
        back: 'All writing',
        read: 'Read logbook',
        end: 'End of logbook',
        discuss: 'Discuss this note',
        previous: 'Previous',
        next: 'Next',
        missingTitle: 'Field note not found.',
        missingText: 'The requested note may have moved or is not part of this archive yet.',
        writingOverline: 'Writing',
        languageLabel: 'Writing language',
        adjacentLabel: 'Adjacent logbooks',
        readingTime: 'min read',
        archiveLabel: 'logbooks · 2019-2026',
        emptyArchive: 'No logbooks have been added yet.',
        markdownUnavailable: 'Markdown renderer is unavailable.'
      },
      vi: {
        back: 'Tất cả bài viết',
        read: 'Đọc logbook',
        end: 'Hết logbook',
        discuss: 'Trao đổi về bài viết',
        previous: 'Bài trước',
        next: 'Bài tiếp',
        missingTitle: 'Không tìm thấy bài viết.',
        missingText: 'Bài viết bạn tìm có thể đã được chuyển hoặc chưa nằm trong kho lưu trữ.',
        writingOverline: 'Bài viết',
        languageLabel: 'Ngôn ngữ bài viết',
        adjacentLabel: 'Các logbook liền kề',
        readingTime: 'phút đọc',
        archiveLabel: 'logbook · 2019-2026',
        emptyArchive: 'Chưa có logbook nào.',
        markdownUnavailable: 'Không thể tải trình hiển thị Markdown.'
      }
    }
  },

  writings: [
    { slug: 'childrens-forum', index: '01', sources: { en: 'writings/01-childrens-forum.en.md', vi: 'writings/01-childrens-forum.vi.md' }, category: { en: 'Society & Childhood', vi: 'Xã hội & Tuổi thơ' } },
    { slug: 'the-first-line-of-code-that-looked-at-the-sun', index: '02', sources: { en: 'writings/02-the-first-line-of-code-that-looked-at-the-sun.en.md', vi: 'writings/02-the-first-line-of-code-that-looked-at-the-sun.vi.md' }, category: { en: 'Computing & Physics', vi: 'Lập trình & Vật lý' } },
    { slug: 'learning-ai-at-boarding-school', index: '03', sources: { en: 'writings/03-learning-ai-at-boarding-school.en.md', vi: 'writings/03-learning-ai-at-boarding-school.vi.md' }, category: { en: 'Learning & AI', vi: 'Học tập & AI' } },
    { slug: 'i-used-ai-so-i-would-not-have-to-think', index: '04', sources: { en: 'writings/04-i-used-ai-so-i-would-not-have-to-think.en.md', vi: 'writings/04-i-used-ai-so-i-would-not-have-to-think.vi.md' }, category: { en: 'Human–AI Practice', vi: 'Thực hành Human–AI' } },
    { slug: 'what-is-happening-inside-a-neural-network', index: '05', sources: { en: 'writings/05-what-is-happening-inside-a-neural-network.en.md', vi: 'writings/05-what-is-happening-inside-a-neural-network.vi.md' }, category: { en: 'Neural Networks', vi: 'Mạng neural' } },
    { slug: '8gb-of-ram-and-the-dream-of-optimizing-llms', index: '06', sources: { en: 'writings/06-8gb-of-ram-and-the-dream-of-optimizing-llms.en.md', vi: 'writings/06-8gb-of-ram-and-the-dream-of-optimizing-llms.vi.md' }, category: { en: 'LLM Systems', vi: 'Hệ thống LLM' } },
    { slug: 'focumia-i-built-a-productivity-app', index: '07', sources: { en: 'writings/07-focumia-i-built-a-productivity-app.en.md', vi: 'writings/07-focumia-i-built-a-productivity-app.vi.md' }, category: { en: 'Product Design', vi: 'Thiết kế sản phẩm' } },
    { slug: 'dailynox-and-learning-as-an-operating-system', index: '08', sources: { en: 'writings/08-dailynox-and-learning-as-an-operating-system.en.md', vi: 'writings/08-dailynox-and-learning-as-an-operating-system.vi.md' }, category: { en: 'Learning Systems', vi: 'Hệ thống học tập' } },
    { slug: 'second-prize-in-physics-and-why-i-still-chose-ai', index: '09', sources: { en: 'writings/09-second-prize-in-physics-and-why-i-still-chose-ai.en.md', vi: 'writings/09-second-prize-in-physics-and-why-i-still-chose-ai.vi.md' }, category: { en: 'Physics & Direction', vi: 'Vật lý & Lựa chọn' } },
    { slug: 'an-outlier-is-not-evidence-of-cheating', index: '10', sources: { en: 'writings/10-an-outlier-is-not-evidence-of-cheating.en.md', vi: 'writings/10-an-outlier-is-not-evidence-of-cheating.vi.md' }, category: { en: 'Education & Fairness', vi: 'Giáo dục & Công bằng' } },
    { slug: 'retaking-the-exam-can-we-retake-fairness', index: '11', sources: { en: 'writings/11-retaking-the-exam-can-we-retake-fairness.en.md', vi: 'writings/11-retaking-the-exam-can-we-retake-fairness.vi.md' }, category: { en: 'Education & Fairness', vi: 'Giáo dục & Công bằng' } },
    { slug: 'rough-drafts-in-the-age-of-ai', index: '12', sources: { en: 'writings/12-rough-drafts-in-the-age-of-ai.en.md', vi: 'writings/12-rough-drafts-in-the-age-of-ai.vi.md' }, category: { en: 'Writing & AI', vi: 'Viết & AI' } },
    { slug: 'the-day-i-became-an-ai-student-at-uit', index: '13', sources: { en: 'writings/13-the-day-i-became-an-ai-student-at-uit.en.md', vi: 'writings/13-the-day-i-became-an-ai-student-at-uit.vi.md' }, category: { en: 'Beginnings', vi: 'Khởi đầu' } },
    { slug: 'i-study-ai-so-why-am-i-opening-an-economics-textbook', index: '14', sources: { en: 'writings/14-i-study-ai-so-why-am-i-opening-an-economics-textbook.en.md', vi: 'writings/14-i-study-ai-so-why-am-i-opening-an-economics-textbook.vi.md' }, category: { en: 'AI & Economics', vi: 'AI & Kinh tế' } },
    { slug: 'neural-work-a-second-brain-must-not-replace-the-first', index: '15', sources: { en: 'writings/15-neural-work-a-second-brain-must-not-replace-the-first.en.md', vi: 'writings/15-neural-work-a-second-brain-must-not-replace-the-first.vi.md' }, category: { en: 'Knowledge Systems', vi: 'Hệ thống tri thức' } },
    { slug: 'what-should-ai-remember-about-a-person', index: '16', sources: { en: 'writings/16-what-should-ai-remember-about-a-person.en.md', vi: 'writings/16-what-should-ai-remember-about-a-person.vi.md' }, category: { en: 'Memory & AI', vi: 'Trí nhớ & AI' } }
  ]
};
