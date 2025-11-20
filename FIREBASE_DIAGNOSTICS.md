# Diagnostika problému: Auth funguje, Firestore ne

## Problém
- ✅ Firebase Auth funguje (přihlášení probíhá úspěšně)
- ❌ Firestore vrací `permission-denied` při čtení inzerátů
- ❌ CollectionGroup dotazy selhávají

## Možné příčiny

### 1. App Check Enforcement v Firebase Console
**Popis**: V Firebase Console může být zapnuté App Check enforcement pro Firestore, které vyžaduje platný App Check token pro všechny požadavky.

**Proč Auth funguje ale Firestore ne**:
- Auth může fungovat bez App Check tokenu
- Firestore s App Check enforcement vyžaduje platný token
- Pokud App Check selhává (ReCAPTCHA chyba), token se negeneruje
- Firestore pak blokuje všechny požadavky

**Řešení**:
- Zkontrolovat Firebase Console → App Check → Settings
- Pokud je enforcement zapnutý pro Firestore, buď:
  a) Vypnout enforcement (ne doporučeno pro produkci)
  b) Opravit App Check (přidat novou doménu do reCAPTCHA)
  c) Úplně vypnout App Check v kódu

### 2. App Check se inicializuje asynchronně a blokuje požadavky
**Popis**: I když App Check selhává, může se stále pokoušet generovat token a blokovat požadavky.

**Řešení**: Úplně vypnout App Check pro produkci, ne jen neinicializovat.

### 3. Firestore Security Rules vyžadují App Check token
**Popis**: Pravidla v Firebase Console mohou vyžadovat App Check token pomocí `request.appCheck.token`.

**Řešení**: Zkontrolovat pravidla v Firebase Console, měla by být `allow read: if true;` bez App Check kontroly.

### 4. CollectionGroup dotazy mají specifická pravidla
**Popis**: CollectionGroup dotazy procházejí napříč kolekcemi a mohou mít jiná pravidla.

**Řešení**: Pravidla musí povolit čtení `users/{userId}/{document=**}` bez autentifikace.

### 5. Pořadí inicializace
**Popis**: App Check se inicializuje asynchronně po Firestore, může blokovat požadavky.

**Řešení**: Zajistit, že App Check se neinicializuje vůbec pro produkci.

### 6. Různé Firebase instance
**Popis**: Auth a Firestore mohou používat různé instance Firebase app.

**Řešení**: Zkontrolovat, že oba používají stejnou instanci z `window.firebaseApp`.

### 7. Firestore SDK automaticky vyžaduje App Check
**Popis**: Pokud je App Check inicializován (i když selhává), Firestore SDK může automaticky vyžadovat token.

**Řešení**: Úplně vypnout App Check, ne jen neinicializovat.

## Diagnostické kroky

1. Zkontrolovat Firebase Console → App Check → Settings
2. Zkontrolovat Firebase Console → Firestore → Rules
3. Zkontrolovat konzoli prohlížeče pro App Check chyby
4. Otestovat bez App Check (nastavit window.DISABLE_APP_CHECK = true)
5. Zkontrolovat, že App Check se vůbec neinicializuje

## Řešení

Nejlepší řešení je úplně vypnout App Check pro produkci, dokud není nová doména přidaná do reCAPTCHA konfigurace.

