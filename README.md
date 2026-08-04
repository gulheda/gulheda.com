# gulheda.com

Gülheda Kızılhan — Bilgisayar Mühendisi. Kişisel portfolyo sitesi.

**Canlı:** [gulheda.com](https://gulheda.com)

## Öne çıkanlar

- **WebGL atmosfer** — three.js + özel GLSL: domain-warped fbm bulut katmanı,
  ışık hüzmeleri, film greni; hata durumunda sayfayı asla düşürmeyen
  SafeBoundary ile dekoratif katman olarak yüklenir.
- **İki dil** — TR (varsayılan) / EN; özel `LocaleProvider` ile,
  tercih `localStorage`'da tutulur.
- **İletişim akışı** — konu algılama (yazılan metinden teknolojileri
  çıkaran kural tabanlı tarama), bal küpü (honeypot) koruması ve
  Formspree gönderimi. Uç nokta tanımlı değilse form demo modunda
  çalışır ve bunu arayüzde açıkça söyler.
- **Motion** — framer-motion ile scroll-driven reveal'lar, marquee,
  orbit rozeti ve imleç spotlight'ları; `prefers-reduced-motion`'a saygılı.

## Geliştirme

```bash
npm install
npm run dev
```

İletişim formunu canlıya bağlamak için `.env.example` dosyasını `.env`
olarak kopyalayıp kendi Formspree adresini yaz. Ayrıntılar: [DEPLOY.md](DEPLOY.md)

## Yığın

React 19 · Vite · three.js · framer-motion

---

© Gülheda Kızılhan — kod incelemek ve ilham almak serbest; birebir
kopyalayıp kendi portfolyon olarak yayınlamak değil.
