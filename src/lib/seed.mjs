// Demo seed data for Researcher BD. Plain JavaScript (no TS syntax) so it can run both
// inside Next.js route handlers and from `node scripts/seed.mjs` during the Vercel build.
// All records are fictional and marked [Demo].
import bcrypt from 'bcryptjs'

const DEMO_USERS = [
  { name: 'Demo Admin', email: 'admin@demo.researcherbd.org', role: 'ADMIN', bio: 'Demo administrator account (fictional).', researchInterests: 'Data Science, Statistics', technicalSkills: 'Python, R' },
  { name: 'Ayesha Rahman', email: 'ayesha@demo.researcherbd.org', password: 'demo1234', role: 'FACULTY', bio: 'Demo faculty member in computer science (fictional).', researchInterests: 'NLP, Computer Vision, Machine Learning', technicalSkills: 'Python, PyTorch, TensorFlow' },
  { name: 'Tanvir Hasan', email: 'tanvir@demo.researcherbd.org', password: 'demo1234', role: 'RESEARCHER', bio: 'Demo researcher in NLP (fictional).', researchInterests: 'NLP, Machine Learning, Deep Learning', technicalSkills: 'Python, PyTorch, HuggingFace' },
  { name: 'Nusrat Jahan', email: 'nusrat@demo.researcherbd.org', password: 'demo1234', role: 'STUDENT', bio: 'Demo undergraduate student (fictional).', researchInterests: 'Computer Vision, Machine Learning', technicalSkills: 'Python, OpenCV' },
]

const DEMO_OPPS = [
  {
    title: '[Demo] Research Assistantship — Computer Vision Lab',
    description: 'Fictional demonstration opportunity. A research assistant is sought for a computer vision project on satellite imagery analysis.',
    type: 'assistantship',
    researchDomain: 'Computer Vision',
    organization: 'Demo University (fictional)',
    eligibility: 'Undergraduate or MS student in CSE/EEE (demo)',
    qualifications: 'Python, PyTorch (demo)',
    location: 'Dhaka, Bangladesh',
    fundingAmount: 'BDT 15,000/month (demo)',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    applicationUrl: 'https://example.edu/demo',
    sourceUrl: 'https://example.edu/demo',
    verification: 'submitted',
  },
  {
    title: '[Demo] PhD Position — Natural Language Processing for Bangla',
    description: 'Fictional demonstration. Fully-funded PhD position on Bangla NLP (demo).',
    type: 'phd',
    researchDomain: 'NLP',
    organization: 'Demo International Lab (fictional)',
    eligibility: 'MS in CSE or related (demo)',
    qualifications: 'Research experience, publication(s) preferred (demo)',
    location: 'Remote',
    fundingAmount: 'Full scholarship (demo)',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
    applicationUrl: 'https://example.org/demo',
    sourceUrl: 'https://example.org/demo',
    verification: 'source-checked',
  },
  {
    title: '[Demo] Fellowship — Climate Change Modeling',
    description: 'Fictional demonstration. Postdoctoral fellowship on climate modeling (demo).',
    type: 'postdoc',
    researchDomain: 'Climate Science',
    organization: 'Demo Climate Institute (fictional)',
    eligibility: 'PhD in environmental science or related (demo)',
    qualifications: 'Climate modeling, R, Python (demo)',
    location: 'Dhaka, Bangladesh',
    fundingAmount: 'BDT 200,000/month (demo)',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    applicationUrl: 'https://example.org/demo-climate',
    sourceUrl: 'https://example.org/demo-climate',
    verification: 'source-checked',
  },
  {
    title: '[Demo] Scholarship — Biomedical Engineering',
    description: 'Fictional demonstration. MS scholarship on biomedical signal processing (demo).',
    type: 'scholarship',
    researchDomain: 'Biomedical Engineering',
    organization: 'Demo Medical University (fictional)',
    eligibility: 'BSc in EEE/BME (demo)',
    qualifications: 'Signal processing, MATLAB (demo)',
    location: 'Chittagong, Bangladesh',
    fundingAmount: 'BDT 25,000/month (demo)',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
    applicationUrl: 'https://example.edu/demo-med',
    sourceUrl: 'https://example.edu/demo-med',
    verification: 'submitted',
  },
]

const DEMO_FUNDING = [
  {
    title: '[Demo] Government Research Grant — ICT Division',
    description: 'Fictional demonstration. Government grant for ICT research (demo).',
    type: 'government',
    funder: 'Demo ICT Division (fictional)',
    amount: 'BDT 5,000,000 (demo)',
    eligibility: 'Faculty members and research groups (demo)',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40).toISOString(),
    url: 'https://example.gov/demo',
    sourceUrl: 'https://example.gov/demo',
    verification: 'submitted',
  },
  {
    title: '[Demo] University Research Grant — Demo University',
    description: 'Fictional demonstration. Internal university research grant (demo).',
    type: 'university',
    funder: 'Demo University (fictional)',
    amount: 'BDT 500,000 (demo)',
    eligibility: 'Faculty members (demo)',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),
    url: 'https://example.edu/demo-grant',
    sourceUrl: 'https://example.edu/demo-grant',
    verification: 'source-checked',
  },
  {
    title: '[Demo] International Travel Grant — Conference',
    description: 'Fictional demonstration. Conference travel grant (demo).',
    type: 'travel',
    funder: 'Demo International Society (fictional)',
    amount: 'USD 1,500 (demo)',
    eligibility: 'Students presenting at conference (demo)',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    url: 'https://example.org/demo-travel',
    sourceUrl: 'https://example.org/demo-travel',
    verification: 'source-checked',
  },
]

const DEMO_JOURNALS = [
  {
    title: '[Demo] Bangladesh Journal of Computer Science',
    issn: '0000-0000 (demo)',
    publisher: 'Demo Publisher (fictional)',
    subjectAreas: 'Computer Science, AI (demo)',
    scope: 'Demo scope — covers all areas of computer science (fictional).',
    website: 'https://example.org/demo-journal1',
    openAccess: true,
    verification: 'information-checked',
  },
  {
    title: '[Demo] South Asian Medical Research Review',
    issn: '1111-1111 (demo)',
    publisher: 'Demo Medical Press (fictional)',
    subjectAreas: 'Medicine, Public Health (demo)',
    scope: 'Demo scope — publishes medical research (fictional).',
    website: 'https://example.org/demo-journal2',
    openAccess: false,
    verification: 'listed',
  },
  {
    title: '[Demo] Journal of Engineering and Applied Sciences',
    eissn: '2222-2222 (demo)',
    publisher: 'Demo Engineering Society (fictional)',
    subjectAreas: 'Engineering (demo)',
    scope: 'Demo scope — engineering research (fictional).',
    website: 'https://example.org/demo-journal3',
    openAccess: true,
    verification: 'under-review',
  },
]

const DEMO_CONFERENCES = [
  {
    title: '[Demo] International Conference on AI in Bangladesh',
    organizer: 'Demo AI Society (fictional)',
    location: 'Dhaka, Bangladesh',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 75).toISOString(),
    submissionDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    website: 'https://example.org/demo-conf1',
    researchTracks: 'AI, ML, NLP, Computer Vision (demo)',
    registrationUrl: 'https://example.org/demo-conf1/register',
    proceedings: 'Demo proceedings (fictional)',
    publisher: 'Demo Publisher (fictional)',
    verification: 'information-checked',
  },
  {
    title: '[Demo] Bangladesh Engineering Conference',
    organizer: 'Demo Engineers Association (fictional)',
    location: 'Chittagong, Bangladesh',
    eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 50).toISOString(),
    submissionDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    website: 'https://example.org/demo-conf2',
    researchTracks: 'Civil, Mechanical, Electrical (demo)',
    registrationUrl: 'https://example.org/demo-conf2/register',
    proceedings: 'Demo proceedings (fictional)',
    publisher: 'Demo Publisher (fictional)',
    verification: 'listed',
  },
]

const DEMO_DATASETS = [
  {
    title: '[Demo] Bangla Sentiment Dataset',
    description: 'Fictional demonstration dataset. 5,000 Bangla product reviews labeled for sentiment (demo).',
    authorsList: JSON.stringify(['Demo Author 1', 'Demo Author 2']),
    researchDomain: 'NLP',
    dataModality: 'Text',
    fileFormat: 'CSV',
    sampleCount: '5000 (demo)',
    license: 'CC BY 4.0 (demo)',
    doi: '10.0000/demo.0001 (demo)',
    citation: 'Demo Author 1, Demo Author 2 (2024). Demo Bangla Sentiment Dataset. (Fictional.)',
    hostingPlatform: 'Demo Repository (fictional)',
    downloadUrl: 'https://example.org/demo-data1',
    associatedPub: 'Demo paper (fictional)',
    docsUrl: 'https://example.org/demo-data1/docs',
    verification: 'reviewed',
  },
  {
    title: '[Demo] Bangladesh Crop Image Dataset',
    description: 'Fictional demonstration dataset. 10,000 annotated crop images (demo).',
    authorsList: JSON.stringify(['Demo Researcher']),
    researchDomain: 'Computer Vision, Agriculture',
    dataModality: 'Image',
    fileFormat: 'JPG, JSON',
    sampleCount: '10000 (demo)',
    license: 'CC BY-NC 4.0 (demo)',
    doi: '10.0000/demo.0002 (demo)',
    citation: 'Demo Researcher (2024). Demo Crop Image Dataset. (Fictional.)',
    hostingPlatform: 'Demo Repository (fictional)',
    downloadUrl: 'https://example.org/demo-data2',
    associatedPub: 'Demo paper (fictional)',
    docsUrl: 'https://example.org/demo-data2/docs',
    verification: 'submitted',
  },
]

const DEMO_EVENTS = [
  {
    title: '[Demo] Workshop on Research Methodology',
    description: 'Fictional demonstration. A two-day workshop on research methodology (demo).',
    organizer: 'Demo University (fictional)',
    eventType: 'workshop',
    startDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    endDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
    location: 'Dhaka, Bangladesh',
    mode: 'offline',
    registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    registrationUrl: 'https://example.org/demo-event1/register',
    sourceUrl: 'https://example.org/demo-event1',
    status: 'upcoming',
  },
  {
    title: '[Demo] Webinar — Responsible AI in Research',
    description: 'Fictional demonstration. A webinar on responsible AI use (demo).',
    organizer: 'Demo AI Society (fictional)',
    eventType: 'webinar',
    startDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    endDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    location: 'Online',
    mode: 'online',
    registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    registrationUrl: 'https://example.org/demo-event2/register',
    sourceUrl: 'https://example.org/demo-event2',
    status: 'upcoming',
  },
]

const DEMO_ORGS = [
  {
    name: '[Demo] Bangladesh Demo University',
    type: 'university',
    description: 'Fictional demonstration university (demo).',
    website: 'https://example.org/demo-univ',
    location: 'Dhaka, Bangladesh',
    researchAreas: 'Computer Science, Engineering, Medicine (demo)',
    contactEmail: 'demo@example.org',
    verification: 'official-source-confirmed',
  },
  {
    name: '[Demo] Demo AI Research Lab',
    type: 'laboratory',
    description: 'Fictional demonstration AI research lab (demo).',
    website: 'https://example.org/demo-lab',
    location: 'Dhaka, Bangladesh',
    researchAreas: 'AI, ML, NLP (demo)',
    contactEmail: 'demo@example.org',
    verification: 'submitted',
  },
]

const DEMO_LESSONS = [
  {
    slug: 'intro-to-research',
    titleEn: 'Introduction to Research',
    titleBn: 'গবেষণার পরিচিতি',
    bodyEn: '## What is research?\n\nResearch is a systematic investigation to establish facts, solve problems, or develop new knowledge. In academia, research follows accepted methodologies, produces verifiable evidence, and is shared for peer review.\n\n## Why research matters\n\nResearch drives innovation, informs policy, and improves lives. In Bangladesh, research addresses local challenges in agriculture, health, climate, education, and technology.\n\n## This is a fictional demo lesson.\n\nThis content is placeholder text to demonstrate the Learning Hub. Replace with reviewed content before launch.',
    bodyBn: '## গবেষণা কী?\n\nগবেষণা হলো কোনো বিষয়ের পদ্ধতিগত অনুসন্ধান — তথ্য প্রতিষ্ঠা, সমস্যা সমাধান বা নতুন জ্ঞান তৈরির জন্য। একাডেমিয়ায় গবেষণা গৃহীত পদ্ধতি অনুসরণ করে, যাচাইযোগ্য প্রমাণ তৈরি করে এবং পিয়ার রিভিউয়ের জন্য শেয়ার করা হয়।\n\n## এটি একটি কাল্পনিক ডেমো পাঠ।\n\nএই কনটেন্ট লার্নিং হাব প্রদর্শনের জন্য প্লেসহোল্ডার। লঞ্চের আগে পর্যালোচিত কনটেন্ট দিয়ে প্রতিস্থাপন করুন।',
    category: 'fundamentals',
    durationMin: 15,
  },
  {
    slug: 'research-questions',
    titleEn: 'Research Questions',
    titleBn: 'গবেষণা প্রশ্ন',
    bodyEn: '## Formulating a research question\n\nA good research question is specific, measurable, and answerable. Use the FINER criteria: Feasible, Interesting, Novel, Ethical, Relevant.\n\n## This is a fictional demo lesson.',
    bodyBn: '## গবেষণা প্রশ্ন প্রণয়ন\n\nএকটি ভালো গবেষণা প্রশ্ন নির্দিষ্ট, পরিমাপযোগ্য এবং উত্তরযোগ্য হয়। FINER মানদণ্ড ব্যবহার করুন: Feasible, Interesting, Novel, Ethical, Relevant।',
    category: 'fundamentals',
    durationMin: 20,
  },
  {
    slug: 'literature-search',
    titleEn: 'Academic Literature Search',
    titleBn: 'একাডেমিক সাহিত্য অনুসন্ধান',
    bodyEn: '## Search strategies\n\nUse scholarly databases: Google Scholar, PubMed, IEEE Xplore, ACM Digital Library, Scopus, Web of Science. Build queries with Boolean operators (AND, OR, NOT) and track citations.\n\n## This is a fictional demo lesson.',
    bodyBn: '## অনুসন্ধান কৌশল\n\nস্কলারলি ডেটাবেস ব্যবহার করুন: Google Scholar, PubMed, IEEE Xplore, ACM Digital Library, Scopus, Web of Science।',
    category: 'literature',
    durationMin: 25,
  },
  {
    slug: 'python-for-research',
    titleEn: 'Python for Research',
    titleBn: 'গবেষণার জন্য পাইথন',
    bodyEn: '## Python in research\n\nPython is widely used for data analysis, scientific computing, and machine learning. Key libraries: NumPy, pandas, matplotlib, scikit-learn, PyTorch.\n\n## This is a fictional demo lesson.',
    bodyBn: '## গবেষণায় পাইথন\n\nপাইথন ডেটা বিশ্লেষণ, সায়েন্টিফিক কম্পিউটিং ও মেশিন লার্নিংয়ের জন্য ব্যাপকভাবে ব্যবহৃত।',
    category: 'data-analysis',
    durationMin: 30,
  },
  {
    slug: 'zotero-mendeley',
    titleEn: 'Reference Management: Zotero & Mendeley',
    titleBn: 'রেফারেন্স ব্যবস্থাপনা: Zotero ও Mendeley',
    bodyEn: '## Why use a reference manager?\n\nReference managers help you collect, organize, and cite sources. Zotero is open-source; Mendeley is free with extra features.\n\n## This is a fictional demo lesson.',
    bodyBn: '## রেফারেন্স ম্যানেজার কেন?\n\nরেফারেন্স ম্যানেজার সোর্স সংগ্রহ, সংগঠন ও উদ্ধৃতি করতে সাহায্য করে।',
    category: 'tools',
    durationMin: 20,
  },
  {
    slug: 'paper-structure',
    titleEn: 'Research Paper Structure',
    titleBn: 'রিসার্চ পেপারের কাঠামো',
    bodyEn: '## IMRaD structure\n\nMost scientific papers follow IMRaD: Introduction, Methods, Results, and Discussion. Add an abstract, references, and appendices as needed.\n\n## This is a fictional demo lesson.',
    bodyBn: '## IMRaD কাঠামো\n\nবেশিরভাগ সায়েন্টিফিক পেপার IMRaD অনুসরণ করে: Introduction, Methods, Results, Discussion।',
    category: 'writing',
    durationMin: 25,
  },
  {
    slug: 'research-ethics-intro',
    titleEn: 'Introduction to Research Ethics',
    titleBn: 'গবেষণা নৈতিকতার পরিচিতি',
    bodyEn: '## Core principles\n\nResearch ethics include honesty, objectivity, integrity, carefulness, openness, respect for intellectual property, confidentiality, responsible publication, responsible mentoring, respect for colleagues, social responsibility, non-discrimination, competence, legality, animal care, and human subjects protection.\n\n## This is a fictional demo lesson.',
    bodyBn: '## মৌলিক নীতি\n\nগবেষণা নৈতিকতার মূল নীতিগুলোর মধ্যে রয়েছে সততা, বস্তুনিষ্ঠতা, সততা, যত্নশীলতা, উন্মুক্ততা ইত্যাদি।',
    category: 'ethics',
    durationMin: 30,
  },
]

const DEMO_PATHS = [
  { slug: 'research-beginner', titleEn: 'Research Beginner', titleBn: 'গবেষণা শিক্ষার্থী', descriptionEn: 'Start from zero — fundamentals of research.', descriptionBn: 'শূন্য থেকে শুরু — গবেষণার মৌলিক বিষয়।' },
  { slug: 'first-manuscript', titleEn: 'First Manuscript', titleBn: 'প্রথম পাণ্ডুলিপি', descriptionEn: 'From idea to submitted manuscript.', descriptionBn: 'আইডিয়া থেকে জমা দেওয়া পাণ্ডুলিপি পর্যন্ত।' },
]

const DEMO_DISCUSSION_CATS = [
  { slug: 'methodology', nameEn: 'Research Methodology', nameBn: 'গবেষণা পদ্ধতি' },
  { slug: 'ai', nameEn: 'Artificial Intelligence', nameBn: 'কৃত্রিম বুদ্ধিমত্তা' },
  { slug: 'ml', nameEn: 'Machine Learning', nameBn: 'মেশিন লার্নিং' },
  { slug: 'nlp', nameEn: 'Natural Language Processing', nameBn: 'প্রাকৃতিক ভাষা প্রক্রিয়াজাতকরণ' },
  { slug: 'cv', nameEn: 'Computer Vision', nameBn: 'কম্পিউটার ভিশন' },
  { slug: 'medical-imaging', nameEn: 'Medical Imaging', nameBn: 'মেডিকেল ইমেজিং' },
  { slug: 'data-science', nameEn: 'Data Science', nameBn: 'ডেটা সায়েন্স' },
  { slug: 'statistics', nameEn: 'Statistics', nameBn: 'পরিসংখ্যান' },
  { slug: 'writing', nameEn: 'Academic Writing', nameBn: 'একাডেমিক লেখা' },
  { slug: 'publication', nameEn: 'Publication', nameBn: 'প্রকাশনা' },
  { slug: 'ethics', nameEn: 'Research Ethics', nameBn: 'গবেষণা নৈতিকতা' },
  { slug: 'dataset-support', nameEn: 'Dataset Support', nameBn: 'ডেটাসেট সহায়তা' },
]

const DEMO_QUESTIONS = [
  {
    title: '[Demo] How do I choose a research topic for my undergraduate thesis?',
    body: 'Fictional demo question. I am a final-year CSE student and need help selecting a research topic. Any advice on how to identify gaps?',
    tags: 'thesis, undergraduate, methodology',
    categorySlug: 'methodology',
  },
  {
    title: '[Demo] Best Python library for time-series forecasting?',
    body: 'Fictional demo question. I am working on a climate dataset and want to forecast temperature. What libraries should I consider?',
    tags: 'python, time-series, forecasting',
    categorySlug: 'data-science',
  },
]

export async function seedDemoData(db, { adminPassword, log = () => {} } = {}) {
  const existingUsers = await db.user.count()
  if (existingUsers === 0) {
    // Create demo users
    for (const u of DEMO_USERS) {
      const pw = u.role === 'ADMIN' ? adminPassword : u.password
      if (!pw) { log('Skipping demo admin: no admin password provided'); continue }
      const passwordHash = await bcrypt.hash(pw, 10)
      const user = await db.user.create({
        data: {
          email: u.email,
          name: u.name,
          passwordHash,
          role: u.role,
          bio: u.bio,
        },
      })
      await db.profile.create({
        data: {
          userId: user.id,
          institution: u.role === 'FACULTY' ? 'Demo University (fictional)' : null,
          department: u.role === 'FACULTY' ? 'Computer Science (demo)' : null,
          position: u.role === 'FACULTY' ? 'Assistant Professor (demo)' : null,
          researchInterests: u.researchInterests ?? null,
          technicalSkills: u.technicalSkills ?? null,
          orcid: u.role === 'FACULTY' ? '0000-0000-0000-0000 (demo)' : null,
        },
      })
      if (u.role === 'FACULTY') {
        await db.mentorPreference.create({
          data: {
            userId: user.id,
            isAvailable: true,
            researchAreas: u.researchInterests ?? 'NLP, Computer Vision (demo)',
            preferredSkills: 'Python, PyTorch (demo)',
            currentProjects: 'Demo project on Bangla NLP (fictional)',
            collaborationNotes: 'Open to collaboration on NLP and language technology (demo)',
          },
        })
      }
    }
  }

  const existingOpps = await db.opportunity.count()
  if (existingOpps === 0) {
    for (const o of DEMO_OPPS) {
      await db.opportunity.create({ data: o })
    }
  }

  const existingFunding = await db.fundingCall.count()
  if (existingFunding === 0) {
    for (const f of DEMO_FUNDING) {
      await db.fundingCall.create({ data: f })
    }
  }

  const existingJournals = await db.journal.count()
  if (existingJournals === 0) {
    for (const j of DEMO_JOURNALS) {
      await db.journal.create({ data: j })
    }
  }

  const existingConfs = await db.conference.count()
  if (existingConfs === 0) {
    for (const c of DEMO_CONFERENCES) {
      await db.conference.create({ data: c })
    }
  }

  const existingDatasets = await db.dataset.count()
  if (existingDatasets === 0) {
    for (const d of DEMO_DATASETS) {
      await db.dataset.create({ data: d })
    }
  }

  const existingEvents = await db.academicEvent.count()
  if (existingEvents === 0) {
    for (const ev of DEMO_EVENTS) {
      await db.academicEvent.create({ data: ev })
    }
  }

  const existingOrgs = await db.organization.count()
  if (existingOrgs === 0) {
    const admin = (await db.user.findUnique({ where: { email: 'admin@demo.researcherbd.org' } }))
      ?? (await db.user.findUnique({ where: { email: 'ayesha@demo.researcherbd.org' } }))
    if (admin) {
      for (const org of DEMO_ORGS) {
        await db.organization.create({
          data: { ...org, ownerId: admin.id },
        })
      }
    }
  }

  const existingCats = await db.discussionCategory.count()
  if (existingCats === 0) {
    for (const c of DEMO_DISCUSSION_CATS) {
      await db.discussionCategory.create({
        data: { slug: c.slug, nameEn: c.nameEn, nameBn: c.nameBn },
      })
    }
  }

  const existingQuestions = await db.question.count()
  if (existingQuestions === 0) {
    const student = await db.user.findUnique({ where: { email: 'nusrat@demo.researcherbd.org' } })
    if (student) {
      for (const q of DEMO_QUESTIONS) {
        const cat = await db.discussionCategory.findUnique({ where: { slug: q.categorySlug } })
        await db.question.create({
          data: {
            authorId: student.id,
            title: q.title,
            body: q.body,
            tags: q.tags,
            categoryId: cat?.id,
          },
        })
      }
    }
  }

  const existingLessons = await db.lesson.count()
  if (existingLessons === 0) {
    // Create learning categories
    const cats = [
      { slug: 'fundamentals', nameEn: 'Research Fundamentals', nameBn: 'গবেষণার মৌলিক বিষয়' },
      { slug: 'literature', nameEn: 'Literature Review', nameBn: 'সাহিত্য পর্যালোচনা' },
      { slug: 'data-analysis', nameEn: 'Data Analysis', nameBn: 'তথ্য বিশ্লেষণ' },
      { slug: 'tools', nameEn: 'Research Tools', nameBn: 'গবেষণা সরঞ্জাম' },
      { slug: 'writing', nameEn: 'Academic Writing', nameBn: 'একাডেমিক লেখা' },
      { slug: 'ethics', nameEn: 'Research Ethics', nameBn: 'গবেষণা নৈতিকতা' },
    ]
    for (const c of cats) {
      await db.learningCategory.create({ data: c })
    }
    for (const l of DEMO_LESSONS) {
      const cat = await db.learningCategory.findUnique({ where: { slug: l.category } })
      await db.lesson.create({
        data: {
          slug: l.slug,
          titleEn: l.titleEn,
          titleBn: l.titleBn,
          bodyEn: l.bodyEn,
          bodyBn: l.bodyBn,
          category: l.category,
          categoryId: cat?.id,
          durationMin: l.durationMin,
        },
      })
    }
    for (const p of DEMO_PATHS) {
      await db.learningPath.create({
        data: {
          slug: p.slug,
          titleEn: p.titleEn,
          titleBn: p.titleBn,
          descriptionEn: p.descriptionEn,
          descriptionBn: p.descriptionBn,
        },
      })
    }
  }

  // ── Extra demo content: labs, collaboration board, a sample project, answers, notifications ──
  const ayesha = await db.user.findUnique({ where: { email: 'ayesha@demo.researcherbd.org' } })
  const tanvir = await db.user.findUnique({ where: { email: 'tanvir@demo.researcherbd.org' } })
  const nusrat = await db.user.findUnique({ where: { email: 'nusrat@demo.researcherbd.org' } })
  if (!ayesha || !tanvir || !nusrat) return

  if ((await db.laboratory.count()) === 0) {
    const univ = await db.organization.findFirst({ where: { type: 'university' } })
    const labs = [
      { name: '[Demo] Bangla Language Technology Lab', description: 'Fictional lab working on Bangla NLP: tokenisation, speech, and low-resource machine translation (demo).', researchAreas: 'NLP, Speech, Machine Translation', location: 'Dhaka, Bangladesh', verification: 'submitted' },
      { name: '[Demo] Medical Imaging & Explainable AI Group', description: 'Fictional group studying explainable deep learning for medical image classification (demo).', researchAreas: 'Computer Vision, Explainable AI, Medical Imaging', location: 'Dhaka, Bangladesh', verification: 'listed' },
      { name: '[Demo] Climate Resilience Data Lab', description: 'Fictional lab building open datasets on floods, salinity and cyclones in coastal Bangladesh (demo).', researchAreas: 'Climate Science, Remote Sensing, Data Science', location: 'Khulna, Bangladesh', verification: 'submitted' },
    ]
    for (const l of labs) {
      const lab = await db.laboratory.create({ data: { ...l, ownerId: ayesha.id, organizationId: univ?.id ?? null } })
      await db.laboratoryMember.create({ data: { laboratoryId: lab.id, userId: ayesha.id, role: 'lead' } }).catch(() => {})
    }
  }

  if ((await db.collaborationPost.count()) === 0) {
    const posts = [
      { authorId: ayesha.id, title: '[Demo] Looking for a research assistant — Bangla sentiment corpus', body: 'Fictional post. We need one undergraduate RA (10 h/week) to help annotate and validate a Bangla sentiment dataset. Python basics required.', category: 'research-assistant', researchArea: 'NLP' },
      { authorId: tanvir.id, title: '[Demo] Co-author wanted for a survey on low-resource MT', body: 'Fictional post. Writing a survey of machine translation for South Asian languages; looking for one co-author with MT experience.', category: 'co-author', researchArea: 'Machine Translation' },
      { authorId: nusrat.id, title: '[Demo] Seeking a mentor for my thesis on plant-disease detection', body: 'Fictional post. Final-year student building a CNN for rice leaf disease detection. Looking for guidance on dataset design and evaluation.', category: 'mentorship', researchArea: 'Computer Vision' },
    ]
    for (const p of posts) await db.collaborationPost.create({ data: p })
  }

  if ((await db.researchProject.count()) === 0) {
    const day = 1000 * 60 * 60 * 24
    const proj = await db.researchProject.create({ data: {
      title: '[Demo] Explainable rice-leaf disease classification',
      description: 'Fictional sample project showing tasks, milestones, resources and notes.',
      researchDomain: 'Computer Vision', objectives: 'Build a dataset, train a ViT/CNN baseline, evaluate Grad-CAM explanations.',
      status: 'active', isPrivate: false, startDate: new Date(), expectedEnd: new Date(Date.now() + 120 * day), ownerId: ayesha.id,
    } })
    await db.projectMember.create({ data: { projectId: proj.id, userId: ayesha.id, role: 'owner' } })
    await db.projectMember.create({ data: { projectId: proj.id, userId: nusrat.id, role: 'member' } })
    await db.projectMember.create({ data: { projectId: proj.id, userId: tanvir.id, role: 'lead' } })
    const tasks = [
      { title: 'Collect and label 2,000 leaf images', status: 'in-progress', priority: 'high', assigneeId: nusrat.id, dueDate: new Date(Date.now() + 14 * day) },
      { title: 'Train ResNet-50 baseline', status: 'todo', priority: 'medium', assigneeId: tanvir.id, dueDate: new Date(Date.now() + 30 * day) },
      { title: 'Literature review: XAI for plant pathology', status: 'done', priority: 'medium', assigneeId: nusrat.id },
      { title: 'Draft ethics statement', status: 'review', priority: 'low', assigneeId: ayesha.id, dueDate: new Date(Date.now() + 7 * day) },
    ]
    for (const t of tasks) await db.projectTask.create({ data: { ...t, projectId: proj.id, createdById: ayesha.id } })
    const ms = [
      { title: 'Dataset v1 frozen', dueDate: new Date(Date.now() + 21 * day) },
      { title: 'Baseline results', dueDate: new Date(Date.now() + 45 * day) },
      { title: 'Paper draft submitted', dueDate: new Date(Date.now() + 110 * day) },
    ]
    for (const m of ms) await db.projectMilestone.create({ data: { ...m, projectId: proj.id } })
  }

  if ((await db.answer.count()) === 0) {
    const qs = await db.question.findMany({ take: 2, orderBy: { createdAt: 'asc' } })
    if (qs[0]) await db.answer.create({ data: { questionId: qs[0].id, authorId: ayesha.id, body: 'Demo answer. Start from a problem you have observed, read 10–15 recent papers around it, and narrow down to one question you can answer with the data and time you have.' } })
    if (qs[1]) await db.answer.create({ data: { questionId: qs[1].id, authorId: tanvir.id, body: 'Demo answer. Try statsmodels (ARIMA/SARIMAX) for a classical baseline, then Prophet or a gradient-boosting model with lag features. Always compare against a naive seasonal baseline.' } })
  }

  if ((await db.notification.count()) === 0) {
    for (const u of [ayesha, tanvir, nusrat]) {
      await db.notification.create({ data: { userId: u.id, type: 'project', title: 'Welcome to Researcher BD (demo)', body: 'This is a demonstration account. Explore projects, the collaboration board and the learning hub.', link: '#/dashboard' } })
    }
  }
}
