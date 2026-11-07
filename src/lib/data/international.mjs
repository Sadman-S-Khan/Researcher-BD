// International journals and conferences relevant to researchers in Bangladesh.
// Journals: links go to each journal's official homepage; no indexing claims are stored.
// Conferences: dates come from official sites or a deadline tracker (opencurious.com, reviewed 2026-10-30)
// and are marked "listed" unless the official page was read. Always confirm on the official site.

const j = (title, publisher, subjectAreas, website, openAccess = null) => ({ title, publisher, subjectAreas, website, openAccess })

export const INTERNATIONAL_JOURNALS = [
  j('Nature', 'Springer Nature', 'Multidisciplinary science', 'https://www.nature.com/nature/'),
  j('Science', 'American Association for the Advancement of Science (AAAS)', 'Multidisciplinary science', 'https://www.science.org/journal/science'),
  j('Proceedings of the National Academy of Sciences (PNAS)', 'National Academy of Sciences', 'Multidisciplinary science', 'https://www.pnas.org/'),
  j('Nature Communications', 'Springer Nature', 'Multidisciplinary science', 'https://www.nature.com/ncomms/', true),
  j('Scientific Reports', 'Springer Nature', 'Multidisciplinary science', 'https://www.nature.com/srep/', true),
  j('PLOS ONE', 'Public Library of Science', 'Multidisciplinary science', 'https://journals.plos.org/plosone/', true),
  j('Heliyon', 'Cell Press', 'Multidisciplinary science', 'https://www.cell.com/heliyon/home', true),
  j('eLife', 'eLife Sciences Publications', 'Life sciences and biomedicine', 'https://elifesciences.org/', true),
  j('The Lancet', 'Elsevier', 'Medicine', 'https://www.thelancet.com/journals/lancet/home'),
  j('The Lancet Global Health', 'Elsevier', 'Global health', 'https://www.thelancet.com/journals/langlo/home', true),
  j('The BMJ', 'BMJ Publishing Group', 'Medicine', 'https://www.bmj.com/'),
  j('BMJ Open', 'BMJ Publishing Group', 'Medicine and public health', 'https://bmjopen.bmj.com/', true),
  j('BMC Public Health', 'BioMed Central (Springer Nature)', 'Public health', 'https://bmcpublichealth.biomedcentral.com/', true),
  j('PLOS Medicine', 'Public Library of Science', 'Medicine', 'https://journals.plos.org/plosmedicine/', true),
  j('PLOS Neglected Tropical Diseases', 'Public Library of Science', 'Infectious and tropical diseases', 'https://journals.plos.org/plosntds/', true),
  j('IEEE Access', 'IEEE', 'Engineering, computing', 'https://ieeeaccess.ieee.org/', true),
  j('IEEE Transactions on Pattern Analysis and Machine Intelligence', 'IEEE Computer Society', 'Computer vision, machine learning', 'https://www.computer.org/csdl/journal/tp'),
  j('IEEE Transactions on Medical Imaging', 'IEEE', 'Medical imaging', 'https://www.embs.org/tmi/'),
  j('IEEE Transactions on Neural Networks and Learning Systems', 'IEEE Computational Intelligence Society', 'Machine learning, neural networks', 'https://cis.ieee.org/publications/t-neural-networks-and-learning-systems'),
  j('Journal of Machine Learning Research', 'JMLR, Inc.', 'Machine learning', 'https://www.jmlr.org/', true),
  j('Transactions of the Association for Computational Linguistics', 'Association for Computational Linguistics', 'Natural language processing', 'https://transacl.org/', true),
  j('Medical Image Analysis', 'Elsevier', 'Medical imaging, computer vision', 'https://www.sciencedirect.com/journal/medical-image-analysis'),
  j('Pattern Recognition', 'Elsevier', 'Pattern recognition, computer vision', 'https://www.sciencedirect.com/journal/pattern-recognition'),
  j('Expert Systems with Applications', 'Elsevier', 'Artificial intelligence applications', 'https://www.sciencedirect.com/journal/expert-systems-with-applications'),
  j('Knowledge-Based Systems', 'Elsevier', 'Artificial intelligence', 'https://www.sciencedirect.com/journal/knowledge-based-systems'),
  j('Neural Networks', 'Elsevier', 'Neural networks, machine learning', 'https://www.sciencedirect.com/journal/neural-networks'),
  j('Computers in Biology and Medicine', 'Elsevier', 'Biomedical computing', 'https://www.sciencedirect.com/journal/computers-in-biology-and-medicine'),
  j('Journal of Big Data', 'SpringerOpen', 'Data science', 'https://journalofbigdata.springeropen.com/', true),
  j('Remote Sensing', 'MDPI', 'Remote sensing, earth observation', 'https://www.mdpi.com/journal/remotesensing', true),
  j('Sustainability', 'MDPI', 'Sustainability science', 'https://www.mdpi.com/journal/sustainability', true),
  j('Water Research', 'Elsevier', 'Water science and engineering', 'https://www.sciencedirect.com/journal/water-research'),
  j('Environmental Research Letters', 'IOP Publishing', 'Environmental science, climate', 'https://iopscience.iop.org/journal/1748-9326', true),
  j('Applied Energy', 'Elsevier', 'Energy engineering', 'https://www.sciencedirect.com/journal/applied-energy'),
  j('Renewable Energy', 'Elsevier', 'Renewable energy', 'https://www.sciencedirect.com/journal/renewable-energy'),
  j('Energy Policy', 'Elsevier', 'Energy economics and policy', 'https://www.sciencedirect.com/journal/energy-policy'),
  j('Field Crops Research', 'Elsevier', 'Agronomy, crop science', 'https://www.sciencedirect.com/journal/field-crops-research'),
  j('World Development', 'Elsevier', 'Development studies', 'https://www.sciencedirect.com/journal/world-development'),
  j('Journal of Development Economics', 'Elsevier', 'Development economics', 'https://www.sciencedirect.com/journal/journal-of-development-economics'),
  j('Global Food Security', 'Elsevier', 'Food security, agriculture policy', 'https://www.sciencedirect.com/journal/global-food-security'),
  j('Journal of Hydrology', 'Elsevier', 'Hydrology, water resources', 'https://www.sciencedirect.com/journal/journal-of-hydrology'),
].map(x => ({ ...x, verification: 'listed', indexingClaims: null }))

const c = (title, organizer, location, eventDate, submissionDeadline, website, researchTracks, verification = 'listed') =>
  ({ title, organizer, location, eventDate: eventDate ? new Date(eventDate) : null, submissionDeadline: submissionDeadline ? new Date(submissionDeadline) : null, website, researchTracks, verification, proceedings: null, publisher: null })

// Bangladesh conferences after 7 Nov 2026 (aggregated from conf.info.bd; confirm on each official site)
export const BD_CONFERENCES = [
  c('International Conference on Innovations in Science, Engineering and Technology (ICISET 2026)', 'International Islamic University Chittagong (IIUC)', 'IIUC, Chattogram, Bangladesh', '2026-11-07', '2026-06-06', 'https://iciset.iiuc.ac.bd/', 'Science, engineering and technology'),
  c('International Conference on Recent Progresses in Science, Engineering and Technology (ICRPSET 2026)', 'University of Rajshahi', 'University of Rajshahi, Rajshahi, Bangladesh', '2026-12-05', '2026-07-20', 'https://csa.ru.ac.bd/icrpset/2026/', 'Science, engineering and technology'),
  c('International Conference on Geotechnical and Geological Research and Applications (ICGrA 2026)', 'Organised with BUET (see website)', 'SUST, Sylhet, Bangladesh', '2026-12-05', '2026-04-30', 'https://icgra.buet.ac.bd/2026', 'Geotechnical engineering, geology'),
  c('International Conference on Advances in Civil Engineering (ICACE 2026)', 'CUET', 'CUET, Chattogram, Bangladesh', '2026-12-10', '2026-05-09', 'https://icace.cuet.ac.bd/', 'Civil engineering'),
  c('International Conference on Mechanical, Industrial and Energy Engineering (ICMIEE 2026)', 'KUET', 'KUET, Khulna, Bangladesh', '2026-12-17', '2026-08-02', 'https://icmiee.kuet.ac.bd/', 'Mechanical, industrial and energy engineering'),
  c('International Conference on Chemical Engineering (ICChE 2026)', 'Department of Chemical Engineering, BUET', 'BUET, Dhaka, Bangladesh', '2026-12-17', '2026-05-15', 'https://icche-buet.com/', 'Chemical engineering'),
  c('International Conference on Civil Engineering (ICCE 2026)', 'Department of Civil Engineering, BUET', 'BUET, Dhaka, Bangladesh', '2026-12-17', '2026-08-15', 'https://conf.ce.buet.ac.bd/', 'Civil engineering'),
  c('International Conference on Thermal Engineering (ICTE 2026)', 'Bangladesh Society of Mechanical Engineers / BUET', 'BUET, Dhaka, Bangladesh', '2026-12-19', '2026-10-07', 'https://www.bsmeicte.org/', 'Thermal and fluid engineering, energy'),
  c('IEOM Bangladesh Conference 2026', 'IEOM Society International', 'BUFT, Dhaka, Bangladesh', '2026-12-26', '2026-10-01', 'https://ieomsociety.org/bangladesh2026/', 'Industrial engineering and operations management'),
  c('TEHI 2026', 'University of Creative Technology Chittagong', 'UCTC, Chattogram, Bangladesh', '2026-12-26', '2026-09-15', 'https://tehi.uctc.ac.bd/', 'See website'),
  c('IEEE International Conference on Sustainable Technologies for Industry 5.0 (STI 2026)', 'Green University of Bangladesh', 'Green University of Bangladesh, Dhaka', null, null, 'https://sti.green.edu.bd/', 'Sustainable technologies, Industry 5.0'),
  c('International Conference on Networking, Systems and Security (NSysS 2026)', 'Department of CSE, BUET', 'BUET, Dhaka, Bangladesh', null, null, 'https://cse.buet.ac.bd/nsyss2026/', 'Networking, distributed systems, security'),
  c('International Conference on Developments in Renewable Energy Technology (ICDRET 2027)', 'United International University (UIU)', 'UIU, Dhaka, Bangladesh', '2027-03-27', '2026-11-15', 'https://icdret.uiu.ac.bd/', 'Renewable energy technology'),
]

// International conferences (deadline tracker opencurious.com, reviewed 2026-10-30; official sites linked)
export const INTL_CONFERENCES = [
  c('IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2027)', 'IEEE / CVF', 'Seattle, Washington, USA', '2027-06-20', '2026-11-16', 'https://cvpr.thecvf.com/', 'Computer vision, pattern recognition'),
  c('International Conference on Learning Representations (ICLR 2027)', 'ICLR', 'California, USA', '2027-04-26', '2026-09-25', 'https://iclr.cc/', 'Deep learning, representation learning'),
  c('International Conference on Artificial Intelligence and Statistics (AISTATS 2027)', 'AISTATS', 'Montréal, Canada', '2027-05-03', '2026-10-06', 'https://aistats.org/', 'Machine learning, statistics'),
  c('AAAI Conference on Artificial Intelligence (AAAI-27)', 'Association for the Advancement of Artificial Intelligence', 'Montréal, Canada', null, '2026-07-28', 'https://aaai.org/conference/aaai/aaai-27/', 'Artificial intelligence'),
  c('Annual Meeting of the Association for Computational Linguistics (ACL 2027)', 'Association for Computational Linguistics', 'Kyoto, Japan', null, '2027-01-04', 'https://2027.aclweb.org/', 'Natural language processing'),
  c('International Joint Conference on Artificial Intelligence (IJCAI 2027)', 'IJCAI', 'Kyoto, Japan', null, '2027-01-11', 'https://2027.ijcai.org/', 'Artificial intelligence'),
  c('International Conference on Machine Learning (ICML 2027)', 'International Machine Learning Society', 'South America (city to be announced)', null, '2027-01-22', 'https://icml.cc/', 'Machine learning'),
  c('Conference on Neural Information Processing Systems (NeurIPS 2027)', 'NeurIPS Foundation', 'Europe (city to be announced)', null, '2027-05-21', 'https://neurips.cc/', 'Machine learning, neural computation'),
  c('IEEE/CVF International Conference on Computer Vision (ICCV 2027)', 'IEEE / CVF', 'Hong Kong', null, '2027-03-08', 'https://iccv.thecvf.com/', 'Computer vision'),
  c('IEEE/CVF Winter Conference on Applications of Computer Vision (WACV 2027)', 'IEEE / CVF', 'Orlando, Florida, USA', null, '2026-08-28', 'https://wacv.thecvf.com/', 'Applied computer vision'),
  c('ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2027)', 'ACM SIGKDD', 'San Jose, California, USA', null, null, 'https://kdd2027.kdd.org/', 'Data mining, data science'),
  c('ACM SIGIR Conference on Research and Development in Information Retrieval (SIGIR 2027)', 'ACM SIGIR', 'San Jose, California, USA', null, '2027-01-21', 'https://sigir2027.org/', 'Information retrieval, search, recommender systems'),
  c('IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP 2027)', 'IEEE Signal Processing Society', 'Toronto, Canada', null, '2026-09-23', 'https://2027.ieeeicassp.org/', 'Signal processing, speech, audio'),
  c('Interspeech 2027', 'International Speech Communication Association (ISCA)', 'São Paulo, Brazil', null, '2027-02-09', 'https://interspeech2027.org/', 'Speech science and technology'),
  c('International Conference on Medical Image Computing and Computer Assisted Intervention (MICCAI 2027)', 'MICCAI Society', 'See website', null, null, 'https://conferences.miccai.org/2027/en/', 'Medical image computing, computer-assisted intervention'),
  c('IEEE International Conference on Multimedia & Expo (ICME 2027)', 'IEEE', 'Xiamen, China', null, '2026-12-30', 'https://2027.ieeeicme.org/', 'Multimedia, signal processing'),
  c('International Joint Conference on Neural Networks (IJCNN 2027)', 'IEEE Computational Intelligence Society / INNS', 'Cape Town, South Africa', null, '2027-01-31', 'https://ijcnn.org/2027', 'Neural networks, computational intelligence'),
  c('European Conference on Artificial Intelligence (ECAI 2027)', 'EurAI', 'Athens, Greece', null, '2027-04-14', 'https://ecai2027.org/', 'Artificial intelligence'),
  c('Robotics: Science and Systems (RSS 2027)', 'RSS Foundation', 'Athens, Greece', null, '2026-12-04', 'https://roboticsconference.org/', 'Robotics'),
  c('Annual Conference on Learning Theory (COLT 2027)', 'Association for Computational Learning', 'Tokyo, Japan', null, '2027-01-29', 'https://learningtheory.org/colt2027/', 'Learning theory'),
  c('ACM Conference on Fairness, Accountability, and Transparency (FAccT 2027)', 'ACM', 'Porto, Portugal', null, '2026-11-03', 'https://facctconference.org/', 'Responsible AI, fairness, accountability'),
]
