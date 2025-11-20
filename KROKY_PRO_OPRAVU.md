# KROKY PRO OPRAVU - Firestore permission-denied

## ✅ Co už funguje
- App Check je vypnutý ✅
- Firebase inicializace proběhla úspěšně ✅
- Auth funguje ✅

## ❌ Co stále nefunguje
- Firestore vrací `permission-denied` při collectionGroup dotazech

## 🔍 Příčina
Pravidla v Firebase Console jsou pravděpodobně:
1. **Nepublikovaná** - změny nebyly publikovány
2. **Jiná než v souboru** - v Console jsou stará/špatná pravidla
3. **App Check enforcement zapnutý** - i když App Check není v kódu, enforcement v Console může blokovat

## 📋 KROKY PRO OPRAVU

### KROK 1: Zkontrolovat aktuální pravidla v Firebase Console
1. Otevřít: https://console.firebase.google.com/
2. Projekt: **inzerio-inzerce**
3. **Firestore Database** → **Rules**
4. Zkontrolovat, jaká pravidla jsou tam aktuálně

### KROK 2: Zkopírovat nová pravidla
1. Otevřít soubor `firestore-rules.txt` v projektu
2. Zkopírovat CELÝ obsah (všechny řádky)
3. Vložit do Firebase Console → Firestore → Rules → Edit

### KROK 3: Publikovat pravidla
1. **KLIKNOUT NA "PUBLISH"** (důležité!)
2. Počkat na potvrzení publikování

### KROK 4: Zkontrolovat App Check Enforcement
1. Firebase Console → **App Check** → **Settings**
2. Zkontrolovat sekci "Enforce App Check"
3. Pokud je zapnutý pro **Firestore** → **VYPNOUT** (nebo opravit App Check)

### KROK 5: Otestovat
1. Obnovit stránku (Ctrl+F5)
2. Zkontrolovat konzoli - mělo by zmizet `permission-denied`
3. Inzeráty by se měly zobrazit

## ⚠️ DŮLEŽITÉ
- **Pravidla musí být publikovaná** - bez kliknutí na Publish se změny neprojeví!
- **App Check enforcement** může blokovat i když App Check není v kódu
- **CollectionGroup dotazy** vyžadují `allow read: if true;` pro `users/{userId}/{document=**}`

