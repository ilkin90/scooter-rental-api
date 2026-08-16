# Scooter Rental API — Proje Dokümantasyonu

Bakü'de elektrikli scooter paylaşım sisteminin **backend REST API**'si.
Bu repo şu an sadece **dokümantasyon** içerir — kodu sen yazacaksın.

---

## Bu doküman seti nedir?

Bu, "kopyala-yapıştır tutorial" değil. Bu bir **teknik şartname (spec)**.
Gerçek işte sana verilecek olan şeyin aynısı: *ne* inşa edeceğin yazılıdır,
*nasıl* inşa edeceğin sana bırakılmıştır.

Kasıtlı olarak **hiç kod yok**. Sebebi şu: kodu okuyarak değil, yazarak öğrenirsin.
Kod burada olsaydı, projeyi bitirirdin ama mülakatta tek bir soruya cevap veremezdin.

---

## Okuma sırası

| # | Dosya | Ne zaman okumalısın |
|---|-------|---------------------|
| 01 | [Proje Tanımı](docs/01-proje-tanimi.md) | En başta. Ne yaptığını anlamadan kod yazma. |
| 02 | [Teknoloji ve Mimari](docs/02-mimari.md) | Kurulumdan önce. Klasör yapısı burada. |
| 03 | [Veri Modeli](docs/03-veri-modeli.md) | Prisma şemasını yazmadan önce. |
| 04 | [API Sözleşmesi](docs/04-api-sozlesmesi.md) | Her endpoint'i yazmadan önce. Ana referansın. |
| 05 | [İş Kuralları](docs/05-is-kurallari.md) | Kiralama mantığını yazarken. **En kritik dosya.** |
| 06 | [Yol Haritası](docs/06-yol-haritasi.md) | Her gün. Sıradaki adımın burada. |
| 07 | [Test Senaryoları](docs/07-test-senaryolari.md) | Her aşamayı bitirdikten sonra. |
| 08 | [CV ve Mülakat](docs/08-cv-konumlandirma.md) | Proje bitince — ama şimdi bir göz at, hedefi görürsün. |
| 09 | [Kavram Sözlüğü](docs/09-kavram-sozlugu.md) | Tanımadığın bir terim gördüğünde. |
| 10 | [Git Rehberi](docs/10-git-rehberi.md) | İlk gün, kod yazmaya başlamadan önce. Kısa. |

---

## Teknoloji özeti

| Katman | Seçim |
|--------|-------|
| Çalışma ortamı | Node.js (LTS sürüm) |
| Web framework | Express |
| Veritabanı | PostgreSQL |
| ORM | Prisma |
| Kimlik doğrulama | JWT + bcrypt |
| Girdi doğrulama | Zod |
| API dokümantasyonu | Swagger / OpenAPI |
| Dil | JavaScript (TypeScript'e sonra geçilebilir) |

Neden bu seçimler yapıldı → [docs/02-mimari.md](docs/02-mimari.md)

---

## Projenin kapsamı (tek bakışta)

Sistem **5 ana yeteneği** sunmak zorunda:

1. **Kullanıcı yönetimi** — kayıt, giriş, profil, rol (kullanıcı/admin)
2. **Scooter envanteri** — scooter ekleme/güncelleme (admin), listeleme, konuma göre arama
3. **Kiralama akışı** — kiralama başlat, aktif kiralamayı gör, kiralamayı bitir
4. **Ücretlendirme ve cüzdan** — dakika bazlı ücret hesabı, bakiyeden düşme, bakiye yükleme, işlem geçmişi
5. **Kendi kendini belgeleyen API** — Swagger arayüzü, tutarlı hata formatı

Bu beşi bitmeden proje "bitmiş" sayılmaz. Geri kalan her şey bonus.

---

## Nasıl inşa edilir: önce MVP, sonra kalınlaştır

Bu proje **katman katman değil, dilim dilim** inşa edilir.

İlk iki haftada "çirkin ama baştan sona çalışan" bir sürüm çıkarırsın:
kayıt ol → scooter listele → kirala → bitir → para düş. Sonraki her sürüm
o çalışan ürünü daha iyi yapar.

**Neden böyle?** Çünkü önce tüm kimlik doğrulamayı, sonra tüm scooter
yönetimini, en sona kiralamayı bırakırsan — dört hafta çalışıp elinde
**hâlâ scooter kiralayamayan** bir "scooter kiralama API'si" olur.
Yarıda bırakırsan hiçbir şeyin olmaz.

Dilimli yaklaşımda ise **nerede bırakırsan bırak, elinde çalışan bir ürün olur.**

| Sürüm | Süre | Bitince elinde ne var |
|-------|------|----------------------|
| **v0.1** — Çalışan İskelet (MVP) | ~2 hafta | Baştan sona kiralama yapılabilen, çirkin ama çalışan bir API |
| **v0.2** — Sağlamlaştırma | ~1 hafta | Düzgün hata veren, yetkilendirmesi olan, güvenli bir API |
| **v0.3** — Cüzdan ve Defter | ~5 gün | Denetlenebilir para hareketleri, atomik işlemler |
| **v0.4** — Keşif ve Filtreleme | ~5 gün | Konum bazlı arama, sayfalama, filtreler |
| **v0.5** — Eşzamanlılık ⭐ | ~1 hafta | Projenin CV'deki asıl değeri |
| **v0.6** — Vitrin | ~5 gün | Swagger, README, sunulabilir paket |
| **v1.0+** — Opsiyonel | açık uçlu | Deploy, testler, Docker, CI |

**Toplam: ~7 hafta**, günde 2 saat çalışarak. Ama asıl mesele şu:
**2. haftanın sonunda gösterebileceğin bir şeyin olacak.**

> Proje v0.1'den itibaren CV'ye konulabilir. Her sürümde CV maddesini
> güncellersin. "Bitmeden koymayayım" diye bekleme.

---

## Günlük çalışma döngüsü

1. [Yol Haritası](docs/06-yol-haritasi.md)'nda sıradaki adımı aç.
2. Adımın ☑️ kriter satırını oku — hedefin bu.
3. Kodu yaz.
4. [Test Senaryoları](docs/07-test-senaryolari.md)'ndan ilgili grubu çalıştır.
5. Commit at. Sürüm bittiyse git etiketi at (`v0.1.0`).

**Kural:** Bir adım bitmeden diğerine geçme. Ama **sürümü de fazla şişirme** —
v0.1'de akla gelen her iyileştirmeyi yapmaya çalışırsan MVP hiç bitmez.
Aklına gelen fazlalıkları bir not dosyasına yaz, ilgili sürümde ele alırsın.
