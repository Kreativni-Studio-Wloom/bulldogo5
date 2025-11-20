// Centralizovaná inicializace Firebase pro celý frontend
// Načítá oficiální SDK moduly z gstatic a publikuje app/auth/db na window

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

    // App Check (zapnout jen když máme reCAPTCHA v3 SITE KEY nebo jsme na localhost)
    // DŮLEŽITÉ: App Check je volitelný - pokud selže, neblokuje přístup k Firestore
    // Pro produkci: App Check je VYPNUTÝ, dokud není nová doména přidaná do reCAPTCHA
    // App Check se načítá dynamicky jen když je potřeba, aby se předešlo chybám
    window.firebaseAppCheck = null; // Výchozí hodnota - App Check vypnutý
    
    // Inicializace App Check asynchronně (aby se neblokoval hlavní kód)
    (async () => {
        try {
            const isLocal = typeof window !== 'undefined' && window.location && (
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1'
            );
            
            // Zkontrolovat, jestli má být App Check vypnutý (např. pro nové domény, které nejsou v reCAPTCHA)
            const appCheckDisabled = typeof window !== 'undefined' && window.DISABLE_APP_CHECK === true;
            
            // Pro produkci: App Check je VYPNUTÝ, dokud není explicitně zapnutý
            const appCheckEnabled = typeof window !== 'undefined' && window.ENABLE_APP_CHECK === true;
            
            if (appCheckDisabled) {
                console.log('ℹ️ App Check je explicitně vypnutý (window.DISABLE_APP_CHECK = true)');
            } else if (isLocal) {
                // Pro localhost načíst a inicializovat App Check s debug tokenem
                try {
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
                }
            } else if (appCheckEnabled) {
                // Pro produkci: App Check se inicializuje jen když je explicitně zapnutý
                try {
                    const { initializeAppCheck, ReCaptchaV3Provider } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js');
                    // Site key lze přepsat přes window.FIREBASE_RECAPTCHA_V3_SITE_KEY; jinak použijeme výchozí
                    const siteKey = (typeof window !== 'undefined' && window.FIREBASE_RECAPTCHA_V3_SITE_KEY)
                        ? window.FIREBASE_RECAPTCHA_V3_SITE_KEY
                        : '6LdqPRIsAAAAAH_lRkJFQSQbbAP6dhYyxjTdsKsd';
                    
                    const appCheck = initializeAppCheck(app, {
                        provider: new ReCaptchaV3Provider(siteKey),
                        isTokenAutoRefreshEnabled: true,
                    });
                    window.firebaseAppCheck = appCheck;
                    console.log('✅ Firebase App Check inicializován (produkce)');
                } catch (appCheckError) {
                    console.warn('⚠️ App Check inicializace selhala v produkci:', appCheckError.message);
                    console.warn('💡 Přidejte novou doménu do reCAPTCHA konfigurace v Google Cloud Console');
                }
            } else {
                // Pro produkci: Zkusit inicializovat App Check i když se objevují chyby
                // Možná se token přesto vygeneruje a požadavky budou fungovat
                try {
                    const { initializeAppCheck, ReCaptchaV3Provider } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js');
                    const siteKey = '6LdqPRIsAAAAAH_lRkJFQSQbbAP6dhYyxjTdsKsd';
                    
                    const appCheck = initializeAppCheck(app, {
                        provider: new ReCaptchaV3Provider(siteKey),
                        isTokenAutoRefreshEnabled: true,
                    });
                    window.firebaseAppCheck = appCheck;
                    console.log('✅ Firebase App Check inicializován (produkce - i když se mohou objevovat ReCAPTCHA chyby)');
                } catch (appCheckError) {
                    console.warn('⚠️ App Check inicializace selhala v produkci:', appCheckError.message);
                    console.warn('💡 Zkusím pokračovat bez App Check - pokud se objevují permission-denied chyby,');
                    console.warn('💡 přidejte novou doménu do reCAPTCHA konfigurace v Google Cloud Console');
                    window.firebaseAppCheck = null;
                }
            }
        } catch (err) {
            console.warn('⚠️ App Check není k dispozici nebo selhala inicializace:', err);
            console.log('ℹ️ Aplikace bude fungovat bez App Check - Firestore přístup není blokován');
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

    console.log('✅ Firebase inicializován a připraven:', { 
        app: !!app, 
        auth: !!auth, 
        db: !!db,
        ready: !!window.firebaseReady
    });
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

