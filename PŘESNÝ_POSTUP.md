# 📋 PŘESNÝ POSTUP - Co udělat TEĎ

## ⚠️ DŮLEŽITÉ: Musíte udělat 2 věci v Firebase Console

### 1️⃣ OPRAVIT FIRESTORE PRAVIDLA

#### Krok 1: Otevřít Rules
1. Firebase Console → **Firestore Database** → **Rules**

#### Krok 2: Zkopírovat pravidla
1. Otevřete soubor **firestore-rules.txt** (máte ho otevřený)
2. **Vyberte VŠECHNO** (Ctrl+A / Cmd+A)
3. **Zkopírujte** (Ctrl+C / Cmd+C)

#### Krok 3: Vložit do Console
1. V Firebase Console v textovém poli Rules
2. **Vyberte VŠECHNO** (Ctrl+A / Cmd+A)
3. **Vymažte** (Delete)
4. **Vložte** nová pravidla (Ctrl+V / Cmd+V)

#### Krok 4: Publikovat ⚠️ DŮLEŽITÉ!
1. **KLIKNĚTE NA "PUBLISH"** (oranžové tlačítko vpravo nahoře)
2. Počkejte na "Rules published successfully"

---

### 2️⃣ VYPNOUT APP CHECK ENFORCEMENT

#### Krok 1: Otevřít App Check
1. Firebase Console → **App Check** → **Settings** (nebo **APIs**)

#### Krok 2: Najít Cloud Firestore
1. Najděte **Cloud Firestore** v seznamu
2. Měli byste vidět: "1% 99% Monitoring" nebo podobně

#### Krok 3: Kliknout na Cloud Firestore
1. **Klikněte na "Cloud Firestore"** (nebo na tlačítko vedle)

#### Krok 4: Vypnout enforcement
1. Měli byste vidět možnosti:
   - **Enforce** (zapnout)
   - **Monitor** (sledovat, neblokovat) ← **VYBERTE TOHLE**
   - **Off** (vypnout) ← nebo tohle
2. **Vyberte "Monitor" nebo "Off"**
3. **Klikněte na "Save" nebo "Update"**

---

### 3️⃣ OTESTOVAT

1. Počkejte **30-60 sekund** (změny se projeví s malým zpožděním)
2. Obnovte stránku (Ctrl+F5 / Cmd+Shift+R)
3. Zkontrolujte konzoli

**Měli byste vidět:**
- ✅ `✅ Test dotaz úspěšný! Počet inzerátů: X`
- ❌ NEMĚLI byste vidět: `permission-denied`

---

## 🆘 Pokud to stále nefunguje

1. **Zkontrolujte, že jste klikli na PUBLISH** v Rules
2. **Zkontrolujte, že App Check enforcement je Monitor/Off** (ne Enforce)
3. Počkejte 1-2 minuty a zkuste znovu
4. Zkontrolujte, že pravidla v Console jsou stejná jako v firestore-rules.txt

