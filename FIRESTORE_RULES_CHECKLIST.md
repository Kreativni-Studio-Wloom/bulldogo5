# Checklist: Kontrola Firestore Security Rules

## ✅ Co zkontrolovat v Firebase Console

### 1. Zkopírovat pravidla do Firebase Console
1. Otevřít Firebase Console: https://console.firebase.google.com/
2. Vybrat projekt: **inzerio-inzerce**
3. Jít na: **Firestore Database** → **Rules**
4. Zkopírovat obsah z `firestore-rules.txt`
5. Kliknout na **Publish** (důležité!)

### 2. Zkontrolovat App Check Enforcement
1. Firebase Console → **App Check** → **Settings**
2. Zkontrolovat, jestli je "Enforce App Check" zapnutý pro **Firestore**
3. Pokud je zapnutý a App Check selhává → může blokovat požadavky
4. **Řešení**: Buď vypnout enforcement, nebo opravit App Check (přidat doménu do reCAPTCHA)

### 3. Ověřit, že pravidla jsou publikovaná
- Po úpravách pravidel musíte kliknout na **Publish**
- Bez publikování se změny neprojeví

## 📋 Kolekce pokryté pravidly

### ✅ Users a subkolekce
- `users/{userId}` - ✅ pokryto
- `users/{userId}/inzeraty/{adId}` - ✅ pokryto přes `{document=**}`
- `users/{userId}/profile/profile` - ✅ pokryto přes `{document=**}`
- `users/{userId}/reviews/{reviewId}` - ✅ pokryto přes `{document=**}`
- `users/{userId}/inzeraty/{adId}/reviews/{reviewId}` - ✅ pokryto přes `{document=**}`

### ✅ Conversations (Chat)
- `conversations/{convId}` - ✅ pokryto
- `conversations/{convId}/messages/{messageId}` - ✅ pokryto

### ✅ Legacy kolekce
- `services` - ✅ pokryto (fallback)
- `test` - ✅ pokryto (vývoj)

## 🔍 CollectionGroup dotazy

Tyto dotazy vyžadují veřejné čtení `users/{userId}/{document=**}`:
- ✅ `collectionGroup('inzeraty')` - pokryto
- ✅ `collectionGroup('profile')` - pokryto
- ✅ `collectionGroup('reviews')` - pokryto

## ⚠️ Důležité poznámky

1. **CollectionGroup dotazy** potřebují `allow read: if true;` pro `users/{userId}/{document=**}`
2. **App Check enforcement** může blokovat požadavky i když jsou pravidla správná
3. **Pravidla musí být publikovaná** - kliknout na Publish po úpravách
4. **Conversations** vyžadují přihlášení - `allow read: if request.auth != null`

## 🧪 Testování

Po nasazení pravidel otestujte:
1. ✅ Čtení inzerátů bez přihlášení (collectionGroup)
2. ✅ Čtení inzerátů s přihlášením
3. ✅ Zápis inzerátů (jen vlastník)
4. ✅ Chat konverzace (jen přihlášení)
5. ✅ Recenze (čtení veřejné, zápis jen vlastník)

