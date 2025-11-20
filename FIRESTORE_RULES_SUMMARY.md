# Shrnutí: Firestore Security Rules - Analýza a oprava

## 🔍 Analýza problému

**Problém**: Auth funguje, Firestore vrací `permission-denied`

**Hlavní příčiny**:
1. ⭐ **App Check Enforcement** - nejpravděpodobnější příčina
2. App Check se inicializuje a selhává
3. Firestore pravidla vyžadují App Check token
4. Neúplná nebo chybná pravidla

## ✅ Co jsem opravil

### 1. **firestore-rules.txt** - Kompletní přepracování pravidel

#### Před:
- Pouze základní pravidla pro `users/{userId}/{document=**}`
- Chyběla pravidla pro `conversations` (chat)
- Chyběla pravidla pro `services` (legacy)
- Neúplná pokrytí

#### Po:
- ✅ **Users a subkolekce**: Veřejné čtení pro collectionGroup dotazy
- ✅ **Conversations**: Pravidla pro chat konverzace a zprávy
- ✅ **Services**: Legacy kolekce pro fallback
- ✅ **Test**: Testovací kolekce
- ✅ **Bez App Check kontroly**: Pravidla nevyžadují `request.appCheck.token`

### 2. **Klíčové změny v pravidlech**

```javascript
// USERS - veřejné čtení pro collectionGroup
match /users/{userId}/{document=**} {
  allow read: if true;  // ✅ Umožňuje collectionGroup dotazy
  allow write: if request.auth != null && request.auth.uid == userId;
}

// CONVERSATIONS - jen pro přihlášené
match /conversations/{convId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && request.auth.uid in request.resource.data.users;
  // ...
}

// SERVICES - legacy fallback
match /services/{serviceId} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

### 3. **Důležité poznámky**

- ✅ **CollectionGroup dotazy** vyžadují `allow read: if true;` pro `users/{userId}/{document=**}`
- ✅ **Pravidla nevyžadují App Check** - žádný `request.appCheck.token`
- ✅ **Conversations vyžadují přihlášení** - `allow read: if request.auth != null`
- ✅ **Všechny kolekce jsou pokryty** - users, conversations, services, test

## 📋 Co teď udělat

### 1. Zkopírovat pravidla do Firebase Console
1. Otevřít: https://console.firebase.google.com/
2. Projekt: **inzerio-inzerce**
3. **Firestore Database** → **Rules**
4. Zkopírovat obsah z `firestore-rules.txt`
5. **KLIKNOUT NA PUBLISH** (důležité!)

### 2. Zkontrolovat App Check Enforcement
1. Firebase Console → **App Check** → **Settings**
2. Zkontrolovat "Enforce App Check" pro **Firestore**
3. Pokud je zapnutý a App Check selhává → může blokovat požadavky

### 3. Otestovat
Po nasazení:
- ✅ Čtení inzerátů bez přihlášení
- ✅ Čtení inzerátů s přihlášením
- ✅ Zápis inzerátů (jen vlastník)
- ✅ Chat konverzace

## 🎯 Očekávaný výsledek

Po nasazení oprav by mělo:
1. ✅ App Check být vypnutý pro produkci (implementováno v kódu)
2. ✅ Firestore pravidla být kompletní a správná
3. ✅ Firestore dotazy fungovat bez permission-denied chyb
4. ✅ Inzeráty se zobrazovat z Firestore databáze
5. ✅ Auth i Firestore fungovat správně

## 📄 Vytvořené dokumenty

1. **FIRESTORE_RULES_ANALYSIS.md** - Detailní analýza kolekcí
2. **FIRESTORE_RULES_CHECKLIST.md** - Checklist pro kontrolu v Console
3. **FIRESTORE_RULES_SUMMARY.md** - Tento soubor
4. **FIREBASE_DIAGNOSTICS.md** - Diagnostika problému
5. **OPRAVA_FIRESTORE.md** - Kompletní oprava

