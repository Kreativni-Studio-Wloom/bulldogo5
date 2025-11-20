# Analýza Firestore Security Rules

## Kolekce používané v aplikaci

### 1. Users a subkolekce
- `users/{userId}` - uživatelský dokument
- `users/{userId}/inzeraty/{adId}` - inzeráty uživatele
- `users/{userId}/profile/profile` - profil uživatele
- `users/{userId}/reviews/{reviewId}` - recenze uživatele
- `users/{userId}/inzeraty/{adId}/reviews/{reviewId}` - recenze k inzerátu

### 2. Conversations (Chat)
- `conversations/{convId}` - konverzace
- `conversations/{convId}/messages/{messageId}` - zprávy v konverzaci

### 3. Legacy kolekce
- `services` - stará kolekce (fallback)
- `test` - testovací kolekce

## CollectionGroup dotazy
- `collectionGroup('inzeraty')` - všechny inzeráty napříč uživateli
- `collectionGroup('profile')` - všechny profily
- `collectionGroup('reviews')` - všechny recenze

## Současná pravidla v firestore-rules.txt

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Problémy s aktuálními pravidly

### 1. ❌ CHYBÍ pravidla pro `conversations`
Chat používá `conversations/{convId}` a `conversations/{convId}/messages`, ale pravidla je nepokrývají.

### 2. ❌ CHYBÍ pravidla pro `services` (legacy)
Fallback kolekce `services` není pokryta pravidly.

### 3. ⚠️ CollectionGroup dotazy mohou mít problémy
Pravidla `match /users/{userId}/{document=**}` by měla pokrýt collectionGroup, ale může být potřeba explicitnější pravidla.

### 4. ⚠️ Možná chybí kontrola App Check
Pokud Firebase Console má App Check enforcement, pravidla by měla být bez App Check kontroly.

## Doporučená oprava pravidel

