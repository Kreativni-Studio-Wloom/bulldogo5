# Jak vypnout App Check Enforcement pro Firestore

## Co vidíte
V Firebase Console → App Check → Settings vidíte:
- **Cloud Firestore** s procenty (1% / 99%)
- **Monitoring**

To znamená, že App Check enforcement je **zapnutý** pro Firestore, i když jen částečně (1%).

## Problém
I když je App Check vypnutý v kódu, pokud je enforcement zapnutý v Firebase Console, Firestore může blokovat požadavky bez platného App Check tokenu.

## Řešení: Vypnout App Check Enforcement

### KROK 1: Otevřít App Check Settings
1. Firebase Console → **App Check**
2. Klikněte na **Settings** (nebo **APIs**)

### KROK 2: Najít Cloud Firestore
1. V seznamu najděte **Cloud Firestore**
2. Měli byste vidět něco jako:
   - Cloud Firestore: 1% / 99% (nebo podobné procenta)
   - Status: Monitoring / Enforced

### KROK 3: Vypnout Enforcement
1. Klikněte na **Cloud Firestore** (nebo na tlačítko vedle něj)
2. Měli byste vidět možnosti:
   - **Enforce** (zapnout)
   - **Monitor** (monitorovat, ale neblokovat)
   - **Off** (vypnout)
3. **Vyberte "Off"** nebo **"Monitor"** (doporučeno: Monitor - neblokuje, ale sleduje)
4. Klikněte na **Save** nebo **Update**

### Alternativní řešení: Nastavit na 0%
Pokud vidíte procenta (1% / 99%):
1. Klikněte na Cloud Firestore
2. Nastavte enforcement na **0%** (nebo vypněte úplně)
3. Uložte změny

## Po vypnutí
1. Počkejte 30-60 sekund (změny se mohou projevit s malým zpožděním)
2. Obnovte stránku na webu (Ctrl+F5)
3. Zkontrolujte konzoli - mělo by zmizet `permission-denied`

## Důležité
- **Monitor** = sleduje, ale neblokuje požadavky (doporučeno)
- **Enforce** = blokuje požadavky bez App Check tokenu
- **Off** = úplně vypnutý

Pro teď doporučuji nastavit na **Monitor** nebo **Off**.

