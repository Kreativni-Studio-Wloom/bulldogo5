# ✅ CO UDĚLAT NYNÍ - Přesný postup

## 🔴 Hlavní problém
Diagnostika ukázala: **CollectionGroup dotaz vrací `permission-denied`**

To znamená, že buď:
1. ❌ Pravidla nejsou správně nastavená v Firebase Console
2. ❌ App Check enforcement je stále zapnutý (Enforce)
3. ❌ Pravidla nejsou publikovaná

---

## 📋 KROK ZA KROKEM - Co udělat

### ✅ KROK 1: Zkopírovat Firestore pravidla

1. **Otevřete soubor `firestore-rules.txt`** (máte ho otevřený v editoru)
2. **Vyberte VŠECHNO** (Ctrl+A / Cmd+A)
3. **Zkopírujte** (Ctrl+C / Cmd+C)

### ✅ KROK 2: Vložit do Firebase Console

1. Otevřete: **https://console.firebase.google.com/**
2. Přihlaste se
3. Vyberte projekt: **inzerio-inzerce**
4. Vlevo klikněte na: **Firestore Database**
5. Klikněte na záložku: **Rules** (nahoře)
6. Klikněte na: **Edit rules** (nebo klikněte do textového pole)
7. **Vyberte VŠECHNO** v textovém poli (Ctrl+A / Cmd+A)
8. **Vymažte** starý obsah (Delete)
9. **Vložte** nový obsah (Ctrl+V / Cmd+V) - zkopírovaný z firestore-rules.txt

### ✅ KROK 3: Publikovat pravidla ⚠️ DŮLEŽITÉ!

1. **KLIKNĚTE NA TLAČÍTKO "PUBLISH"** (oranžové tlačítko vpravo nahoře)
2. Počkejte na zprávu: **"Rules published successfully"**
3. **BEZ KLIKNUTÍ NA PUBLISH SE NIC NEZMĚNÍ!**

### ✅ KROK 4: Vypnout App Check Enforcement

1. V Firebase Console vlevo klikněte na: **App Check**
2. Klikněte na: **Settings** (nebo **APIs**)
3. Najděte: **Cloud Firestore**
4. **Klikněte na "Cloud Firestore"** (nebo na tlačítko vedle)
5. Měli byste vidět možnosti:
   - **Enforce** (zapnout - blokuje) ← Pokud je toto vybrané, je to PROBLÉM
   - **Monitor** (sleduje, ale neblokuje) ← **VYBERTE TOHLE**
   - **Off** (vypnout) ← nebo tohle
6. **Vyberte "Monitor" nebo "Off"**
7. **Klikněte na "Save" nebo "Update"**

### ✅ KROK 5: Otestovat

1. **Počkejte 30-60 sekund** (změny se projeví s malým zpožděním)
2. **Obnovte stránku** `firebase-diagnostics.html` (Ctrl+F5 / Cmd+Shift+R)
3. **Klikněte na "Spustit diagnostiku"** znovu
4. Měli byste vidět:
   - ✅ `CollectionGroup("inzeraty") dotaz: ÚSPĚŠNÝ`
   - ❌ NEMĚLI byste vidět: `permission-denied`

---

## ⚠️ DŮLEŽITÉ POZNÁMKY

- **Pravidla musí být publikovaná** - bez kliknutí na Publish se nic nezmění!
- **App Check enforcement musí být Monitor nebo Off** - ne Enforce
- **Po změnách může trvat 30-60 sekund**, než se projeví
- **Zkontrolujte obě věci** - pravidla I App Check enforcement

---

## 🆘 Pokud to stále nefunguje

1. Zkontrolujte, že jste klikli na **PUBLISH** v Rules
2. Zkontrolujte, že App Check enforcement je **Monitor nebo Off** (ne Enforce)
3. Počkejte 1-2 minuty a zkuste znovu
4. Zkontrolujte, že pravidla v Console jsou stejná jako v firestore-rules.txt

---

## 📝 Shrnutí

Udělali jste:
- [ ] Zkopírovali pravidla z firestore-rules.txt
- [ ] Vložili je do Firebase Console → Firestore → Rules
- [ ] **Klikli na PUBLISH** (důležité!)
- [ ] Vypnuli App Check enforcement (Monitor nebo Off)
- [ ] Počkali 30-60 sekund
- [ ] Otestovali znovu v diagnostické stránce

