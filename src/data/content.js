// =============================================================
//  İÇERİK / CONTENT — Gülheda Kızılhan
//  Site iki dilli: Türkçe (varsayılan) + İngilizce.
//  Metinleri değiştirmek için yalnızca bu dosyayı düzenle.
// =============================================================

export const LOCALES = ["tr", "en"];
export const DEFAULT_LOCALE = "tr";

/* Dile bağlı OLMAYAN bilgiler — her iki dilde aynı */
export const shared = {
  brand: "GÜLHEDA",
  fullName: "Gülheda Kızılhan",
  email: "kizilhangulheda@gmail.com",
  // Telefonunu siteye AÇIK koymadım: herkese görünür bir numara spam
  // ve istenmeyen arama çeker. İstersen buraya yaz, otomatik görünür.
  phone: "",
  /* the marquee strip: her actual stack, language-independent */
  marquee: [
    "pymavlink", "YOLOv8", "ArduPilot", "Gazebo Harmonic", "ROS 2",
    "OpenCV", "FastAPI", "React", "CNN", "MAVSDK", "Raspberry Pi",
    "WebSocket", "NumPy", "Pandas",
  ],
  links: {
    github: "https://github.com/gulheda",
    linkedin: "https://linkedin.com/in/gulheda-kizilhan",
    website: "https://gulheda.com",
  },
};

const tr = {
  identity: {
    title: "Bilgisayar Mühendisi",
    subtitle: "Otonom Sistemler & Yapay Zekâ",
    welcome: "portfolyoma hoş geldin",
    /* the hero's large type: the statement, not the name. `em` marks
       the phrases that get the accent weight. */
    statement: [
      { t: "Otonom sistemler" , em: true },
      { t: " ve " },
      { t: "yapay zekâ", em: true },
      { t: " üzerine çalışıyorum." },
    ],
    tagline: "Denemeyi, öğrenmeyi ve farklı olanı seviyorum.",
    meta: {
      status: "Yeni fırsatlara açık",
      focus: "Veri · Otonom Sistemler · Yapay Zekâ",
      location: "",
    },
  },

  nav: [
    { id: "hero", label: "Ana Sayfa" },
    { id: "about", label: "Hakkımda" },
    { id: "skills", label: "Yetenekler" },
    { id: "projects", label: "Projeler" },
    { id: "experience", label: "Deneyim" },
    { id: "collaborate", label: "Birlikte" },
    { id: "contact", label: "İletişim" },
  ],

  about: {
    lead: "kısa bir tanışma",
    heading: "Hakkımda",
    intro:
      "Otonom sistemler ve yapay zekâ üzerine çalışıyorum — ve yeni olan her şeye açığım.",
    paragraphs: [
      "Bilgisayar Mühendisliği son sınıf öğrencisiyim. Teknofest'te İHA'mızın otonom görev yazılımını geliştiriyorum, TÜBİTAK 2209-A destekli yapay zekâ projesini yürütüyorum ve Balıkesir Teknokent'te part-time çalışıyorum. 42 saatlik bir hackathon'da GPT-4o destekli afet koordinasyon platformunu ekibimle sıfırdan teslim ettik.",
      "Simülasyondan gerçek donanıma, veriden arayüze — işin her katmanında çalışmayı seviyorum. Yeni bir problem, yeni bir araç, yeni bir ekip: hepsine açığım.",
    ],
    quote: "Kur, boz, yeniden kur.",
    facts: [
      { value: "2027", label: "mezuniyet · Bilgisayar Mühendisliği" },
      { value: "2+", label: "yıl otonom sistemler" },
      { value: "∞", label: "öğrenilecek şey" },
    ],
  },

  skills: {
    lead: "çalıştığım araçlar",
    heading: "Teknik Yetenekler",
    groups: [
      {
        group: "Programlama",
        items: ["Python (OOP, async)", "pymavlink", "OpenCV", "FastAPI", "SQL (temel)"],
      },
      {
        group: "Otonom Sistemler",
        items: [
          "ArduPilot / ArduCopter",
          "pymavlink / MAVSDK",
          "MAVProxy",
          "Mission Planner",
          "ROS 2 (orta)",
          "Gazebo Harmonic",
        ],
      },
      {
        group: "Görüntü İşleme & Derin Öğrenme",
        items: ["YOLOv8", "OpenCV", "CNN (Keras/PyTorch)", "NumPy", "Pandas", "Matplotlib"],
      },
      {
        group: "Gömülü / Donanım",
        items: ["Raspberry Pi 5", "Orange Cube (CubePilot)", "Picamera2", "TF03-180 LiDAR"],
      },
      {
        group: "Web & Bulut",
        items: ["FastAPI", "React", "WebSocket", "REST API", "Render.com"],
      },
      {
        group: "Araçlar",
        items: ["Git / GitHub", "QGroundControl", "Cisco Packet Tracer"],
      },
    ],
  },

  projects: {
    lead: "seçilmiş işler",
    heading: "Projeler",
    items: [
      {
        title: "Otonom İHA Görev Sistemi",
        context: "Teknofest İHA Yarışması · Eyl 2024 – Devam ediyor",
        role: "Otonom simülasyon geliştirici · 2 kişilik yazılım grubu",
        blurb:
          "Otonom görev döngüsünü pymavlink ile sıfırdan yazdım; sensör füzyonu ve grid taramayla kapsanan alanı yaklaşık iki katına çıkardım.",
        tech: ["Python", "pymavlink", "MAVSDK", "YOLOv8", "Gazebo Harmonic", "ArduPilot SITL", "ROS 2"],
        link: "",
      },
      {
        title: "Yapay Zekâ Destekli Astronomi Asistanı",
        context: "TÜBİTAK 2209-A (Desteklendi) · 2025 – Devam ediyor",
        role: "Proje yürütücüsü",
        blurb:
          "Astronomik görüntülerde Real/Bogus sınıflandırması yapan bir CNN geliştiriyorum — 10.000+ görüntülük veri hattıyla 0.88 F1-score.",
        tech: ["Python", "CNN (Keras)", "NumPy", "Pandas", "FITS", "Matplotlib"],
        link: "",
      },
      {
        title: "DisasterRoute — Afet Koordinasyon Platformu",
        context: "EBST Hackathon 2026 · Oca 2026",
        role: "Full-stack + yapay zekâ entegrasyonu · Takım projesi",
        blurb:
          "Deprem ihbarlarını GPT-4o ile önceliklendirip ekipleri yönlendiren platformu 42 saatte teslim ettik — SMS ihbarı ve gerçek zamanlı panel dahil.",
        tech: ["Python", "FastAPI", "React", "GPT-4o API", "Twilio SMS", "WebSocket", "Leaflet.js"],
        link: "",
      },
    ],
  },

  experience: {
    lead: "yollarım",
    heading: "Deneyim",
    roles: [
      {
        role: "Part-time Yazılım Geliştirici",
        org: "Balıkesir Teknokent",
        period: "Temmuz 2026 – Devam ediyor",
        note: "Zorunlu yaz stajımı da burada tamamladım; staj sonrası part-time olarak devam ediyorum.",
      },
      {
        role: "Teknik Mentör",
        org: "Deneyap Türkiye",
        period: "2026 – Devam ediyor",
        note: "Mühendislik ve teknoloji projelerinde öğrencilere sistem tasarımı, problem çözme ve teknik uygulama süreçlerinde rehberlik ediyorum; takım dinamiklerini yönetiyorum.",
      },
      {
        role: "Yönetim Kurulu Üyesi & Sayman",
        org: "MİSYA Kültür ve Teknoloji Kulübü — Balıkesir Üniversitesi",
        period: "2025 – Devam ediyor",
        note: "Kulübün mali süreçlerini ve bütçe yönetimini yürütüyorum; teknoloji odaklı etkinliklerin organizasyonunda aktif rol alıyorum.",
      },
    ],
    educationLabel: "Eğitim",
    education: [
      {
        role: "Bilgisayar Mühendisliği",
        org: "Balıkesir Üniversitesi",
        period: "Ekim 2023 – Haziran 2027 (son sınıf)",
        note: "Otonom sistemler, görüntü işleme ve gömülü sistemler üzerine yoğunlaşıyorum.",
      },
    ],
    certificatesLabel: "Sertifikalar & Eğitimler",
    certificates: [
      {
        name: "Yapay Zeka ve İHA Simülasyon Eğitimi",
        org: "SoftVation — bitirme sertifikası",
        year: "Mart 2026",
        href: "/certs/softvation-yapay-zeka-iha-simulasyon.pdf",
        proof: "belgeyi gör",
      },
      {
        name: "CCNA: Introduction to Networks",
        org: "Cisco Networking Academy — Credly rozetiyle doğrulanmış",
        year: "2026",
        href: "https://www.credly.com/badges/1ccd9943-c636-4821-9523-2ba527fb06f5/public_url",
        proof: "rozeti doğrula",
      },
      {
        name: "Derin Öğrenmeye Giriş Bootcamp",
        org: "Akbank — katılım sertifikası",
        year: "2025",
        href: "/certs/akbank-derin-ogrenme-bootcamp.pdf",
        proof: "belgeyi gör",
      },
      {
        name: "Dijital Usta — Çevrimiçi Eğitim Başlangıç Modülleri",
        org: "Dijital Usta Projesi — katılım belgesi",
        year: "",
        href: "/certs/dijital-usta-katilim-belgesi.pdf",
        proof: "belgeyi gör",
      },
      {
        name: "R/C Model Uçak Manuel Uçuş Eğitimi",
        org: "TÜBİTAK İHA Yarışmaları — takım pilotları eğitimi",
        year: "",
      },
      {
        name: "İngilizce Sertifikası — B2",
        org: "American Life Language Institute",
        year: "2024",
      },
    ],
  },

  contact: {
    lead: "bana ulaş",
    heading: "İletişim",
    invitation: "Birlikte güzel bir şey kuralım.",
    socials: [
      { label: "GitHub", href: shared.links.github },
      { label: "LinkedIn", href: shared.links.linkedin },
      { label: "Web Sitesi", href: shared.links.website },
      { label: "E-posta", href: `mailto:${shared.email}` },
    ],
  },

  ui: {
    orbit: "YENİ FIRSATLARA AÇIK • BİRLİKTE ÇALIŞALIM • ",
    orbitLabel: "Birlikte bölümüne git",
    panelsLabel: "nereye bakmak istersin?",
    panels: [
      { id: "projects", k: "01", title: "Projeler", note: "Teknofest İHA · TÜBİTAK 2209-A · DisasterRoute" },
      { id: "skills", k: "02", title: "Yetenekler", note: "Otonom sistemler, görüntü işleme, backend" },
      { id: "experience", k: "03", title: "Deneyim", note: "Teknokent · Deneyap · MİSYA" },
      { id: "collaborate", k: "04", title: "Birlikte", note: "Birkaç adımda bana ulaş" },
    ],
    railLeft: "Otonom Sistemler · Yapay Zekâ",
    railRight: "Portfolyo · 2026",
    heroCta: "Birlikte ne geliştirebiliriz?",
    heroCtaNote: "Birkaç adımda anlatalım",
    scroll: "kaydır",
    view: "Görüntüle",
    gateHint: "kaydırmaya devam et — ışık açılıyor",
    footer: "el emeğiyle, yaprak yaprak.",
    langLabel: "Dil",
  },
};

const en = {
  identity: {
    title: "Computer Engineer",
    subtitle: "Autonomous Systems & Artificial Intelligence",
    welcome: "welcome to my portfolio",
    statement: [
      { t: "I work on " },
      { t: "autonomous systems", em: true },
      { t: " and " },
      { t: "artificial intelligence", em: true },
      { t: "." },
    ],
    tagline: "I love trying things, learning, and being a little different.",
    meta: {
      status: "Open to opportunities",
      focus: "Data · Autonomous Systems · Artificial Intelligence",
      location: "",
    },
  },

  nav: [
    { id: "hero", label: "Home" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "collaborate", label: "Collaborate" },
    { id: "contact", label: "Contact" },
  ],

  about: {
    lead: "a short introduction",
    heading: "About",
    intro:
      "I work on autonomous systems and artificial intelligence — and I'm open to everything new.",
    paragraphs: [
      "I'm a final-year Computer Engineering student. I build the autonomous mission software for our Teknofest UAV, run a TÜBİTAK 2209-A funded AI project, and work part-time at Balıkesir Teknokent. In a 42-hour hackathon my team and I shipped a GPT-4o powered disaster-coordination platform from scratch.",
      "From simulation to real hardware, from data to interface — I like working at every layer. New problem, new tool, new team: I'm open to all of it.",
    ],
    quote: "Build, break, build again.",
    facts: [
      { value: "2027", label: "graduation · Computer Engineering" },
      { value: "2+", label: "years in autonomous systems" },
      { value: "∞", label: "things left to learn" },
    ],
  },

  skills: {
    lead: "what I work with",
    heading: "Technical Skills",
    groups: [
      {
        group: "Programming",
        items: ["Python (OOP, async)", "pymavlink", "OpenCV", "FastAPI", "SQL (basic)"],
      },
      {
        group: "Autonomous Systems",
        items: [
          "ArduPilot / ArduCopter",
          "pymavlink / MAVSDK",
          "MAVProxy",
          "Mission Planner",
          "ROS 2 (intermediate)",
          "Gazebo Harmonic",
        ],
      },
      {
        group: "Vision & Deep Learning",
        items: ["YOLOv8", "OpenCV", "CNN (Keras/PyTorch)", "NumPy", "Pandas", "Matplotlib"],
      },
      {
        group: "Embedded / Hardware",
        items: ["Raspberry Pi 5", "Orange Cube (CubePilot)", "Picamera2", "TF03-180 LiDAR"],
      },
      {
        group: "Web & Cloud",
        items: ["FastAPI", "React", "WebSocket", "REST API", "Render.com"],
      },
      { group: "Tools", items: ["Git / GitHub", "QGroundControl", "Cisco Packet Tracer"] },
    ],
  },

  projects: {
    lead: "selected work",
    heading: "Projects",
    items: [
      {
        title: "Autonomous UAV Mission System",
        context: "Teknofest UAV Competition · Sep 2024 – Ongoing",
        role: "Autonomous simulation developer · 2-person software group",
        blurb:
          "I wrote the autonomous mission loop from scratch with pymavlink; sensor fusion and grid scanning roughly doubled the area covered.",
        tech: ["Python", "pymavlink", "MAVSDK", "YOLOv8", "Gazebo Harmonic", "ArduPilot SITL", "ROS 2"],
        link: "",
      },
      {
        title: "AI-Assisted Astronomy Assistant",
        context: "TÜBİTAK 2209-A (Funded) · 2025 – Ongoing",
        role: "Principal investigator",
        blurb:
          "I'm building a CNN for Real/Bogus classification of astronomical images — 0.88 F1-score on a 10,000+ image pipeline.",
        tech: ["Python", "CNN (Keras)", "NumPy", "Pandas", "FITS", "Matplotlib"],
        link: "",
      },
      {
        title: "DisasterRoute — Disaster Coordination Platform",
        context: "EBST Hackathon 2026 · Jan 2026",
        role: "Full-stack + AI integration · Team project",
        blurb:
          "We shipped a platform in 42 hours that triages earthquake reports with GPT-4o and routes rescue teams — including SMS intake and a real-time panel.",
        tech: ["Python", "FastAPI", "React", "GPT-4o API", "Twilio SMS", "WebSocket", "Leaflet.js"],
        link: "",
      },
    ],
  },

  experience: {
    lead: "where I've been",
    heading: "Experience",
    roles: [
      {
        role: "Part-time Software Developer",
        org: "Balıkesir Teknokent",
        period: "July 2026 – Ongoing",
        note: "I completed my mandatory summer internship here and continued part-time afterwards.",
      },
      {
        role: "Technical Mentor",
        org: "Deneyap Türkiye",
        period: "2026 – Ongoing",
        note: "I guide students through system design, problem solving and technical implementation in engineering and technology projects, and manage team dynamics.",
      },
      {
        role: "Board Member & Treasurer",
        org: "MİSYA Culture and Technology Club — Balıkesir University",
        period: "2025 – Ongoing",
        note: "I run the club's finances and budget management, and take an active role in organising technology-focused events.",
      },
    ],
    educationLabel: "Education",
    education: [
      {
        role: "Computer Engineering",
        org: "Balıkesir University",
        period: "Oct 2023 – Jun 2027 (final year)",
        note: "Focusing on autonomous systems, computer vision and embedded systems.",
      },
    ],
    certificatesLabel: "Certificates & Training",
    certificates: [
      {
        name: "AI and UAV Simulation Training",
        org: "SoftVation — certificate of completion",
        year: "Mar 2026",
        href: "/certs/softvation-yapay-zeka-iha-simulasyon.pdf",
        proof: "view certificate",
      },
      {
        name: "CCNA: Introduction to Networks",
        org: "Cisco Networking Academy — verified via Credly badge",
        year: "2026",
        href: "https://www.credly.com/badges/1ccd9943-c636-4821-9523-2ba527fb06f5/public_url",
        proof: "verify badge",
      },
      {
        name: "Introduction to Deep Learning Bootcamp",
        org: "Akbank — certificate of participation",
        year: "2025",
        href: "/certs/akbank-derin-ogrenme-bootcamp.pdf",
        proof: "view certificate",
      },
      {
        name: "Dijital Usta — Online Training Starter Modules",
        org: "Dijital Usta Project — certificate of participation",
        year: "",
        href: "/certs/dijital-usta-katilim-belgesi.pdf",
        proof: "view certificate",
      },
      {
        name: "R/C Model Aircraft Manual Flight Training",
        org: "TÜBİTAK UAV Competitions — training for team pilots",
        year: "",
      },
      {
        name: "English Language Certificate — B2",
        org: "American Life Language Institute",
        year: "2024",
      },
    ],
  },

  contact: {
    lead: "get in touch",
    heading: "Contact",
    invitation: "Let's build something worth remembering.",
    socials: [
      { label: "GitHub", href: shared.links.github },
      { label: "LinkedIn", href: shared.links.linkedin },
      { label: "Website", href: shared.links.website },
      { label: "Email", href: `mailto:${shared.email}` },
    ],
  },

  ui: {
    orbit: "OPEN TO OPPORTUNITIES • LET'S BUILD TOGETHER • ",
    orbitLabel: "Go to the collaborate section",
    panelsLabel: "where would you like to look?",
    panels: [
      { id: "projects", k: "01", title: "Projects", note: "Teknofest UAV · TÜBİTAK 2209-A · DisasterRoute" },
      { id: "skills", k: "02", title: "Skills", note: "Autonomous systems, vision, backend" },
      { id: "experience", k: "03", title: "Experience", note: "Teknokent · Deneyap · MİSYA" },
      { id: "collaborate", k: "04", title: "Collaborate", note: "Reach me in a few steps" },
    ],
    railLeft: "Autonomous Systems · Artificial Intelligence",
    railRight: "Portfolio · 2026",
    heroCta: "What can we build together?",
    heroCtaNote: "Tell me in a few steps",
    scroll: "scroll",
    view: "View",
    gateHint: "keep scrolling — the light opens",
    footer: "grown by hand, petal by petal.",
    langLabel: "Language",
  },
};

export const content = { tr, en };
