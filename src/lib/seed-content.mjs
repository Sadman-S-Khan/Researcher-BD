// Real starter content for Researcher BD.
// Every record links to its official source. Dates were checked on 2026-11-07 from the official
// websites listed in `website` / `sourceUrl`; verification is set honestly ("source-checked" when the
// official page was read, "listed" when only the listing was confirmed). Where a date could not be
// confirmed it is left empty and the description says to check the official circular.

import { BANGLAJOL } from './data/banglajol.mjs'
import { INTERNATIONAL_JOURNALS, BD_CONFERENCES, INTL_CONFERENCES } from './data/international.mjs'

export const CHECKED_AT = new Date('2026-11-07T00:00:00Z')

const CORE_CONFERENCES = [
  {
    title: '29th International Conference on Computer and Information Technology (ICCIT 2026)',
    organizer: 'IEEE Bangladesh Section',
    location: "Cox's Bazar, Bangladesh (hybrid)",
    eventDate: new Date('2026-12-18'),
    submissionDeadline: new Date('2026-08-31'),
    website: 'https://iccit.org.bd/2026/',
    researchTracks: 'Computer science, information technology, AI and data science, networks and security, software engineering',
    proceedings: 'Accepted and presented papers are submitted for inclusion in IEEE Xplore (subject to IEEE scope and quality requirements).',
    publisher: 'IEEE (Xplore submission)',
    verification: 'source-checked',
  },
  {
    title: '14th International Conference on Electrical and Computer Engineering (ICECE 2026)',
    organizer: 'Department of EEE, BUET (technically co-sponsored by IEEE Bangladesh Section)',
    location: 'BUET, Dhaka, Bangladesh',
    eventDate: new Date('2026-12-10'),
    submissionDeadline: new Date('2026-09-15'),
    website: 'https://icece.org.bd/2026/',
    researchTracks: 'AI and data science; computer systems, networks and security; signal processing, computer vision and HCI; communication systems; electronic devices, materials and photonics; VLSI and nanotechnology; power, energy and smart grid; robotics, automation and biomedical engineering',
    proceedings: 'Accepted and presented papers are submitted for inclusion in IEEE Xplore (subject to IEEE scope and quality requirements).',
    publisher: 'IEEE (Xplore submission)',
    verification: 'source-checked',
  },
  {
    title: '7th International Conference on Electrical Engineering and Information & Communication Technology (ICEEICT 2027)',
    organizer: 'Department of EECE, Military Institute of Science and Technology (MIST)',
    location: 'MIST, Mirpur Cantonment, Dhaka (hybrid)',
    eventDate: new Date('2027-01-28'),
    submissionDeadline: new Date('2026-11-10'),
    website: 'https://iceeict.mist.ac.bd/',
    researchTracks: 'All areas of electrical engineering and information and communication technology',
    proceedings: 'Accepted and presented papers are submitted for inclusion in IEEE Xplore (subject to IEEE scope and quality requirements).',
    publisher: 'IEEE (Xplore submission)',
    verification: 'source-checked',
  },
  {
    title: 'International Conference on Appropriate Technology and Sustainability (ICATS 2027)',
    organizer: 'Institute of Appropriate Technology (IAT), BUET',
    location: 'BUET, Dhaka, Bangladesh',
    eventDate: new Date('2027-01-19'),
    submissionDeadline: new Date('2026-09-30'),
    website: 'https://www.icatsbuet.com',
    researchTracks: 'Sustainable industrial systems; water and climate resilience; appropriate technology for enterprises and SMEs; community-focused technology; digital technology for sustainability; sustainable materials; policy and technology transfer',
    proceedings: 'See the conference website. Camera-ready manuscripts due 30 November 2026.',
    publisher: null,
    verification: 'listed',
  },
  {
    title: 'International Conference on Electrical, Computer and Communication Engineering (ECCE 2027)',
    organizer: 'Faculty of Electrical and Computer Engineering, CUET',
    location: 'CUET, Chattogram, Bangladesh',
    eventDate: new Date('2027-02-04'),
    submissionDeadline: null,
    website: 'https://ecce2027.cuet.ac.bd/',
    researchTracks: 'Power and renewable energy; VLSI and embedded systems; communications and signal processing; computer vision; Bangla language processing; AI, ML, IoT and blockchain; cybersecurity; biomedical engineering and medical imaging',
    proceedings: 'Accepted and presented papers are submitted for inclusion in IEEE Xplore (subject to IEEE scope and quality requirements).',
    publisher: 'IEEE (Xplore submission)',
    verification: 'source-checked',
  },
]

const CORE_JOURNALS = [
  { title: 'Dhaka University Journal of Science', issn: '1022-2502', eissn: '2408-8528', publisher: 'Faculty of Science, University of Dhaka', subjectAreas: 'Physical sciences, mathematics, chemistry, biological sciences', scope: 'Peer-reviewed research across the natural and mathematical sciences.', website: 'https://www.banglajol.info/index.php/DUJS' },
  { title: 'Journal of the Bangladesh Academy of Sciences', publisher: 'Bangladesh Academy of Sciences', subjectAreas: 'Multidisciplinary science', scope: 'Original research in physical, biological, agricultural and medical sciences.', website: 'https://www.banglajol.info/index.php/JBAS' },
  { title: 'Bangladesh Journal of Medical Science', subjectAreas: 'Medicine, public health, biomedical science', scope: 'Clinical and basic medical research, reviews and case reports.', website: 'https://www.banglajol.info/index.php/BJMS' },
  { title: 'Bangladesh Medical Research Council Bulletin', publisher: 'Bangladesh Medical Research Council (BMRC)', subjectAreas: 'Medical and health research', scope: 'Health and medical research relevant to Bangladesh.', website: 'https://www.banglajol.info/index.php/BMRCB' },
  { title: 'Bangladesh Journal of Agricultural Research', issn: '0258-7122', eissn: '2408-8293', publisher: 'Bangladesh Agricultural Research Institute (BARI)', subjectAreas: 'Agronomy, crop science, horticulture, soil science', scope: 'Agricultural research with emphasis on crops and farming systems of Bangladesh.', website: 'https://www.banglajol.info/index.php/BJAR' },
  { title: 'Journal of the Bangladesh Agricultural University', publisher: 'Bangladesh Agricultural University (BAU)', subjectAreas: 'Agriculture, veterinary science, fisheries, agricultural economics', scope: 'Research from agriculture and allied disciplines.', website: 'https://www.banglajol.info/index.php/JBAU' },
  { title: 'Bangladesh Journal of Scientific and Industrial Research', publisher: 'Bangladesh Council of Scientific and Industrial Research (BCSIR)', subjectAreas: 'Applied chemistry, materials, food science, industrial research', scope: 'Applied and industrial research in science and technology.', website: 'https://www.banglajol.info/index.php/BJSIR' },
  { title: 'Bangladesh Journal of Botany', publisher: 'Bangladesh Botanical Society', subjectAreas: 'Plant science, ecology, taxonomy, plant biotechnology', scope: 'Research in all branches of plant science.', website: 'https://www.banglajol.info/index.php/BJB' },
  { title: 'Dhaka University Journal of Applied Science and Engineering', publisher: 'University of Dhaka', subjectAreas: 'Engineering, applied physics, computer science', scope: 'Applied science and engineering research.', website: 'https://www.banglajol.info/index.php/DUJASE' },
  { title: 'Journal of Scientific Research', subjectAreas: 'Physics, chemistry, mathematics, biological sciences', scope: 'Peer-reviewed research in the physical and life sciences.', website: 'https://www.banglajol.info/index.php/JSR' },
].map(j => ({ ...j, openAccess: null, verification: 'listed', indexingClaims: null }))

const coreUrls = new Set(CORE_JOURNALS.map(j => j.website))
export const JOURNALS = [
  ...CORE_JOURNALS,
  ...BANGLAJOL
    .map(b => ({ title: b.title, subjectAreas: b.subjectAreas, website: `https://www.banglajol.info/index.php/${b.slug}`, scope: 'Journal hosted on Bangladesh Journals Online (BanglaJOL). See the journal page for its aims, scope and submission guidelines.', publisher: null, openAccess: null, verification: 'listed', indexingClaims: null }))
    .filter(j => !coreUrls.has(j.website)),
  ...INTERNATIONAL_JOURNALS.map(j => ({ ...j, scope: `${j.subjectAreas}. See the official journal website for aims and scope.` })),
]

export const CONFERENCES = [...CORE_CONFERENCES, ...BD_CONFERENCES, ...INTL_CONFERENCES]

const MOST = 'https://most.gov.bd/'
export const FUNDING = [
  { title: 'Science and Technology Fellowship (STFT)', type: 'government', funder: 'Science and Technology Fellowship Trust, Ministry of Science and Technology', amount: 'As per the Fellowship Policy 2025 (revised)', eligibility: 'Bangladeshi citizens pursuing MS, MPhil or PhD in science and technology, in Bangladesh or abroad.', description: 'Fellowship for higher studies and research in science and technology (formerly the Bangabandhu Science and Technology Fellowship). Use the dates in the live circular.', url: 'https://grant.most.gov.bd/en/services/stft/stft-fellowship', sourceUrl: 'https://grant.most.gov.bd/en/services/stft/stft-fellowship' },
  { title: 'National Science and Technology (NST) Fellowship', type: 'government', funder: 'Ministry of Science and Technology', amount: 'Monthly fellowship; see the current circular', eligibility: 'MS, MPhil and PhD researchers in science and technology at Bangladeshi institutions.', description: 'Annual government fellowship supporting thesis research in science, engineering, agriculture and medical science. The call is usually announced once a year on the Ministry website.', url: MOST, sourceUrl: MOST },
  { title: 'ICT Division Fellowship for Research and Innovation', type: 'government', funder: 'Information and Communication Technology Division', amount: 'See the current circular', eligibility: 'MS, MPhil, PhD researchers and innovators working on ICT topics.', description: 'Annual fellowships and grants for ICT research and innovation projects. Check the ICT Division notice board for the open call.', url: 'https://ictd.gov.bd/', sourceUrl: 'https://ictd.gov.bd/' },
  { title: 'UGC PhD Fellowship', type: 'government', funder: 'University Grants Commission of Bangladesh', amount: 'See the current circular', eligibility: 'Teachers and researchers enrolled in PhD programmes at Bangladeshi public universities.', description: 'Fellowship for full-time PhD research at public universities, announced through university notices and the UGC website.', url: 'https://ugc.gov.bd/', sourceUrl: 'https://ugc.gov.bd/' },
  { title: 'Prime Minister Education Assistance Trust — PhD Fellowship', type: 'government', funder: 'Prime Minister Education Assistance Trust', amount: 'See the current circular', eligibility: 'PhD researchers at Bangladeshi universities (see circular for criteria).', description: 'PhD fellowship offered through the Prime Minister Education Assistance Trust. Applications are invited by public circular.', url: 'https://pmeat.gov.bd/', sourceUrl: 'https://pmeat.gov.bd/' },
].map(f => ({ ...f, deadline: null, verification: 'listed' }))

export const OPPORTUNITIES = [
  { title: 'Commonwealth PhD Scholarships for Least Developed Countries and Fragile States', type: 'phd', researchDomain: 'All disciplines', organization: 'Commonwealth Scholarship Commission in the UK', location: 'United Kingdom', fundingAmount: 'Fully funded (tuition, stipend, airfare)', eligibility: 'Citizens of eligible Commonwealth countries, including Bangladesh, holding a first-class or upper second-class degree.', description: 'Fully funded PhD study at a UK university. The 2027/28 round closed in August 2026; the next round is announced on the CSC website.', applicationUrl: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-phd-scholarships/', sourceUrl: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-phd-scholarships/', verification: 'listed' },
  { title: 'Chevening Scholarships (Bangladesh)', type: 'scholarship', researchDomain: 'All disciplines (master’s)', organization: 'UK Foreign, Commonwealth & Development Office', location: 'United Kingdom', fundingAmount: 'Fully funded one-year master’s', eligibility: 'Bangladeshi citizens with an undergraduate degree and at least two years of work experience.', description: 'One-year master’s degree at any UK university. The 2027/28 application window closed in October 2026; applications for the next cycle normally open in August.', applicationUrl: 'https://www.chevening.org/scholarship/bangladesh/', sourceUrl: 'https://www.chevening.org/scholarship/bangladesh/', verification: 'source-checked' },
  { title: 'Fulbright Foreign Student Program', type: 'scholarship', researchDomain: 'All disciplines', organization: 'U.S. Department of State', location: 'United States', fundingAmount: 'Typically covers tuition, living costs and airfare', eligibility: 'Bangladeshi graduates applying for master’s or PhD study in the US (see country page for current requirements).', description: 'Graduate study and research in the United States. Application timelines are set by the U.S. Embassy in Dhaka each year.', applicationUrl: 'https://foreign.fulbrightonline.org/', sourceUrl: 'https://foreign.fulbrightonline.org/', verification: 'listed' },
  { title: 'MEXT Japanese Government Scholarship (Research Students)', type: 'scholarship', researchDomain: 'All disciplines', organization: 'Ministry of Education, Culture, Sports, Science and Technology (Japan)', location: 'Japan', fundingAmount: 'Tuition, monthly stipend and airfare', eligibility: 'Bangladeshi graduates seeking master’s or doctoral research in Japan, through Embassy or university recommendation.', description: 'Research-student scholarship to study at a Japanese university. Embassy recommendation is announced by the Embassy of Japan in Bangladesh.', applicationUrl: 'https://www.bd.emb-japan.go.jp/', sourceUrl: 'https://www.bd.emb-japan.go.jp/', verification: 'listed' },
  { title: 'DAAD Scholarships for Study and Research in Germany', type: 'international', researchDomain: 'All disciplines', organization: 'German Academic Exchange Service (DAAD)', location: 'Germany', fundingAmount: 'Varies by programme', eligibility: 'Graduates, doctoral candidates and researchers; requirements vary by programme.', description: 'Doctoral, research-stay and development-related postgraduate scholarships. Use the DAAD scholarship database to find open calls for Bangladesh.', applicationUrl: 'https://www.daad.de/en/', sourceUrl: 'https://www.daad.de/en/', verification: 'listed' },
  { title: 'Erasmus Mundus Joint Master’s Scholarships', type: 'international', researchDomain: 'All disciplines', organization: 'European Union (Erasmus+)', location: 'Europe (multiple countries)', fundingAmount: 'Full scholarship for selected students', eligibility: 'Students worldwide, including Bangladesh; each joint master’s sets its own criteria and deadline.', description: 'Integrated master’s programmes delivered by university consortia across Europe. Deadlines are usually between October and January.', applicationUrl: 'https://erasmus-plus.ec.europa.eu/', sourceUrl: 'https://erasmus-plus.ec.europa.eu/', verification: 'listed' },
].map(o => ({ ...o, deadline: null, qualifications: null }))

export const ORGANIZATIONS = [
  { name: 'University of Dhaka', type: 'university', location: 'Dhaka', website: 'https://www.du.ac.bd/', researchAreas: 'Sciences, arts, social sciences, business, medicine, engineering', description: 'The oldest public university in Bangladesh (founded 1921).' },
  { name: 'Bangladesh University of Engineering and Technology (BUET)', type: 'university', location: 'Dhaka', website: 'https://www.buet.ac.bd/', researchAreas: 'Engineering, architecture, planning, technology', description: 'Leading public engineering university.' },
  { name: 'University of Rajshahi', type: 'university', location: 'Rajshahi', website: 'https://www.ru.ac.bd/', researchAreas: 'Sciences, agriculture, arts, social sciences', description: 'Major public university in northern Bangladesh.' },
  { name: 'University of Chittagong', type: 'university', location: 'Chattogram', website: 'https://cu.ac.bd/', researchAreas: 'Sciences, marine sciences, arts, social sciences, business', description: 'Large public university in Chattogram.' },
  { name: 'Jahangirnagar University', type: 'university', location: 'Savar, Dhaka', website: 'https://juniv.edu/', researchAreas: 'Sciences, environmental science, arts, social sciences', description: 'Residential public university near Dhaka.' },
  { name: 'Shahjalal University of Science and Technology (SUST)', type: 'university', location: 'Sylhet', website: 'https://www.sust.edu/', researchAreas: 'Science, engineering, technology', description: 'Public science and technology university.' },
  { name: 'Bangladesh Agricultural University (BAU)', type: 'university', location: 'Mymensingh', website: 'https://bau.edu.bd/', researchAreas: 'Agriculture, veterinary science, fisheries, agricultural engineering', description: 'Premier agricultural university.' },
  { name: 'Khulna University of Engineering & Technology (KUET)', type: 'university', location: 'Khulna', website: 'https://www.kuet.ac.bd/', researchAreas: 'Engineering and technology', description: 'Public engineering university.' },
  { name: 'Chittagong University of Engineering & Technology (CUET)', type: 'university', location: 'Chattogram', website: 'https://www.cuet.ac.bd/', researchAreas: 'Engineering and technology', description: 'Public engineering university.' },
  { name: 'Rajshahi University of Engineering & Technology (RUET)', type: 'university', location: 'Rajshahi', website: 'https://www.ruet.ac.bd/', researchAreas: 'Engineering and technology', description: 'Public engineering university.' },
  { name: 'Military Institute of Science and Technology (MIST)', type: 'university', location: 'Dhaka', website: 'https://mist.ac.bd/', researchAreas: 'Engineering, science and technology', description: 'Engineering university under the Bangladesh Armed Forces.' },
  { name: 'North South University', type: 'university', location: 'Dhaka', website: 'https://www.northsouth.edu/', researchAreas: 'Engineering, public health, business, life sciences', description: 'Private research university.' },
  { name: 'BRAC University', type: 'university', location: 'Dhaka', website: 'https://www.bracu.ac.bd/', researchAreas: 'Computer science, public health, development studies, engineering', description: 'Private university.' },
  { name: 'Daffodil International University', type: 'university', location: 'Dhaka', website: 'https://daffodilvarsity.edu.bd/', researchAreas: 'Computer science, engineering, business, health sciences', description: 'Private university.' },
  { name: 'icddr,b', type: 'centre', location: 'Dhaka', website: 'https://www.icddrb.org/', researchAreas: 'Global health, infectious disease, nutrition, population science', description: 'International health research institute based in Dhaka.' },
  { name: 'Bangladesh Council of Scientific and Industrial Research (BCSIR)', type: 'centre', location: 'Dhaka', website: 'https://bcsir.gov.bd/', researchAreas: 'Applied chemistry, food science, materials, biotechnology', description: 'National organisation for scientific and industrial research.' },
  { name: 'Bangladesh Agricultural Research Institute (BARI)', type: 'centre', location: 'Gazipur', website: 'https://bari.gov.bd/', researchAreas: 'Crop research (non-rice), horticulture, farm machinery', description: 'Largest multi-crop agricultural research institute.' },
  { name: 'Bangladesh Rice Research Institute (BRRI)', type: 'centre', location: 'Gazipur', website: 'https://brri.gov.bd/', researchAreas: 'Rice breeding, agronomy, plant protection', description: 'National institute for rice research.' },
  { name: 'Bangladesh Institute of Development Studies (BIDS)', type: 'centre', location: 'Dhaka', website: 'https://bids.org.bd/', researchAreas: 'Development economics, poverty, social policy', description: 'Public policy research institute.' },
  { name: 'Bangladesh Atomic Energy Commission (BAEC)', type: 'centre', location: 'Dhaka', website: 'https://baec.gov.bd/', researchAreas: 'Nuclear science, medical physics, materials', description: 'National nuclear science and technology research body.' },
  { name: 'Bangladesh Academy of Sciences', type: 'hub', location: 'Dhaka', website: 'https://bas.org.bd/', researchAreas: 'All sciences', description: 'National academy of scientists; publishes the Journal of the Bangladesh Academy of Sciences.' },
].map(o => ({ ...o, verification: 'listed', contactEmail: null }))

export const DATASETS = [
  { title: 'BanglaLekha-Isolated: Handwritten Bangla Isolated Characters', description: 'Images of handwritten Bangla numerals, basic characters and compound characters, collected from writers of different ages and genders.', authorsList: ['Mithun Biswas', 'Rafiqul Islam', 'Gautam Kumar Shom', 'Md Shopon', 'Nabeel Mohammed', 'Sifat Momen', 'Anowarul Abedin'], researchDomain: 'Computer Vision, OCR', dataModality: 'Image', fileFormat: 'PNG', doi: '10.17632/hf6sf8zrkc.2', citation: 'Biswas M, Islam R, Shom GK, et al. BanglaLekha-Isolated: A multi-purpose comprehensive dataset of handwritten Bangla isolated characters. Data in Brief, 2017.', hostingPlatform: 'Mendeley Data', downloadUrl: 'https://data.mendeley.com/datasets/hf6sf8zrkc/2', associatedPub: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5382023/', verification: 'source-checked' },
  { title: 'Bangladesh Demographic and Health Survey (BDHS) 2022', description: 'Nationally representative household survey on fertility, family planning, maternal and child health, nutrition and more. Free access after registration with The DHS Program.', authorsList: ['National Institute of Population Research and Training (NIPORT)', 'ICF'], researchDomain: 'Public Health, Demography', dataModality: 'Survey (tabular)', fileFormat: 'Stata, SPSS, SAS, CSV', hostingPlatform: 'The DHS Program', downloadUrl: 'https://dhsprogram.com/data/dataset/Bangladesh_Standard-DHS_2022.cfm?flag=0', license: 'Free with registration (DHS terms of use)', verification: 'source-checked' },
  { title: 'Bengali.AI Handwritten Grapheme Classification', description: 'Competition dataset of handwritten Bangla graphemes labelled by root, vowel diacritic and consonant diacritic.', authorsList: ['Bengali.AI'], researchDomain: 'Computer Vision, OCR', dataModality: 'Image', fileFormat: 'Parquet, CSV', hostingPlatform: 'Kaggle', downloadUrl: 'https://www.kaggle.com/c/bengaliai-cv19', verification: 'listed' },
  { title: 'World Bank Open Data: Bangladesh', description: 'Development indicators for Bangladesh: economy, education, health, environment, population. Downloadable time series.', authorsList: ['The World Bank'], researchDomain: 'Economics, Development', dataModality: 'Tabular (time series)', fileFormat: 'CSV, XLSX, API', hostingPlatform: 'World Bank', downloadUrl: 'https://data.worldbank.org/country/bangladesh', license: 'CC BY 4.0', verification: 'listed' },
  { title: 'Humanitarian Data Exchange (HDX): Bangladesh', description: 'Collection of datasets on Bangladesh from humanitarian organisations: administrative boundaries, population, floods, cyclones, health facilities.', authorsList: ['OCHA Centre for Humanitarian Data and contributing organisations'], researchDomain: 'Geography, Disaster Management, Climate', dataModality: 'Geospatial and tabular', fileFormat: 'CSV, SHP, GeoJSON, XLSX', hostingPlatform: 'HDX', downloadUrl: 'https://data.humdata.org/group/bgd', license: 'Varies by dataset', verification: 'listed' },
  { title: 'Bangladesh Bureau of Statistics (BBS) Publications and Census Data', description: 'Official national statistics, including the Population and Housing Census 2022, Labour Force Survey and Household Income and Expenditure Survey reports.', authorsList: ['Bangladesh Bureau of Statistics'], researchDomain: 'Statistics, Social Science, Economics', dataModality: 'Reports and tables', fileFormat: 'PDF, XLSX', hostingPlatform: 'BBS', downloadUrl: 'https://bbs.gov.bd/', verification: 'listed' },
].map(d => ({ ...d, authorsList: JSON.stringify(d.authorsList) }))

export const EVENTS = CONFERENCES.filter(c => c.eventDate && /Bangladesh/.test(c.location || '')).map(c => ({
  title: c.title,
  description: [c.researchTracks, c.proceedings].filter(Boolean).join('. '),
  organizer: c.organizer,
  eventType: 'conference',
  startDateTime: c.eventDate,
  location: c.location,
  mode: /hybrid/i.test(c.location) ? 'hybrid' : 'offline',
  registrationUrl: c.website,
  sourceUrl: c.website,
  status: 'upcoming',
  verification: c.verification,
}))

export const LEARNING_CATEGORIES = [
  { slug: 'fundamentals', nameEn: 'Research Fundamentals', nameBn: 'গবেষণার মৌলিক বিষয়' },
  { slug: 'literature', nameEn: 'Literature Review', nameBn: 'সাহিত্য পর্যালোচনা' },
  { slug: 'data-analysis', nameEn: 'Data Analysis', nameBn: 'তথ্য বিশ্লেষণ' },
  { slug: 'tools', nameEn: 'Research Tools', nameBn: 'গবেষণা সরঞ্জাম' },
  { slug: 'writing', nameEn: 'Academic Writing', nameBn: 'একাডেমিক লেখা' },
  { slug: 'ethics', nameEn: 'Research Ethics', nameBn: 'গবেষণা নৈতিকতা' },
]

export const LESSONS = [
  {
    slug: 'intro-to-research', category: 'fundamentals', durationMin: 12,
    titleEn: 'What research is (and is not)', titleBn: 'গবেষণা কী (এবং কী নয়)',
    bodyEn: `## Research is a systematic way of answering a question

Research means asking a clear question, collecting evidence in a planned way, analysing it honestly and sharing the result so others can check it. A literature summary, an opinion piece or a software project on its own is not research; it becomes research when it answers a question with evidence and a method other people can repeat.

## The research cycle

1. **Identify a problem** you have observed or read about.
2. **Read** what is already known about it.
3. **Ask a focused question** that has not been fully answered.
4. **Choose a method**: experiment, survey, interviews, simulation, secondary data.
5. **Collect and analyse** data.
6. **Report**: write, present, publish, and invite criticism.

## Types of research

- **Basic** research builds understanding (why does this happen?).
- **Applied** research solves a practical problem (how can we reduce it?).
- **Quantitative** methods measure and count; **qualitative** methods explore meaning and experience; **mixed methods** combine both.

## Try this

Write one sentence describing a problem you see in your field in Bangladesh. Then write the question you would need to answer to make progress on it.`,
    bodyBn: `## গবেষণা হলো প্রশ্নের উত্তর খোঁজার একটি পদ্ধতিগত উপায়

গবেষণা মানে একটি স্পষ্ট প্রশ্ন করা, পরিকল্পিতভাবে প্রমাণ সংগ্রহ করা, সৎভাবে বিশ্লেষণ করা এবং ফলাফল এমনভাবে প্রকাশ করা যাতে অন্যরা যাচাই করতে পারে। শুধু তথ্যের সারাংশ বা মতামত গবেষণা নয়; প্রমাণ ও পুনরাবৃত্তিযোগ্য পদ্ধতিতে প্রশ্নের উত্তর দিলে তবেই তা গবেষণা।

## গবেষণা চক্র

1. **সমস্যা চিহ্নিত করুন।**
2. **পড়ুন**: বিষয়টি নিয়ে আগে কী জানা আছে।
3. **নির্দিষ্ট প্রশ্ন তৈরি করুন** যার উত্তর এখনো পুরোপুরি জানা নেই।
4. **পদ্ধতি বেছে নিন**: পরীক্ষা, জরিপ, সাক্ষাৎকার, সিমুলেশন বা মাধ্যমিক তথ্য।
5. **তথ্য সংগ্রহ ও বিশ্লেষণ করুন।**
6. **প্রকাশ করুন** এবং সমালোচনা আমন্ত্রণ জানান।

## গবেষণার ধরন

- **মৌলিক** গবেষণা বোঝাপড়া বাড়ায়; **প্রায়োগিক** গবেষণা বাস্তব সমস্যার সমাধান খোঁজে।
- **পরিমাণগত** পদ্ধতি মাপে ও গণনা করে; **গুণগত** পদ্ধতি অভিজ্ঞতা ও অর্থ অনুসন্ধান করে; **মিশ্র** পদ্ধতি দুটোই ব্যবহার করে।

## অনুশীলন

আপনার ক্ষেত্রে বাংলাদেশে দেখা একটি সমস্যা এক বাক্যে লিখুন, তারপর সেই সমস্যায় অগ্রগতির জন্য যে প্রশ্নের উত্তর দরকার তা লিখুন।`,
  },
  {
    slug: 'research-questions', category: 'fundamentals', durationMin: 15,
    titleEn: 'Writing a good research question', titleBn: 'ভালো গবেষণা প্রশ্ন লেখা',
    bodyEn: `## From topic to question

A **topic** is broad ("air pollution in Dhaka"). A **question** is specific and answerable ("How did PM2.5 levels near schools in Dhaka change between dry and monsoon seasons in 2024?").

## The FINER test

- **Feasible**: you have the time, data, skills and money.
- **Interesting**: to you and to your field.
- **Novel**: it adds something not already known.
- **Ethical**: it can be done without harm and with consent.
- **Relevant**: the answer matters to science, policy or practice.

## Useful frameworks

- **PICO** (health): Population, Intervention, Comparison, Outcome.
- **Variables** (quantitative): what you change or compare (independent) and what you measure (dependent).

## Common mistakes

- Too broad: "What is the impact of AI on education?"
- Yes/no questions with obvious answers.
- Questions you cannot get data for.

## Try this

Rewrite a broad topic from your field into one question that passes all five FINER checks. Show it to a supervisor or classmate and ask which word is still vague.`,
    bodyBn: `## বিষয় থেকে প্রশ্নে

**বিষয়** বিস্তৃত হয় ("ঢাকার বায়ুদূষণ")। **প্রশ্ন** নির্দিষ্ট ও উত্তরযোগ্য ("২০২৪ সালে শুষ্ক ও বর্ষা মৌসুমে ঢাকার স্কুলগুলোর কাছে PM2.5 মাত্রা কীভাবে বদলেছে?")।

## FINER পরীক্ষা

- **Feasible (সম্ভবপর)**: সময়, তথ্য, দক্ষতা ও অর্থ আছে কি না।
- **Interesting (আকর্ষণীয়)**: আপনার ও আপনার ক্ষেত্রের জন্য।
- **Novel (নতুন)**: নতুন কিছু যোগ করে।
- **Ethical (নৈতিক)**: ক্ষতি ছাড়া ও সম্মতিসহ করা যায়।
- **Relevant (প্রাসঙ্গিক)**: উত্তরটি বিজ্ঞান, নীতি বা অনুশীলনে গুরুত্বপূর্ণ।

## সাধারণ ভুল

- খুব বিস্তৃত প্রশ্ন।
- স্পষ্ট উত্তরসহ হ্যাঁ/না প্রশ্ন।
- এমন প্রশ্ন যার জন্য তথ্য পাওয়া সম্ভব নয়।

## অনুশীলন

আপনার ক্ষেত্রের একটি বিস্তৃত বিষয়কে এমন একটি প্রশ্নে রূপ দিন যা FINER-এর পাঁচটি শর্তই পূরণ করে।`,
  },
  {
    slug: 'literature-search', category: 'literature', durationMin: 20,
    titleEn: 'Finding and organising literature', titleBn: 'সাহিত্য খোঁজা ও সাজানো',
    bodyEn: `## Where to search

- **Google Scholar**: broad and free; good starting point.
- **Subject databases**: PubMed (health), IEEE Xplore and ACM Digital Library (computing), Scopus and Web of Science (multidisciplinary; often via your university library).
- **BanglaJOL** (banglajol.info): journals published in Bangladesh.
- **Preprints**: arXiv, bioRxiv, medRxiv. Treat them as not yet peer reviewed.

## Build a search string

Combine key concepts with Boolean operators:

\`("rice" OR paddy) AND (disease OR blight) AND ("deep learning" OR CNN) AND Bangladesh\`

Use quotes for phrases, OR for synonyms, AND to narrow, and filters for year and document type.

## Read efficiently

Read the title and abstract first, then figures and conclusion. Read the full paper only when it is clearly relevant. For each paper note: question, method, data, main result, limitation.

## Keep a reference library

Use a reference manager such as **Zotero** (free) or Mendeley from day one. It stores PDFs, notes and citations and formats your reference list automatically.

## Try this

Run one search string in two databases. Save the ten most relevant papers to Zotero and write a two-line note for each.`,
    bodyBn: `## কোথায় খুঁজবেন

- **Google Scholar**: বিনামূল্যে, শুরু করার ভালো জায়গা।
- **বিষয়ভিত্তিক ডেটাবেস**: PubMed (স্বাস্থ্য), IEEE Xplore ও ACM (কম্পিউটিং), Scopus ও Web of Science (বিশ্ববিদ্যালয় লাইব্রেরির মাধ্যমে)।
- **BanglaJOL**: বাংলাদেশে প্রকাশিত জার্নাল।
- **প্রিপ্রিন্ট**: arXiv, bioRxiv; এগুলো এখনো পিয়ার রিভিউড নয়।

## সার্চ স্ট্রিং তৈরি

মূল ধারণাগুলো AND, OR দিয়ে যুক্ত করুন। বাক্যাংশের জন্য উদ্ধৃতিচিহ্ন, সমার্থক শব্দের জন্য OR এবং সংকুচিত করতে AND ব্যবহার করুন।

## দক্ষতার সাথে পড়া

প্রথমে শিরোনাম ও সারসংক্ষেপ, তারপর চিত্র ও উপসংহার পড়ুন। প্রতিটি পেপারের প্রশ্ন, পদ্ধতি, তথ্য, মূল ফলাফল ও সীমাবদ্ধতা নোট করুন।

## রেফারেন্স লাইব্রেরি

প্রথম দিন থেকেই **Zotero** (বিনামূল্যে) বা Mendeley ব্যবহার করুন।`,
  },
  {
    slug: 'writing-literature-review', category: 'literature', durationMin: 20,
    titleEn: 'Writing a literature review', titleBn: 'সাহিত্য পর্যালোচনা লেখা',
    bodyEn: `## A review is an argument, not a list

A weak review summarises papers one by one. A strong review groups studies by **theme or method**, compares them, and ends by showing the **gap** your study fills.

## A simple structure

1. **Context**: why the problem matters.
2. **Themes**: two to four groups of related work, each comparing findings and methods.
3. **Disagreements and limitations**: where studies conflict or share weaknesses (small samples, no local data, outdated methods).
4. **Gap and your contribution**: one paragraph that leads directly to your research question.

## Use a synthesis matrix

Make a table with one row per paper and columns for question, setting, method, data, findings and limitations. Patterns become visible quickly.

## Write in your own words

Paraphrase and cite. Quote only when the exact wording matters. Every claim that is not common knowledge needs a citation.

## Try this

Fill a synthesis matrix for eight papers, then write one paragraph that names the gap.`,
    bodyBn: `## পর্যালোচনা একটি যুক্তি, তালিকা নয়

দুর্বল পর্যালোচনা একে একে পেপারের সারাংশ দেয়। শক্তিশালী পর্যালোচনা গবেষণাগুলোকে **বিষয় বা পদ্ধতি** অনুযায়ী ভাগ করে, তুলনা করে এবং শেষে আপনার গবেষণা যে **ফাঁক** পূরণ করবে তা দেখায়।

## সহজ কাঠামো

1. **প্রেক্ষাপট**: সমস্যাটি কেন গুরুত্বপূর্ণ।
2. **বিষয়ভিত্তিক অংশ**: সম্পর্কিত কাজের দুই থেকে চারটি দল।
3. **মতপার্থক্য ও সীমাবদ্ধতা**।
4. **ফাঁক ও আপনার অবদান**: যা সরাসরি আপনার গবেষণা প্রশ্নে নিয়ে যায়।

## সিনথেসিস ম্যাট্রিক্স

প্রতিটি পেপারের জন্য এক সারি এবং প্রশ্ন, প্রেক্ষাপট, পদ্ধতি, তথ্য, ফলাফল ও সীমাবদ্ধতার জন্য কলাম রাখুন।

## নিজের ভাষায় লিখুন

প্যারাফ্রেজ করুন ও উদ্ধৃতি দিন। সাধারণ জ্ঞান নয় এমন প্রতিটি দাবির জন্য রেফারেন্স দরকার।`,
  },
  {
    slug: 'python-for-research', category: 'tools', durationMin: 25,
    titleEn: 'Python for research data', titleBn: 'গবেষণা তথ্যের জন্য পাইথন',
    bodyEn: `## Why Python

Python is free, widely used in science and has libraries for nearly every analysis. Your scripts also record exactly what you did, which makes your work reproducible.

## Core libraries

- **pandas**: load, clean and summarise tables.
- **NumPy**: fast numerical arrays.
- **matplotlib / seaborn**: charts.
- **SciPy / statsmodels**: statistical tests and regression.
- **scikit-learn**: machine learning.

## A first analysis

\`\`\`python
import pandas as pd
df = pd.read_csv("survey.csv")
print(df.shape)              # rows, columns
print(df.isna().sum())       # missing values per column
print(df.describe())         # summary statistics
print(df.groupby("district")["income"].median())
\`\`\`

## Good habits

- Never edit raw data by hand; keep it read-only and clean it in code.
- Use Jupyter or Google Colab for exploration, then move final steps into a script.
- Put your code under version control (Git) and note package versions.

## Try this

Load a CSV from the World Bank Bangladesh page in the Datasets section and plot one indicator over time.`,
    bodyBn: `## কেন পাইথন

পাইথন বিনামূল্যে, বিজ্ঞানে বহুল ব্যবহৃত এবং প্রায় সব বিশ্লেষণের লাইব্রেরি আছে। স্ক্রিপ্ট আপনার কাজের সঠিক রেকর্ড রাখে, ফলে গবেষণা পুনরুৎপাদনযোগ্য হয়।

## মূল লাইব্রেরি

- **pandas**: টেবিল লোড, পরিষ্কার ও সারসংক্ষেপ।
- **NumPy**: সংখ্যাগত অ্যারে।
- **matplotlib / seaborn**: চার্ট।
- **SciPy / statsmodels**: পরিসংখ্যানিক পরীক্ষা ও রিগ্রেশন।
- **scikit-learn**: মেশিন লার্নিং।

## ভালো অভ্যাস

- কাঁচা তথ্য হাতে সম্পাদনা করবেন না; কোডে পরিষ্কার করুন।
- অনুসন্ধানের জন্য Jupyter বা Google Colab, চূড়ান্ত ধাপ স্ক্রিপ্টে রাখুন।
- Git ব্যবহার করুন এবং প্যাকেজের সংস্করণ নোট রাখুন।`,
  },
  {
    slug: 'descriptive-statistics', category: 'data-analysis', durationMin: 20,
    titleEn: 'Describing your data before testing it', titleBn: 'পরীক্ষার আগে তথ্য বর্ণনা',
    bodyEn: `## Look before you test

Before any hypothesis test, describe the data. Most analysis errors come from not noticing missing values, outliers or wrong data types.

## What to report

- **Sample size** (n) and how many values are missing.
- **Centre**: mean for roughly symmetric data, median for skewed data (income, waiting times).
- **Spread**: standard deviation with the mean; interquartile range with the median.
- **Categories**: counts and percentages.

## Plot first

- Histogram or box plot for one numeric variable.
- Scatter plot for two numeric variables.
- Bar chart for categories (start the axis at zero).

## Choosing a test (rough guide)

| Question | Common test |
|---|---|
| Compare two group means | t-test (or Mann-Whitney if skewed) |
| Compare three or more groups | ANOVA (or Kruskal-Wallis) |
| Association between two categories | Chi-square test |
| Relationship between two numeric variables | Correlation / regression |

Report effect sizes and confidence intervals, not only p-values.`,
    bodyBn: `## পরীক্ষার আগে দেখুন

যেকোনো হাইপোথিসিস পরীক্ষার আগে তথ্য বর্ণনা করুন। অনুপস্থিত মান, আউটলায়ার বা ভুল ডেটা টাইপ চোখে না পড়াই বেশিরভাগ ভুলের কারণ।

## কী রিপোর্ট করবেন

- **নমুনার আকার** (n) এবং কতগুলো মান অনুপস্থিত।
- **কেন্দ্র**: প্রায় প্রতিসম তথ্যের জন্য গড়, বাঁকা তথ্যের জন্য মধ্যমা।
- **বিস্তার**: গড়ের সাথে আদর্শ বিচ্যুতি, মধ্যমার সাথে আন্তঃচতুর্থক পরিসর।
- **শ্রেণি**: সংখ্যা ও শতাংশ।

## আগে চার্ট আঁকুন

হিস্টোগ্রাম, বক্স প্লট, স্ক্যাটার প্লট বা বার চার্ট ব্যবহার করুন।

শুধু p-value নয়, ইফেক্ট সাইজ ও কনফিডেন্স ইন্টারভাল রিপোর্ট করুন।`,
  },
  {
    slug: 'academic-writing', category: 'writing', durationMin: 20,
    titleEn: 'Structuring a research paper (IMRaD)', titleBn: 'গবেষণাপত্রের কাঠামো (IMRaD)',
    bodyEn: `## IMRaD

Most empirical papers follow **Introduction, Methods, Results and Discussion**.

- **Introduction**: the problem, what is known, the gap, and your question or aim. End with what the paper does.
- **Methods**: enough detail for someone else to repeat the study: design, setting, participants or data, procedures, analysis, ethics approval.
- **Results**: what you found, in a logical order, with tables and figures. No interpretation yet.
- **Discussion**: what the results mean, how they compare with earlier work, limitations, and implications.

## The abstract

Write it last. In 150–250 words state the aim, method, key numbers and main conclusion.

## Clear sentences

- One idea per sentence; one topic per paragraph.
- Prefer active voice when it is clearer ("We surveyed 400 farmers").
- Define abbreviations at first use.

## Choosing a journal

Match the journal's scope to your topic, check that it is indexed where it claims to be (verify on the indexer's own site), read recent articles, and avoid journals that promise very fast acceptance for a fee.`,
    bodyBn: `## IMRaD

বেশিরভাগ গবেষণাপত্র **ভূমিকা, পদ্ধতি, ফলাফল ও আলোচনা** কাঠামো অনুসরণ করে।

- **ভূমিকা**: সমস্যা, যা জানা আছে, ফাঁক এবং আপনার প্রশ্ন।
- **পদ্ধতি**: অন্য কেউ যেন গবেষণাটি পুনরাবৃত্তি করতে পারে এমন বিবরণ, নৈতিক অনুমোদনসহ।
- **ফলাফল**: যা পেয়েছেন, টেবিল ও চিত্রসহ; এখনো ব্যাখ্যা নয়।
- **আলোচনা**: ফলাফলের অর্থ, আগের কাজের সাথে তুলনা, সীমাবদ্ধতা ও প্রভাব।

## সারসংক্ষেপ

সবশেষে লিখুন: লক্ষ্য, পদ্ধতি, মূল সংখ্যা ও উপসংহার ১৫০–২৫০ শব্দে।

## জার্নাল বাছাই

জার্নালের পরিধি মিলিয়ে নিন, ইনডেক্সিং দাবি সংশ্লিষ্ট ইনডেক্সারের নিজস্ব সাইটে যাচাই করুন এবং টাকার বিনিময়ে দ্রুত প্রকাশের প্রতিশ্রুতি দেয় এমন জার্নাল এড়িয়ে চলুন।`,
  },
  {
    slug: 'research-ethics', category: 'ethics', durationMin: 15,
    titleEn: 'Research ethics and integrity', titleBn: 'গবেষণা নৈতিকতা ও সততা',
    bodyEn: `## Core principles

- **Respect for persons**: informed, voluntary consent; the right to withdraw.
- **Beneficence**: minimise risk and maximise benefit.
- **Justice**: fair selection of participants and fair sharing of benefits.

## Ethics approval

Research with human participants, identifiable data or animals usually needs approval from an institutional ethics committee before data collection. Health research in Bangladesh is commonly reviewed by institutional review boards and the Bangladesh Medical Research Council's National Research Ethics Committee.

## Research misconduct

- **Fabrication**: making up data.
- **Falsification**: manipulating data, images or methods.
- **Plagiarism**: using others' words or ideas without credit, including self-plagiarism.

## Authorship

Authors should have contributed substantially to the work, drafted or revised it, approved the final version and accepted responsibility for it. Gift and ghost authorship are not acceptable.

## Data and privacy

Collect only what you need, store identifiable data securely, anonymise before sharing, and follow your consent terms.`,
    bodyBn: `## মূল নীতি

- **ব্যক্তির প্রতি সম্মান**: অবহিত ও স্বেচ্ছায় সম্মতি; প্রত্যাহারের অধিকার।
- **উপকারিতা**: ঝুঁকি কমানো ও উপকার বাড়ানো।
- **ন্যায়বিচার**: অংশগ্রহণকারী নির্বাচন ও সুফল বণ্টনে ন্যায্যতা।

## নৈতিক অনুমোদন

মানুষ, শনাক্তযোগ্য তথ্য বা প্রাণী নিয়ে গবেষণায় সাধারণত তথ্য সংগ্রহের আগে প্রাতিষ্ঠানিক নৈতিকতা কমিটির অনুমোদন প্রয়োজন।

## গবেষণা অসদাচরণ

- **জালিয়াতি (Fabrication)**: তথ্য বানানো।
- **বিকৃতি (Falsification)**: তথ্য, ছবি বা পদ্ধতি পরিবর্তন।
- **চৌর্যবৃত্তি (Plagiarism)**: কৃতিত্ব না দিয়ে অন্যের লেখা বা ধারণা ব্যবহার।

## লেখকত্ব

যারা উল্লেখযোগ্য অবদান রেখেছেন, লেখায় অংশ নিয়েছেন এবং চূড়ান্ত সংস্করণ অনুমোদন করেছেন কেবল তারাই লেখক হবেন।`,
  },
]

export const LEARNING_PATHS = [
  { slug: 'first-research-project', titleEn: 'Your first research project', titleBn: 'আপনার প্রথম গবেষণা প্রকল্প', descriptionEn: 'From a question to a written report: fundamentals, literature, analysis and writing.', descriptionBn: 'প্রশ্ন থেকে লিখিত প্রতিবেদন: মৌলিক বিষয়, সাহিত্য, বিশ্লেষণ ও লেখা।' },
  { slug: 'publishing-responsibly', titleEn: 'Publishing responsibly', titleBn: 'দায়িত্বশীলভাবে প্রকাশ', descriptionEn: 'Structure a paper, choose a journal and follow research ethics.', descriptionBn: 'গবেষণাপত্রের কাঠামো, জার্নাল বাছাই ও গবেষণা নৈতিকতা।' },
]

export const DISCUSSION_CATEGORIES = [
  { slug: 'methodology', nameEn: 'Research methodology', nameBn: 'গবেষণা পদ্ধতি' },
  { slug: 'data-science', nameEn: 'Data analysis and statistics', nameBn: 'তথ্য বিশ্লেষণ ও পরিসংখ্যান' },
  { slug: 'writing-publishing', nameEn: 'Writing and publishing', nameBn: 'লেখা ও প্রকাশনা' },
  { slug: 'higher-studies', nameEn: 'Higher studies and scholarships', nameBn: 'উচ্চশিক্ষা ও বৃত্তি' },
  { slug: 'tools', nameEn: 'Tools and software', nameBn: 'সরঞ্জাম ও সফটওয়্যার' },
]
