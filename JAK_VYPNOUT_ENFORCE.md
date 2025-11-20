# Jak vypnout "Enforce" v App Check

## Co vidíte
Když kliknete na Cloud Firestore v App Check, vidíte **"Enforce"** - to znamená, že enforcement je **ZAPNUTÝ** a blokuje požadavky.

## Co udělat

### KROK 1: Kliknout na "Enforce"
1. V App Check → Settings → Cloud Firestore
2. Klikněte na tlačítko nebo přepínač vedle **"Enforce"**

### KROK 2: Vybrat "Monitor" nebo "Off"
Měli byste vidět možnosti:
- **Enforce** (zapnout - blokuje) ← TOTO JE TEĎ ZAPNUTÉ
- **Monitor** (sleduje, ale neblokuje) ← **VYBERTE TOHLE**
- **Off** (vypnout) ← nebo tohle

**Vyberte "Monitor"** (doporučeno) nebo **"Off"**

### KROK 3: Uložit
1. Klikněte na **"Save"** nebo **"Update"**
2. Počkejte na potvrzení

### KROK 4: Otestovat
1. Počkejte 30-60 sekund
2. Obnovte stránku (Ctrl+F5)
3. Zkontrolujte konzoli - mělo by zmizet `permission-denied`

## Důležité
- **Enforce** = blokuje požadavky bez App Check tokenu ❌
- **Monitor** = sleduje, ale neblokuje ✅ (doporučeno)
- **Off** = úplně vypnutý ✅

Po změně na Monitor/Off by mělo vše fungovat!

