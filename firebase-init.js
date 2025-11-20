// Centralizovaná inicializace Firebase pro celý frontend
// Načítá oficiální SDK moduly z gstatic a publikuje app/auth/db na window

// ============================================================================
// AUTOMATICKÉ VYPNUTÍ APP CHECK PRO PRODUKCI
// ============================================================================
// Důvod: App Check může blokovat Firestore požadavky, pokud selhává
// Problém: Auth funguje, ale Firestore vrací permission-denied
// Řešení: Automaticky vypnout App Check pro produkci (není localhost)
// ============================================================================
if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    // Pokud není localhost a App Check není explicitně zapnutý, vypnout ho
    if (!isLocal && typeof window.ENABLE_APP_CHECK === 'undefined' && typeof window.DISABLE_APP_CHECK === 'undefined') {
        window.DISABLE_APP_CHECK = true;
        console.log('🔧 App Check automaticky vypnutý pro produkci:', hostname);
        console.log('💡 Důvod: Předejít permission-denied chybám při Firestore dotazech');
    }
}

console.log('🔥 firebase-init.js: Začínám načítat Firebase...');

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, initializeFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';
// App Check se načítá dynamicky jen když je potřeba (localhost nebo explicitně zapnutý)

console.log('✅ Firebase moduly načteny');

// Firebase konfigurace (sjednocená)
const firebaseConfig = {
    apiKey: "AIzaSyA1FEmsY458LLKQLGcUaOVXsYr3Ii55QeQ",
    authDomain: "inzerio-inzerce.firebaseapp.com",
    projectId: "inzerio-inzerce",
    storageBucket: "inzerio-inzerce.appspot.com",
    messagingSenderId: "262039290071",
    appId: "1:262039290071:web:30af0eb1c65cd75e307092",
    measurementId: "G-7VD0ZE08M3"
};

try {
    // Zajistit, že inicializujeme jen jednou na stránce
    let app;
    if (getApps().length) {
        app = getApps()[0];
        console.log('✅ Použil jsem existující Firebase app');
    } else {
        app = initializeApp(firebaseConfig);
        console.log('✅ Vytvořil jsem novou Firebase app');
    }

    const auth = getAuth(app);
    console.log('✅ Firebase Auth inicializován');

    let db;
    try {
        // Stabilnější v prohlížečích a lokálním vývoji
        db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true, useFetchStreams: false });
        console.log('✅ Firebase Firestore inicializován s experimentalAutoDetectLongPolling');
    } catch (err) {
        console.warn('⚠️ Experimental Firestore inicializace selhala, používám standardní:', err);
        db = getFirestore(app);
        console.log('✅ Firebase Firestore inicializován standardně');
    }

    // ============================================================================
    // APP CHECK KONFIGURACE
    // ============================================================================
    // DŮLEŽITÉ: App Check může blokovat Firestore požadavky, pokud selhává
    // Problém: Auth funguje, ale Firestore vrací permission-denied
    // Příčina: App Check enforcement v Firebase Console nebo selhávající App Check token
    // 
    // ŘEŠENÍ: Úplně vypnout App Check pro produkci, dokud není nová doména v reCAPTCHA
    // ============================================================================
    
    window.firebaseAppCheck = null; // Výchozí hodnota - App Check vypnutý
    
    // Detekce prostředí
    const isLocal = typeof window !== 'undefined' && window.location && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    );
    
    const appCheckDisabled = typeof window !== 'undefined' && window.DISABLE_APP_CHECK === true;
    const appCheckEnabled = typeof window !== 'undefined' && window.ENABLE_APP_CHECK === true;
    
    console.log('🔍 App Check konfigurace:', {
        isLocal,
        appCheckDisabled,
        appCheckEnabled,
        hostname: typeof window !== 'undefined' && window.location ? window.location.hostname : 'unknown'
    });
    
    // App Check inicializace - POUZE pro localhost nebo když je explicitně zapnutý
    // PRO PRODUKCI: App Check je VYPNUTÝ, aby se předešlo permission-denied chybám
    (async () => {
        try {
            // 1. Pokud je explicitně vypnutý, neinicializovat
            if (appCheckDisabled) {
                console.log('ℹ️ App Check je explicitně vypnutý (window.DISABLE_APP_CHECK = true)');
                window.firebaseAppCheck = null;
                return;
            }
            
            // 2. Pro localhost: vždy inicializovat App Check s debug tokenem
            if (isLocal) {
                try {
                    console.log('🔧 Inicializuji App Check pro localhost...');
                    const { initializeAppCheck, ReCaptchaV3Provider } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js');
                    // eslint-disable-next-line no-undef
                    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
                    const appCheck = initializeAppCheck(app, {
                        provider: new ReCaptchaV3Provider('6LdqPRIsAAAAAH_lRkJFQSQbbAP6dhYyxjTdsKsd'),
                        isTokenAutoRefreshEnabled: true,
                    });
                    window.firebaseAppCheck = appCheck;
                    console.log('✅ Firebase App Check inicializován (localhost s debug tokenem)');
                } catch (appCheckError) {
                    console.warn('⚠️ App Check inicializace selhala na localhost:', appCheckError.message);
                    window.firebaseAppCheck = null;
                }
                return;
            }
            
            // 3. Pro produkci: inicializovat POUZE když je explicitně zapnutý
            if (appCheckEnabled) {
                try {
                    console.log('🔧 Inicializuji App Check pro produkci (explicitně zapnutý)...');
                    const { initializeAppCheck, ReCaptchaV3Provider } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js');
                    const siteKey = (typeof window !== 'undefined' && window.FIREBASE_RECAPTCHA_V3_SITE_KEY)
                        ? window.FIREBASE_RECAPTCHA_V3_SITE_KEY
                        : '6LdqPRIsAAAAAH_lRkJFQSQbbAP6dhYyxjTdsKsd';
                    
                    const appCheck = initializeAppCheck(app, {
                        provider: new ReCaptchaV3Provider(siteKey),
                        isTokenAutoRefreshEnabled: true,
                    });
                    window.firebaseAppCheck = appCheck;
                    console.log('✅ Firebase App Check inicializován (produkce - explicitně zapnutý)');
                } catch (appCheckError) {
                    console.warn('⚠️ App Check inicializace selhala v produkci:', appCheckError.message);
                    console.warn('💡 Přidejte novou doménu do reCAPTCHA konfigurace v Google Cloud Console');
                    window.firebaseAppCheck = null;
                }
                return;
            }
            
            // 4. Pro produkci: App Check je VYPNUTÝ (výchozí stav)
            // DŮLEŽITÉ: Neinicializovat App Check, aby se předešlo:
            // - ReCAPTCHA chybám
            // - permission-denied chybám při Firestore dotazech
            // - Blokování požadavků kvůli selhávajícímu App Check tokenu
            console.log('ℹ️ App Check je VYPNUTÝ pro produkci (není localhost, není explicitně zapnutý)');
            console.log('💡 Důvod: Předejít permission-denied chybám při Firestore dotazech');
            console.log('💡 Pro zapnutí App Check: nastavte window.ENABLE_APP_CHECK = true před načtením firebase-init.js');
            console.log('💡 Nebo přidejte novou doménu do reCAPTCHA konfigurace v Google Cloud Console');
            window.firebaseAppCheck = null;
            
        } catch (err) {
            console.warn('⚠️ Chyba při kontrole App Check:', err);
            window.firebaseAppCheck = null;
        }
    })();

    // Analytics (bezpečně; v některých prostředích nemusí být k dispozici)
    let analytics;
    try { 
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics inicializován');
    } catch (err) {
        console.warn('⚠️ Analytics není k dispozici:', err);
    }

    // Publikovat globálně pro stávající kód
    window.firebaseApp = app;
    window.firebaseAuth = auth;
    window.firebaseDb = db;
    if (analytics) window.firebaseAnalytics = analytics;

    // Signalizovat, že Firebase je připraven
    window.firebaseReady = true;

    // Vyslat event, že Firebase je připraven (pro event-driven přístup)
    if (typeof window.dispatchEvent !== 'undefined') {
        window.dispatchEvent(new Event('firebaseReady'));
        console.log('📢 Event firebaseReady vyslán');
    }

    // Diagnostika: Zkontrolovat App Check stav
    console.log('🔍 Firebase inicializace dokončena:', {
        app: !!app,
        auth: !!auth,
        db: !!db,
        appCheck: window.firebaseAppCheck ? 'INICIALIZOVÁN' : 'VYPNUTÝ',
        hostname: typeof window !== 'undefined' && window.location ? window.location.hostname : 'unknown',
        ready: !!window.firebaseReady
    });
    
    // Varování pokud je App Check inicializován v produkci (může způsobit problémy)
    if (window.firebaseAppCheck && typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        const isProd = hostname !== 'localhost' && hostname !== '127.0.0.1';
        if (isProd) {
            console.warn('⚠️ VAROVÁNÍ: App Check je inicializován v produkci');
            console.warn('⚠️ Pokud vidíte permission-denied chyby, zkuste vypnout App Check:');
            console.warn('⚠️ Nastavte window.DISABLE_APP_CHECK = true před načtením firebase-init.js');
        }
    }
    
    console.log('✅ Firebase inicializován a připraven');
} catch (error) {
    console.error('❌ Kritická chyba při inicializaci Firebase:', error);
    console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
    });
    window.firebaseError = error;
    window.firebaseReady = false;
    
    // Vyslat error event
    if (typeof window.dispatchEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('firebaseError', { detail: error }));
    }
}

