# XORUN UZB DRIVE 🇺🇿

Brauzerda ishlaydigan haqiqiy 3D haydash va parking o‘yini. Three.js, backend yo‘q, build qadam yo‘q, tashqi 3D model fayli yo‘q — mashina ham, mahalla ham to‘liq kod orqali quriladi.

- **Map:** KICHIK ITTIFOQ — TOSHKENT VILOYATI (aniq geografik nusxa emas; Kichik Ittifoqdan ilhomlangan o‘zbekona mahalla muhiti)
- **Mashina:** Chevrolet Cobalt

---

## Eng muhim o‘zgarish: PLAY endi hech narsa yuklamaydi

Avvalgi versiyalarda PLAY bosilganda sahna o‘sha payt qurilardi — agar biror joyda xato bo‘lsa, siz faqat menyuni ko‘rar edingiz.

Endi **3D dunyo sahifa ochilishi bilanoq quriladi**. Menyu shaffof qatlam bo‘lib, uning ortida mahalla, ko‘cha va Cobalt aylanib turadi — ya’ni siz 3D ishlayotganini PLAY bosishdan oldin ko‘rasiz. PLAY faqat kamerani mashina orqasiga olib o‘tadi va rulni sizga beradi. Oradagi "yuklash" bosqichi butunlay olib tashlandi.

Qolgan ishonchsiz joylar ham yo‘qotildi:

- Three.js oddiy `<script src>` tegi bilan yuklanadi (eng sodda va ishonchli usul). Agar u yuklanmasa, `js/three-fallback.js` boshqa CDN'lardan (jsDelivr, unpkg) va `vendor/three.min.js` dan urinib ko‘radi.
- `js/ui.js` birinchi yuklanadi va barcha tugmalarni darhol ulaydi. Dvigatel hali yuklanmagan bo‘lsa ham PLAY javob beradi — so‘rov navbatga qo‘yiladi va tayyor bo‘lishi bilan o‘yin boshlanadi.
- Har qanday xato qizil bannerda ko‘rsatiladi, konsolda yashirinib qolmaydi.
- **Settings → Debug** ni yoqsangiz, ekranda FPS, mashina koordinatasi, burchagi, tezligi, parkinggacha masofa va bosilgan tugma ko‘rinadi.

---

## Ishga tushirish (VS Code)

1. `XORUN-UZB-DRIVE` papkasini VS Code'da oching.
2. **Live Server** kengaytmasini o‘rnating (Ritwick Dey).
3. `index.html` ustida o‘ng tugma → **Open with Live Server**.

Yoki oddiy server orqali:

```bash
python3 -m http.server 8080    # http://localhost:8080
npx serve .
```

**Internetsiz ishlatmoqchi bo‘lsangiz:** `three.min.js` (r128) faylini bir marta yuklab olib, loyiha ichidagi `vendor/three.min.js` sifatida saqlang — qolgani avtomatik.

---

## Boshqaruv

| Tugma | Vazifa |
|---|---|
| `W` / `↑` | Gaz |
| `S` / `↓` | Orqaga (reverse) |
| `A` / `←` | Chapga burilish |
| `D` / `→` | O‘ngga burilish |
| `Space` | Tormoz |
| `R` | Mashinani STARTga qaytarish |
| `Esc` | Menyuga chiqish |

Telefonda katta sensorli tugmalar (GAZ, ORQAGA, TORMOZ, ◀ ▶) avtomatik chiqadi. Kompyuterda sinash uchun: **Settings → Mobil tugmalarni ko‘rsatish**.

---

## O‘yin oqimi

```
MENU  →  PLAY  →  3D KICHIK ITTIFOQ  →  COBALTNI HAYDASH  →  PARKING  →  NATIJA
```

1. START — ko‘chaning shimoliy chetida, mahallaga qarab turasiz.
2. Ko‘cha bo‘ylab yuring: chorraha, zebra, uylar va darvozalar, do‘konlar, elektr ustunlari, ko‘cha chiroqlari.
3. Ekran o‘rtasidagi sariq strelka parkinggacha yo‘nalish va masofani ko‘rsatadi.
4. Oxirida chap tomondagi parking maydoniga kiring va **sariq chiziq bilan belgilangan joyga** mashinani qo‘ying.
5. To‘g‘rilang, to‘liq to‘xtang, bir lahza ushlab turing → **PARKING COMPLETED! +100 COINS +XP**.

Parking faqat mashina **joy ichida** bo‘lsa va **juda qiya turmagan** bo‘lsa hisobga olinadi. Orqa bilan kirib qo‘ysangiz ham hisoblanadi. Yuqoridagi yozuv har doim nima yetishmayotganini aytib turadi: *sariq chiziq ichiga kiring → mashinani to‘g‘rilang → to‘liq to‘xtang → ushlab turing*.

---

## Mashina — haqiqiy 3D model

Cobalt 60 dan ortiq 3D meshdan yig‘ilgan (CSS to‘rtburchak emas):

kuzov (old va orqa tomoni qiyaligi bilan) · toraygan salon · old oyna · orqa oyna · 4 ta yon oyna · B-ustunlar · yon ko‘zgular (qo‘l, korpus va oynasi bilan) · old va orqa bamper · xrom panjara · faralar + haqiqiy yorug‘lik nuri · burilish chiroqlari · orqa (tormoz) chiroqlari · orqaga yurish chirog‘i · raqam taxtasi · chiqindi trubasi · eshik chiziqlari va tutqichlari · g‘ildirak kamarlari · 4 ta g‘ildirak (shina + disk + spitsalar) · salon (panel, ikkita o‘rindiq, rul) · soya.

G‘ildiraklar tezlikka qarab aylanadi, oldingi ikkitasi rul bilan buriladi, tormozda orqa chiroqlar yonadi, orqaga yurganda oq chiroq yonadi.

## Garaj va unlock tizimi

| Mashina | Holat | Narx |
|---|---|---|
| Chevrolet Cobalt | OCHIQ | — |
| Chevrolet Spark | 🔒 | 450 🪙 |
| Chevrolet Nexia | 🔒 | 600 🪙 |
| Chevrolet Damas | 🔒 | 700 🪙 |
| Chevrolet Gentra | 🔒 | 900 🪙 |
| Chevrolet Malibu | 🔒 | 1500 🪙 |

Har bir parking uchun tanga olasiz; tanga yetganda garajda **Ochish** tugmasi faollashadi. Tanga, XP va ochilgan mashinalar `localStorage` da saqlanadi. Har bir mashinaning o‘z o‘lchami, rangi, tezligi va kuzov turi bor (Spark — xetchbek, Damas — yukchi furgon), shuning uchun ochilganda haqiqatan boshqacha ko‘rinadi va boshqacha yuradi. Garajda mashinani tanlasangiz, u menyu ortida 3D da aylanib ko‘rsatiladi.

---

## Tekshiruv natijalari

Ikkala testni Node bilan ishlatish mumkin (hech qanday paket kerak emas):

```bash
node test-gameplay.js    # 36 ta tekshiruv
node test-browser.js     # 37 ta tekshiruv
```

`test-gameplay.js` — Three.js o‘rniga stub qo‘yib, haqiqiy `car.js`, `map.js`, `parking.js` ni ishlatadi: W oldinga yuradimi, A va D qarama-qarshi tomonga buradimi, tormoz to‘xtatadimi, reverse ishlaydimi, mashina binoga urilib ichidan o‘tib ketmaydimi, xaritadan chiqib ketmaydimi, parking to‘g‘ri qo‘yilganda qabul qilib, qiya/harakatdagi/tashqaridagi holatda rad etadimi — va oxirida STARTdan parkinggacha to‘liq yo‘lni bosib o‘tadi.

`test-browser.js` — brauzerni simulyatsiya qiladi: `index.html` dagi **aynan o‘sha tartibda** barcha skriptlarni yuklaydi, PLAY tugmasini **bosadi**, klaviatura hodisalarini yuboradi va haqiqiy o‘yin siklini aylantiradi. Tekshiradi: sahifa ochilishida 3D dunyo qurildimi (90 ta kolayder), PLAY haydash rejimiga o‘tdimi, menyu yashirindimi, W mashinani harakatlantirdimi, A burdimi, Space to‘xtatdimi, R qaytardimi, parking natija oynasini chiqardimi, tanga saqlandimi, garaj ochildimi.

**73 ta tekshiruvning barchasi o‘tdi.** Alohida holat ham sinaldi: Three.js umuman yuklanmasa, PLAY xato bermaydi, menyu ishlashda davom etadi va nima bo‘layotgani yozuvda ko‘rinadi.

---

## Loyiha tuzilishi

```
XORUN-UZB-DRIVE/
│
├── index.html              # Menyu, garaj, map, settings, HUD, natija oynasi
├── css/style.css           # Dizayn (avvalgi menyu ko‘rinishi saqlangan)
├── js/
│   ├── three-fallback.js   # Three.js uchun zaxira CDN'lar
│   ├── ui.js               # DOM qatlami, tugmalar, garaj, HUD, saqlash
│   ├── controls.js         # Klaviatura + sensorli boshqaruv
│   ├── car.js              # 3D mashina modeli + fizika + to‘qnashuv
│   ├── map.js              # Kichik Ittifoq mahallasi + kolayderlar
│   ├── parking.js          # Parking tekshiruvi
│   └── main.js             # Renderer, sahna, kamera, o‘yin sikli
├── vendor/                 # Offline uchun three.min.js shu yerga
├── assets/                 # Kelajakdagi fayllar uchun
├── test-gameplay.js
├── test-browser.js
└── README.md
```

Texnik eslatma: mashina mesh’i lokal `-Z` tomonga qaraydi, shuning uchun heading 0 = dunyo `-Z`, oldinga vektor `(-sin h, 0, -cos h)`. Hovli devorlari ko‘chaga **parallel** (rotY = π/2) quriladi — ilgari ular ko‘chani kesib o‘tib, parkingga yo‘lni to‘sib qo‘ygan edi.
