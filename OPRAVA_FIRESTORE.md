# Oprava problému: Auth funguje, Firestore ne

## Problém
- ✅ Firebase Auth funguje (přihlášení probíhá úspěšně)
- ❌ Firestore vrací `permission-denied` při čtení inzerátů
- ❌ CollectionGroup dotazy selhávají s chybou "Missing or insufficient permissions"

## Všechny možné příčiny

### 1. **App Check Enforcement v Firebase Console** ⭐ NEJPRAVDĚPODOBNĚJŠÍ
**Popis**: V Firebase Console může být zapnuté App Check enforcement pro Firestore.

**Proč Auth funguje ale Firestore ne**:
- Firebase Auth může fungovat bez App Check tokenu
- Firestore s App Check enforcement VYŽADUJE platný App Check token
- Pokud App Check selhává (ReCAPTCHA chyba na nové doméně), token se negeneruje
- Firestore pak BLOKUJE všechny požadavky s `permission-denied`

**Jak zkontrolovat**:
1. Firebase Console → App Check → Settings
2. Zkontrolovat, jestli je "Enforce App Check" zapnutý pro Firestore

**Řešení**:
- ✅ **IMPLEMENTOVÁNO**: App Check je automaticky vypnutý pro produkci
- Alternativně: Přidat novou doménu do reCAPTCHA konfigurace v Google Cloud Console

### 2. **App Check se inicializuje a selhává**
**Popis**: App Check se inicializuje asynchronně, selhává kvůli ReCAPTCHA chybě, ale stále blokuje Firestore požadavky.

**Řešení**: ✅ **IMPLEMENTOVÁNO** - App Check se neinicializuje vůbec pro produkci

### 3. **Firestore Security Rules vyžadují App Check token**
**Popis**: Pravidla v Firebase Console mohou vyžadovat App Check token pomocí `request.appCheck.token`.

**Jak zkontrolovat**: Firebase Console → Firestore → Rules
**Správná pravidla**: `allow read: if true;` (bez App Check kontroly)

**Řešení**: ✅ Pravidla v `firestore-rules.txt` jsou správná

### 4. **CollectionGroup dotazy mají specifická pravidla**
**Popis**: CollectionGroup dotazy procházejí napříč kolekcemi a potřebují specifická pravidla.

**Správná pravidla**:
```
match /users/{userId}/{document=**} {
  allow read: if true;
}
```

**Řešení**: ✅ Pravidla v `firestore-rules.txt` jsou správná

### 5. **Pořadí inicializace**
**Popis**: App Check se inicializuje asynchronně po Firestore, může blokovat požadavky.

**Řešení**: ✅ **IMPLEMENTOVÁNO** - App Check se neinicializuje vůbec pro produkci

### 6. **Různé Firebase instance**
**Popis**: Auth a Firestore používají různé instance Firebase app.

**Řešení**: ✅ Oba používají stejnou instanci z `window.firebaseApp`

### 7. **Firestore SDK automaticky vyžaduje App Check**
**Popis**: Pokud je App Check inicializován (i když selhává), Firestore SDK může automaticky vyžadovat token.

**Řešení**: ✅ **IMPLEMENTOVÁNO** - App Check se neinicializuje vůbec pro produkci

## Implementované opravy

### 1. **firebase-init.js**
- ✅ Automatické vypnutí App Check pro produkci (není localhost)
- ✅ App Check se inicializuje POUZE pro localhost nebo když je explicitně zapnutý
- ✅ Přidána detailní diagnostika a logování
- ✅ Varování pokud je App Check inicializován v produkci

### 2. **services.js**
- ✅ Přidána detailní diagnostika při permission-denied chybách
- ✅ Lepší error handling a zprávy pro uživatele
- ✅ Logování App Check stavu při dotazech

### 3. **index.html**
- ✅ Přidán inline script pro automatické vypnutí App Check před načtením firebase-init.js

### 4. **FIREBASE_DIAGNOSTICS.md**
- ✅ Vytvořen dokument s detailní diagnostikou problému

## Co teď udělat

1. **Nahrát opravené soubory na novou doménu**:
   - `firebase-init.js`
   - `services.js`
   - `index.html`
   - `services.html`

2. **Obnovit stránku** (Ctrl+F5 nebo Cmd+Shift+R)

3. **Zkontrolovat konzoli** - měli byste vidět:
   - `🔧 App Check automaticky vypnutý pro produkci: [hostname]`
   - `ℹ️ App Check je VYPNUTÝ pro produkci`
   - `✅ Test dotaz úspěšný! Počet inzerátů: X`

4. **Pokud problém přetrvá**:
   - Zkontrolovat Firebase Console → App Check → Settings
   - Zkontrolovat Firebase Console → Firestore → Rules
   - Zkontrolovat, že pravidla jsou publikovaná

## Očekávaný výsledek

Po nasazení oprav by mělo:
- ✅ App Check být vypnutý pro produkci
- ✅ Firestore dotazy fungovat bez permission-denied chyb
- ✅ Inzeráty se zobrazovat z Firestore databáze
- ✅ Auth i Firestore fungovat správně

