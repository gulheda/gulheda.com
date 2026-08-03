// =============================================================
//  "Birlikte Ne Geliştirebiliriz?" / "What Can We Build Together?"
//  Yönlendirmeli iletişim akışının tüm metinleri ve mantığı.
//
//  Her seçenekte iki alan var:
//    label  → ekranda görünen metin
//    phrase → otomatik oluşturulan mesaj cümlesine giren hâli
//  Böylece mesaj dilbilgisel olarak doğru kuruluyor.
// =============================================================

/* Serbest metinden tanınan teknolojileri çıkaran küçük analizci.
   Uzun terimler önce taranır ki "YOLOv8" varken ayrıca "YOLO" düşmesin. */
const TECH_TERMS = [
  "Gazebo Harmonic", "Raspberry Pi", "ArduPilot", "pymavlink", "MAVSDK",
  "YOLOv8", "YOLO", "OpenCV", "PyTorch", "TensorFlow", "Keras", "CNN",
  "FastAPI", "React", "WebSocket", "PostgreSQL", "Docker", "ROS 2", "ROS2",
  "NumPy", "Pandas", "Python", "TypeScript", "JavaScript", "C++", "SQL",
  "LiDAR", "GPT", "LLM", "İHA", "UAV", "drone", "simülasyon", "simulation",
];
export function detectTech(text) {
  if (!text) return [];
  const low = text.toLowerCase();
  const found = [];
  for (const t of [...TECH_TERMS].sort((a, b) => b.length - a.length)) {
    const tl = t.toLowerCase();
    if (!low.includes(tl)) continue;
    if (found.some((f) => f.toLowerCase().includes(tl))) continue;
    found.push(t);
  }
  return found.slice(0, 6);
}

/* Hangi amaç hangi soruları açar — akışın tek kaynağı */
const ASKS = {
  project: ["field", "stage", "support", "description"],
  job: ["field", "description"],
  dataAi: ["field", "stage", "support", "description"],
  autonomous: ["field", "stage", "support", "description"],
  question: ["field", "description"],
  connect: ["description"],
};

/* "Neden Gülheda?" — alan → deneyim eşleşmeleri.
   NOT: TÜBİTAK 2209-A için yalnızca desteğe hak kazandığı ve
   geliştirme aşamasında olduğu belirtilir; teknik ayrıntı verilmez. */
const WHY_BUCKETS = {
  tr: {
    data: [
      "Python",
      "Pandas",
      "NumPy",
      "Veri temizleme ve ön işleme",
      "API tabanlı veri aktarımı",
      "Gerçek zamanlı veri sistemleri",
    ],
    ai: [
      "TÜBİTAK 2209-A kapsamında destek almaya hak kazanan yapay zekâ projesi (geliştirme aşamasında)",
      "CNN",
      "YOLOv8",
      "Görüntü işleme",
    ],
    autonomous: [
      "Otonom İHA Görev ve Simülasyon Sistemi",
      "ArduPilot",
      "Gazebo Harmonic",
      "pymavlink",
      "MAVSDK",
      "Sensör verisi işleme",
    ],
    backend: ["DisasterRoute", "FastAPI", "WebSocket", "React", "REST API"],
  },
  en: {
    data: [
      "Python",
      "Pandas",
      "NumPy",
      "Data cleaning and preprocessing",
      "API-based data transfer",
      "Real-time data systems",
    ],
    ai: [
      "An AI project that qualified for TÜBİTAK 2209-A support (currently in development)",
      "CNN",
      "YOLOv8",
      "Computer vision",
    ],
    autonomous: [
      "Autonomous UAV Mission and Simulation System",
      "ArduPilot",
      "Gazebo Harmonic",
      "pymavlink",
      "MAVSDK",
      "Sensor data processing",
    ],
    backend: ["DisasterRoute", "FastAPI", "WebSocket", "React", "REST API"],
  },
};

/* alan → "Neden Gülheda?" kovası */
const FIELD_TO_BUCKET = {
  data: "data",
  ai: "ai",
  vision: "ai",
  autonomous: "autonomous",
  uav: "autonomous",
  backend: "backend",
  other: null,
};

const tr = {
  eyebrow: "birlikte çalışalım",
  heading: "Birlikte Ne Geliştirebiliriz?",
  intro:
    "Birkaç adımda ne üzerine konuşmak istediğini anlayalım — sonra mesajını senin için hazırlayayım.",

  steps: ["Amaç", "Detaylar", "Mesaj & Gönderim"],
  stepOf: (i, n) => `Adım ${i} / ${n}`,

  purposeLegend: "Öncelikle: neden yazıyorsun?",
  purposes: [
    { id: "project", label: "Bir proje hakkında konuşmak istiyorum", inline: "bir proje hakkında", asks: ASKS.project },
    {
      id: "job",
      label: "İş veya staj fırsatı paylaşmak istiyorum",
      inline: "bir iş veya staj fırsatı hakkında",
      asks: ASKS.job,
    },
    {
      id: "dataAi",
      label: "Veri veya yapay zekâ projesi geliştirmek istiyorum",
      inline: "bir veri / yapay zekâ projesi hakkında",
      asks: ASKS.dataAi,
    },
    {
      id: "autonomous",
      label: "Otonom sistemler veya İHA üzerine çalışmak istiyorum",
      inline: "otonom sistemler ve İHA üzerine",
      asks: ASKS.autonomous,
    },
    { id: "question", label: "Teknik bir soru sormak istiyorum", inline: "teknik bir soru için", asks: ASKS.question },
    {
      id: "connect",
      label: "Profesyonel olarak bağlantı kurmak istiyorum",
      inline: "tanışmak ve bağlantı kurmak için",
      asks: ASKS.connect,
    },
  ],

  fieldLegend: "Proje hangi alanla ilgili?",
  fieldLegendJob: "Fırsat hangi alanla ilgili?",
  fieldLegendQuestion: "Sorun hangi alanla ilgili?",
  fields: [
    { id: "data", label: "Veri ve veri mühendisliği", phrase: "veri ve veri mühendisliği" },
    { id: "ai", label: "Yapay zekâ", phrase: "yapay zekâ" },
    { id: "autonomous", label: "Otonom sistemler", phrase: "otonom sistemler" },
    { id: "uav", label: "İHA teknolojileri", phrase: "İHA teknolojileri" },
    { id: "vision", label: "Görüntü işleme", phrase: "görüntü işleme" },
    {
      id: "backend",
      label: "Backend ve gerçek zamanlı sistemler",
      phrase: "backend ve gerçek zamanlı sistemler",
    },
    { id: "other", label: "Diğer / Henüz emin değilim", phrase: "henüz netleşmemiş bir" },
  ],

  stageLegend: "Proje şu anda hangi aşamada?",
  stages: [
    { id: "idea", label: "Yalnızca bir fikir", phrase: "fikir" },
    { id: "research", label: "Araştırma ve planlama", phrase: "araştırma ve planlama" },
    { id: "prototype", label: "Prototip geliştirme", phrase: "prototip geliştirme" },
    { id: "active", label: "Aktif geliştirme", phrase: "aktif geliştirme" },
    {
      id: "improve",
      label: "Mevcut sistemi iyileştirme",
      phrase: "mevcut sistemi iyileştirme",
    },
  ],

  supportLegend: "Ne tür bir destek veya iş birliği arıyorsun?",
  supports: [
    { id: "consult", label: "Teknik danışmanlık", phrase: "teknik danışmanlık" },
    { id: "build", label: "Birlikte geliştirme", phrase: "birlikte geliştirme" },
    {
      id: "simulation",
      label: "Simülasyon ve test desteği",
      phrase: "simülasyon ve test desteği",
    },
    {
      id: "model",
      label: "Model geliştirme ve eğitimi",
      phrase: "model geliştirme ve eğitimi",
    },
    {
      id: "review",
      label: "Kod incelemesi ve mimari görüşü",
      phrase: "kod incelemesi ve mimari görüşü",
    },
    { id: "unsure", label: "Henüz emin değilim", phrase: "birlikte netleştirebileceğimiz konular" },
  ],

  descriptionLegend: {
    project: "Projeyi veya problemi birkaç cümleyle anlatır mısın?",
    job: "Fırsatı birkaç cümleyle anlatır mısın?",
    dataAi: "Projeyi veya problemi birkaç cümleyle anlatır mısın?",
    autonomous: "Projeyi veya problemi birkaç cümleyle anlatır mısın?",
    question: "Sorunu birkaç cümleyle yazar mısın?",
    connect: "Kısa bir not bırakır mısın?",
  },
  descriptionPlaceholder: "Birkaç cümle yeterli — detayları sonra konuşabiliriz.",

  whyTitle: "Neden Gülheda?",
  whyNote: "Bu alanla ilgili deneyimim:",

  liveTitle: "canlı taslak",
  liveHint: "Seçtiklerin anında mesaja dönüşüyor",
  liveEmpty: "Bir amaç seçtiğinde mesajın burada şekillenmeye başlayacak.",
  detectedLabel: "algılanan konular",
  summaryLabels: { purpose: "amaç", field: "alan", stage: "aşama", support: "destek" },
  reviewLegend: "Mesajın hazır — göndermeden önce düzenleyebilirsin",
  messageLabel: "Oluşturulan mesaj",
  regenerate: "Yeniden oluştur",
  edited: "Düzenlendi",

  nameLabel: "Ad Soyad",
  emailLabel: "E-posta",
  orgLabel: "Kurum veya şirket",
  linkedinLabel: "LinkedIn",
  optional: "isteğe bağlı",

  back: "Geri",
  next: "Devam",
  submit: "Gönder",
  sending: "Gönderiliyor…",
  startOver: "Yeni mesaj oluştur",

  errors: {
    purpose: "Lütfen bir amaç seç.",
    field: "Lütfen bir alan seç.",
    stage: "Lütfen bir aşama seç.",
    support: "Lütfen bir destek türü seç.",
    description: "Lütfen en az birkaç cümle yaz (en az 20 karakter).",
    name: "Lütfen adını ve soyadını yaz.",
    email: "Lütfen geçerli bir e-posta adresi yaz.",
    linkedin: "LinkedIn adresi geçerli bir bağlantı olmalı.",
    message: "Mesaj boş olamaz.",
    generic: "Bir şeyler ters gitti. Lütfen tekrar dene.",
  },

  mad: {
    greet1: "Merhaba Gülheda — sana ",
    greet2: " yazıyorum.",
    purposePlaceholder: "ne hakkında?",
    slotLabels: { field: "alan", stage: "aşama", support: "beklenti" },
    slotPlaceholder: "seç",
    identity1: "Ben ",
    identity2: " — bana ",
    identity3: " adresinden dönebilirsin.",
    namePh: "adın soyadın",
    emailPh: "e-posta adresin",
    orgPh: "kurum / şirket",
    linkedinPh: "LinkedIn bağlantısı",
    previewOpen: "mesajın son halini gör ve düzenle",
    previewClose: "önizlemeyi kapat",
  },

  sentTitle: "Mesajın bana ulaştı.",
  sentBody:
    "Teşekkürler! Mesajını aldım ve yazdığın e-posta adresinden en kısa sürede dönüş yapacağım.",
  successTitle: "Mesajın hazırlandı.",
  successBody:
    "Aşağıdaki iki yoldan biriyle bana ulaştırabilirsin — mesajın panoya kopyalanmaya hazır.",
  copy: "Mesajı kopyala",
  copied: "Kopyalandı",
  openMail: "E-posta ile gönder",

  demoTitle: "Not: form henüz bir sunucuya bağlı değil",
  demoBody:
    "Bu akış şu an demo modunda çalışıyor; formu göndermek mesajı kimseye iletmez. Mesajını kopyalayıp e-posta ile iletebilirsin. Gerçek gönderim altyapısı bağlandığında bu not kalkacak.",
};

const en = {
  eyebrow: "let's work together",
  heading: "What Can We Build Together?",
  intro:
    "In a few steps, let's work out what you'd like to talk about — then I'll draft your message for you.",

  steps: ["Purpose", "Details", "Message & Send"],
  stepOf: (i, n) => `Step ${i} of ${n}`,

  purposeLegend: "First: why are you writing?",
  purposes: [
    { id: "project", label: "I would like to discuss a project", inline: "about a project", asks: ASKS.project },
    {
      id: "job",
      label: "I would like to share a job or internship opportunity",
      inline: "about a job or internship opportunity",
      asks: ASKS.job,
    },
    {
      id: "dataAi",
      label: "I would like to build a data or AI project",
      inline: "about a data / AI project",
      asks: ASKS.dataAi,
    },
    {
      id: "autonomous",
      label: "I would like to work on autonomous systems or UAV technologies",
      inline: "about autonomous systems and UAVs",
      asks: ASKS.autonomous,
    },
    { id: "question", label: "I have a technical question", inline: "with a technical question", asks: ASKS.question },
    {
      id: "connect",
      label: "I would like to connect professionally",
      inline: "to connect professionally",
      asks: ASKS.connect,
    },
  ],

  fieldLegend: "Which area is the project about?",
  fieldLegendJob: "Which area is the opportunity about?",
  fieldLegendQuestion: "Which area is your question about?",
  fields: [
    { id: "data", label: "Data and Data Engineering", phrase: "data and data engineering" },
    { id: "ai", label: "Artificial Intelligence", phrase: "artificial intelligence" },
    { id: "autonomous", label: "Autonomous Systems", phrase: "autonomous systems" },
    { id: "uav", label: "UAV Technologies", phrase: "UAV technologies" },
    { id: "vision", label: "Computer Vision", phrase: "computer vision" },
    {
      id: "backend",
      label: "Backend and Real-Time Systems",
      phrase: "backend and real-time systems",
    },
    { id: "other", label: "Other / I am not sure yet", phrase: "an area still to be defined" },
  ],

  stageLegend: "What stage is the project at?",
  stages: [
    { id: "idea", label: "Just an idea", phrase: "the idea" },
    { id: "research", label: "Research and planning", phrase: "the research and planning" },
    { id: "prototype", label: "Building a prototype", phrase: "the prototyping" },
    { id: "active", label: "Active development", phrase: "active development" },
    {
      id: "improve",
      label: "Improving an existing system",
      phrase: "improving an existing system",
    },
  ],

  supportLegend: "What kind of support or collaboration are you looking for?",
  supports: [
    { id: "consult", label: "Technical consulting", phrase: "technical consulting" },
    { id: "build", label: "Building it together", phrase: "building it together" },
    {
      id: "simulation",
      label: "Simulation and testing support",
      phrase: "simulation and testing support",
    },
    { id: "model", label: "Model development and training", phrase: "model development and training" },
    {
      id: "review",
      label: "Code review and architecture input",
      phrase: "code review and architecture input",
    },
    { id: "unsure", label: "I am not sure yet", phrase: "areas we could define together" },
  ],

  descriptionLegend: {
    project: "Could you describe the project or problem in a few sentences?",
    job: "Could you describe the opportunity in a few sentences?",
    dataAi: "Could you describe the project or problem in a few sentences?",
    autonomous: "Could you describe the project or problem in a few sentences?",
    question: "Could you write your question in a few sentences?",
    connect: "Would you leave a short note?",
  },
  descriptionPlaceholder: "A few sentences is plenty — we can go deeper later.",

  whyTitle: "Why Gülheda?",
  whyNote: "My experience in this area:",

  liveTitle: "live draft",
  liveHint: "Your choices turn into the message as you go",
  liveEmpty: "Pick a purpose and your message will start taking shape here.",
  detectedLabel: "detected topics",
  summaryLabels: { purpose: "purpose", field: "area", stage: "stage", support: "support" },
  reviewLegend: "Your message is ready — you can edit it before sending",
  messageLabel: "Generated message",
  regenerate: "Regenerate",
  edited: "Edited",

  nameLabel: "Full name",
  emailLabel: "Email",
  orgLabel: "Organisation or company",
  linkedinLabel: "LinkedIn",
  optional: "optional",

  back: "Back",
  next: "Continue",
  submit: "Send",
  sending: "Sending…",
  startOver: "Start a new message",

  errors: {
    purpose: "Please choose a purpose.",
    field: "Please choose an area.",
    stage: "Please choose a stage.",
    support: "Please choose a kind of support.",
    description: "Please write at least a few sentences (20 characters minimum).",
    name: "Please enter your full name.",
    email: "Please enter a valid email address.",
    linkedin: "LinkedIn must be a valid link.",
    message: "The message cannot be empty.",
    generic: "Something went wrong. Please try again.",
  },

  mad: {
    greet1: "Hello Gülheda — I’m writing to you ",
    greet2: ".",
    purposePlaceholder: "about what?",
    slotLabels: { field: "area", stage: "stage", support: "looking for" },
    slotPlaceholder: "pick one",
    identity1: "I’m ",
    identity2: " — you can reach me at ",
    identity3: ".",
    namePh: "your name",
    emailPh: "your email",
    orgPh: "company / organisation",
    linkedinPh: "LinkedIn profile",
    previewOpen: "see and edit the final message",
    previewClose: "close the preview",
  },

  sentTitle: "Your message reached me.",
  sentBody:
    "Thank you! I've received it and will reply to the email address you gave as soon as I can.",
  successTitle: "Your message is ready.",
  successBody:
    "You can get it to me either way below — the message is ready to copy.",
  copy: "Copy message",
  copied: "Copied",
  openMail: "Send by email",

  demoTitle: "Note: this form is not connected to a server yet",
  demoBody:
    "This flow currently runs in demo mode; submitting does not deliver the message to anyone. You can copy your message and send it by email. This note will disappear once a real submission backend is connected.",
};

export const collaborate = { tr, en };

/* alan seçimine göre "Neden Gülheda?" listesini döndürür */
export function whyFor(locale, fieldId) {
  const bucket = FIELD_TO_BUCKET[fieldId];
  if (!bucket) return null;
  return WHY_BUCKETS[locale]?.[bucket] ?? null;
}

/* ---------------------------------------------------------------
   Otomatik mesaj oluşturma. Seçimlerin "phrase" hâlleri kullanılır,
   böylece cümle her dilde doğru kurulur.
   --------------------------------------------------------------- */
export function composeMessage(locale, answers) {
  const d = collaborate[locale];
  const find = (list, id) => list.find((o) => o.id === id);

  const field = find(d.fields, answers.field);
  const stage = find(d.stages, answers.stage);
  const support = find(d.supports, answers.support);
  const body = (answers.description || "").trim();

  const greet = locale === "tr" ? "Merhaba Gülheda," : "Hello Gülheda,";
  let mid = "";
  let bodyLabel = "";

  if (locale === "tr") {
    switch (answers.purpose) {
      case "job":
        mid = `Sizinle bir iş veya staj fırsatı hakkında iletişime geçiyorum${
          field ? `. Fırsat ${field.phrase} alanıyla ilgili` : ""
        }.`;
        bodyLabel = "Fırsatın kısa açıklaması:";
        break;
      case "question":
        mid = `${
          field ? `${field.phrase} alanında t` : "T"
        }eknik bir sorum var.`;
        bodyLabel = "Sorum:";
        break;
      case "connect":
        mid = "Profesyonel olarak bağlantı kurmak istiyorum.";
        bodyLabel = "Kısa not:";
        break;
      default: {
        const parts = [];
        if (field) parts.push(`${field.phrase} alanında`);
        if (stage) parts.push(`şu anda ${stage.phrase} aşamasında olan`);
        mid = `${parts.join(", ")} bir proje hakkında iletişime geçiyorum.`;
        if (support)
          mid += ` Özellikle ${support.phrase} konusunda iş birliği yapmak istiyorum.`;
        bodyLabel = "Projenin kısa açıklaması:";
      }
    }
  } else {
    switch (answers.purpose) {
      case "job":
        mid = `I'm reaching out about a job or internship opportunity${
          field ? ` in ${field.phrase}` : ""
        }.`;
        bodyLabel = "A short description of the opportunity:";
        break;
      case "question":
        mid = `I have a technical question${field ? ` about ${field.phrase}` : ""}.`;
        bodyLabel = "My question:";
        break;
      case "connect":
        mid = "I would like to connect professionally.";
        bodyLabel = "A short note:";
        break;
      default: {
        mid = `I'm reaching out about a project${
          field ? ` in ${field.phrase}` : ""
        }${stage ? `, currently at ${stage.phrase} stage` : ""}.`;
        if (support)
          mid += ` I'd especially like to collaborate on ${support.phrase}.`;
        bodyLabel = "A short description of the project:";
      }
    }
  }

  /* the sentence may begin with a field name ("yapay zekâ alanında…"),
     so capitalise it — with the locale's own casing rules, since
     Turkish maps i → İ rather than I */
  const openSentence = mid
    ? mid.charAt(0).toLocaleUpperCase(locale) + mid.slice(1)
    : mid;

  const lines = [greet, "", openSentence, "", bodyLabel, body];

  /* surface the technologies detected in the free text as a closing
     line, so the message reads like a briefed note rather than a form */
  const tech = detectTech(body);
  if (tech.length) {
    const label = locale === "tr" ? "Öne çıkan konular: " : "Key topics: ";
    lines.push("", label + tech.join(" · "));
  }

  return lines.join("\n");
}
