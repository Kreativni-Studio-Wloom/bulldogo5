# 📋 PŘESNÉ INSTRUKCE - Krok za krokem

## KROK 1: Otevřít Firebase Console
1. Otevřete prohlížeč
2. Jděte na: **https://console.firebase.google.com/**
3. Přihlaste se (pokud nejste)
4. Vyberte projekt: **inzerio-inzerce**

## KROK 2: Zkopírovat Firestore pravidla
1. V projektu otevřete soubor **firestore-rules.txt** (máte ho otevřený v editoru)
2. **Vyberte VŠECHNO** (Ctrl+A nebo Cmd+A)
3. **Zkopírujte** (Ctrl+C nebo Cmd+C)

## KROK 3: Vložit pravidla do Firebase Console
1. V Firebase Console v levém menu klikněte na **Firestore Database**
2. Klikněte na záložku **Rules** (nahoře)
3. Klikněte na tlačítko **Edit rules** (nebo jen klikněte do textového pole)
4. **Vyberte VŠECHNO** v textovém poli (Ctrl+A nebo Cmd+A)
5. **Vymažte** starý obsah (Delete nebo Backspace)
6. **Vložte** nový obsah (Ctrl+V nebo Cmd+V) - obsah z firestore-rules.txt
7. Zkontrolujte, že se pravidla zobrazují správně

## KROK 4: Publikovat pravidla ⚠️ DŮLEŽITÉ!
1. Klikněte na tlačítko **Publish** (vpravo nahoře, oranžové tlačítko)
2. Počkejte na potvrzení "Rules published successfully"
3. **BEZ KLIKNUTÍ NA PUBLISH SE ZMĚNY NEPROJEVÍ!**

## KROK 5: Zkontrolovat App Check Enforcement
1. V Firebase Console v levém menu klikněte na **App Check**
2. Klikněte na **Settings** (nebo **APIs**)
3. Najděte sekci **Enforce App Check** nebo **Protected APIs**
4. Zkontrolujte, jestli je zapnutý **Cloud Firestore**
5. **Pokud je zapnutý**:
   - Klikněte na něj
   - Vypněte ho (tlačítko OFF nebo checkbox)
   - Uložte změny
6. **Pokud není zapnutý** → OK, pokračujte dál

## KROK 6: Otestovat
1. Vraťte se na web: **bulldogo5.vercel.app**
2. Obnovte stránku (Ctrl+F5 nebo Cmd+Shift+R)
3. Otevřete konzoli prohlížeče (F12)
4. Měli byste vidět:
   - ✅ `✅ Test dotaz úspěšný! Počet inzerátů: X`
   - ❌ NEMĚLI byste vidět: `permission-denied`

## ⚠️ DŮLEŽITÉ POZNÁMKY
- **Pravidla musí být publikovaná** - bez kliknutí na Publish se nic nezmění!
- **App Check enforcement** může blokovat i když App Check není v kódu
- Po změnách může trvat pár sekund, než se projeví

## 🆘 Pokud to stále nefunguje
1. Zkontrolujte, že jste klikli na **Publish** v Rules
2. Zkontrolujte, že App Check enforcement je **vypnutý** pro Firestore
3. Počkejte 30 sekund a zkuste znovu
4. Zkontrolujte konzoli prohlížeče pro další chyby

