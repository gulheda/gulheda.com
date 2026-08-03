# Yayına Alma / Deploy

## 1. Derle

```bash
npm run build
```

Çıktı `dist/` klasörüne gelir. Site tamamen statiktir — sunucu, veritabanı
veya Node çalıştırmaya gerek yok.

Yerelde son bir kontrol için:

```bash
npm run preview
```

## 2. Vercel'e yükle ve gulheda.com'u bağla

`vercel.json` hazır — Vercel projeyi tanıyacak, ayar girmene gerek yok.

### a) Projeyi yükle

```bash
npx vercel login
npx vercel --prod
```

İlk çalıştırmada birkaç soru sorar; hepsine varsayılanla (Enter) geçebilirsin.
*(Giriş senin hesabınla yapılır — şifreni görmem gerekmez.)*

Alternatif ve daha kolay yol: projeyi GitHub'a push et, sonra
[vercel.com/new](https://vercel.com/new) → repoyu seç → **Deploy**.
Sonraki her push otomatik yayına gider.

### b) Ortam değişkenini ekle (form için şart)

Vercel panelinde: **Project → Settings → Environment Variables**

| Name | Value |
|---|---|
| `VITE_CONTACT_ENDPOINT` | `https://formspree.io/f/xlgqadjv` |

*(Production, Preview ve Development üçünü de işaretle, sonra
**Redeploy** et. `.env` dosyası git'e gitmediği için bu adım şart.)*

### c) Alan adını bağla (gulheda.com)

Alan adı **hosting.com.tr**'de kayıtlı ve aktif (26.07.2027'ye kadar).

**1.** Vercel panelinde: **Project → Settings → Domains**
- `gulheda.com` ekle
- `www.gulheda.com` ekle → Vercel www'yu köke yönlendirmeyi önerir, kabul et
- Eski `gulheda.com.tr` kayıtları duruyorsa **sil** (o alan adı artık senin değil,
  Vercel boşuna "misconfigured" uyarısı yolluyor)

**2.** hosting.com.tr panelinde: **Domainlerim → gulheda.com → İsim Sunucuları**

En temiz yol, DNS'i tamamen Vercel'e devretmek:

| | |
|---|---|
| Nameserver 1 | `ns1.vercel-dns.com` |
| Nameserver 2 | `ns2.vercel-dns.com` |

*"İnternet sitem Hosting.com.tr'de çalışıyor" kutusunun işaretini kaldır*, sonra
**Nameserverları Değiştir**'e bas.

**3.** 10 dakika – 24 saat içinde yayılır. Vercel doğrulayınca SSL sertifikasını
kendisi kurar; `https://gulheda.com` açılır.

> **Alternatif:** DNS'i hosting.com.tr'de tutmak istersen (ileride
> `@gulheda.com` e-postası kuracaksan bu daha rahat), nameserverlara
> dokunma; bunun yerine DNS/Zone yönetiminden şu kayıtları gir:
>
> | Tip | Ad | Değer |
> |---|---|---|
> | `A` | `@` | `76.76.21.21` |
> | `CNAME` | `www` | `cname.vercel-dns.com` |

## 3. İletişim formu

Form **bağlı ve çalışıyor**. Adres `.env` dosyasında:

```bash
VITE_CONTACT_ENDPOINT=https://formspree.io/f/xlgqadjv
```

Ziyaretçi formu doldurup gönderdiğinde mesaj doğrudan Gmail'ine düşer:
ad, e-posta (yanıtla adresi otomatik ayarlı), kurum, LinkedIn, iletişim
amacı, alan, proje aşaması, aranan destek, açıklaması ve hazırlanan
mesajın tamamı.

> ⚠️ **`.env` dosyası git'e gönderilmez.** Bu yüzden Vercel'de yukarıdaki
> 2/b adımını atlamamalısın — yoksa canlıdaki site demo moduna düşer ve
> mesajlar sana ulaşmaz.

**Adresi değiştirmek istersen:** sadece `.env` içindeki satırı değiştir ve
yeniden derle. Kodda hiçbir yere dokunmana gerek yok.

## 4. Yayın öncesi kontrol listesi

**Hazır olanlar**

- [x] Form bağlandı (`.env` → `VITE_CONTACT_ENDPOINT`)
- [x] Alan adı `gulheda.com` olarak güncellendi (`canonical`, `og:url`, site linki)
- [x] `vercel.json` eklendi

**Senin yapman gerekenler**

- [ ] Vercel'e yükle *(2/a)*
- [ ] Vercel'e `VITE_CONTACT_ENDPOINT` ortam değişkenini ekle *(2/b — atlanırsa form canlıda çalışmaz)*
- [ ] `gulheda.com`'u Vercel'e bağla ve nameserverları değiştir *(2/c)*
- [ ] Eski `gulheda.com.tr` kayıtlarını Vercel'den sil
- [ ] Canlıda kendine bir test mesajı gönder
- [ ] `src/data/content.js` → proje GitHub linklerini doldur (`link: ""` boş)
- [ ] Telefonda bir kez gezin: menü, dil değiştirme, form akışı

## Notlar

- **Dil:** Türkçe varsayılan, İngilizce seçmeli. Seçim tarayıcıda hatırlanır.
- **Paket boyutu:** ana paket ~121 KB (gzip). Arka plandaki WebGL atmosferi
  ayrı bir parçada (~136 KB gzip) ve **sonradan** yükleniyor, yani yazılar
  beklemeden görünüyor. Derlemedeki "chunk > 500 kB" uyarısı bu ayrılmış
  parça içindir; sorun değil.
- **Erişilebilirlik:** form klavyeyle tam kullanılabilir, `prefers-reduced-motion`
  desteklenir, metin kontrastı WCAG AA üstündedir.
