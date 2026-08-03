// =============================================================
//  GÖNDERİM SERVİSİ / SUBMISSION SERVICE
//
//  Formu canlıya almak için KOD DEĞİŞTİRMENE GEREK YOK.
//  Proje kökünde bir `.env` dosyası oluştur ve tek satır yaz:
//
//      VITE_CONTACT_ENDPOINT=https://formspree.io/f/XXXXXXX
//
//  Bu değer tanımlıysa form gerçekten gönderim yapar ve arayüzdeki
//  "demo" uyarısı kendiliğinden kaybolur. Tanımlı değilse demo
//  modunda çalışır: hiçbir ağ isteği atılmaz, mesaj kimseye gitmez.
//
//  Adres nasıl alınır? DEPLOY.md → "İletişim formunu canlıya bağla"
// =============================================================

const ENDPOINT = (import.meta.env.VITE_CONTACT_ENDPOINT || "").trim();

/** Gerçek gönderim yapılandırılmış mı? */
export const isDemo = ENDPOINT === "";

/* Formspree / Web3Forms gibi servislerin e-postada okunaklı bir özet
   göstermesi için alanları düzleştirip anlamlı bir konu başlığı üretiyoruz. */
function buildPayload(a) {
  const subject =
    a.locale === "tr"
      ? `Portfolyo — ${a.name || "yeni mesaj"}`
      : `Portfolio — ${a.name || "new message"}`;

  return {
    _subject: subject,
    subject,
    name: a.name,
    email: a.email,
    replyto: a.email, // servisler "yanıtla" adresini buradan okur
    organisation: a.org || "",
    linkedin: a.linkedin || "",
    purpose: a.purpose || "",
    field: a.field || "",
    stage: a.stage || "",
    support: a.support || "",
    description: a.description || "",
    message: a.message,
    locale: a.locale,
  };
}

/**
 * @param {object} answers  formdaki tüm cevaplar
 * @returns {Promise<{ ok: true, delivered: boolean }>}
 *          delivered=false → demo modu, mesaj hiçbir yere iletilmedi
 */
export async function submitInquiry(answers) {
  if (isDemo) {
    // Arayüzün yükleme durumu gerçekçi görünsün diye kısa bir bekleme.
    // Ağ isteği YOK, gönderim YOK.
    await new Promise((resolve) => setTimeout(resolve, 700));
    if (import.meta.env.DEV) {
      console.info(
        "[submitInquiry] demo modu — VITE_CONTACT_ENDPOINT tanımlı değil, mesaj iletilmedi.",
        answers,
      );
    }
    return { ok: true, delivered: false };
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(buildPayload(answers)),
  });

  if (!res.ok) {
    throw new Error(`submitInquiry: sunucu ${res.status} döndü`);
  }

  return { ok: true, delivered: true };
}
