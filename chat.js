// Instagram-like chat: Firestore real-time implementace
// - Kolekce: conversations (root) { users: [uid1, uid2], lastMessage, updatedAt, pinnedListing{ id, title, userId } }
// - Subkolekce: conversations/{convId}/messages { senderId, text, images[], createdAt }
// - Levý panel: konverzace (realtime)
// - Pravý panel: zprávy (realtime)
// - Odesílání textu + až 5 obrázků (upload do Storage)
// - Psaní jen pro přihlášené (gating přes Firebase auth)

console.log('💬 IG Chat: init');

/** Stav **/
let igCurrentUser = null;                 // přihlášený uživatel
let igConversations = [];                 // seznam konverzací (realtime)
let igMessagesByConvId = {};              // zprávy podle ID konverzace (realtime)
let igSelectedConvId = null;              // aktivní konverzace
let igSelectedFiles = [];                 // vybrané obrázky pro aktuální zprávu
let igConversationsUnsub = null;          // odpojení posluchače konverzací
let igMessagesUnsub = null;               // odpojení posluchače zpráv
let igPendingDeepLink = null;             // deep-link čekající na přihlášení

/** Pomocné **/
function igFormatTime(date) {
	const d = date instanceof Date ? date : new Date(date);
	return d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
}
function igParams() { return new URLSearchParams(window.location.search); }

/** Inicializace po načtení DOM + auth watcher **/
document.addEventListener('DOMContentLoaded', async () => {
	// Firebase auth (pokud je k dispozici)
	try {
		if (window.firebaseAuth) {
		const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
		onAuthStateChanged(window.firebaseAuth, (user) => {
				igCurrentUser = user || null;
				igUpdateGating();
				if (igCurrentUser) {
					igSubscribeConversations();
					if (igPendingDeepLink) {
						igEnsureConversationFromDeepLink(igPendingDeepLink);
						igPendingDeepLink = null;
					}
				} else {
					igUnsubscribeAll();
				}
			});
		}
	} catch (_) {}

	igInitUI();
	igHandleDeepLink();
	igRenderConversations();
	igUpdateGating();
});

/** UI prvky **/
function igQ(id) { return document.getElementById(id); }

function igInitUI() {
	const backBtn = igQ('igBackBtn');
	if (backBtn) backBtn.addEventListener('click', () => {
		window.history.back?.();
	});
	const openProfile = igQ('igOpenProfile');
	if (openProfile) openProfile.addEventListener('click', () => {
		console.log('Profil – TODO navázat na profil uživatele');
	});

	const input = igQ('igText');
	const send = igQ('igSend');
	const files = igQ('igFiles');
	if (input) {
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				igHandleSend();
			}
		});
	}
	if (send) {
		send.addEventListener('click', (e) => { e.preventDefault(); igHandleSend(); });
	}
	if (files) {
		files.addEventListener('change', () => {
			const selected = Array.from(files.files || []);
			igSelectedFiles = selected.slice(0, 5);
			igRenderFilePreview();
		});
	}
	const search = igQ('igSearch');
	if (search) search.addEventListener('input', igFilterConversations);
}

/** Firestore helpers **/
async function igFS() {
	const mod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
	return mod;
}
async function igStorage() {
	const mod = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
	return mod;
}
function igConvIdFor(a, b) {
	const [x, y] = [a, b].sort();
	return `${x}__${y}`;
}
function igUnsubscribeAll() {
	try { if (igConversationsUnsub) igConversationsUnsub(); } catch(_) {}
	try { if (igMessagesUnsub) igMessagesUnsub(); } catch(_) {}
	igConversationsUnsub = null;
	igMessagesUnsub = null;
}

/** Realtime: seznam konverzací přihlášeného uživatele **/
async function igSubscribeConversations() {
	if (!igCurrentUser || !window.firebaseDb) return;
	const { collection, query, where, onSnapshot } = await igFS();
	const q = query(
		collection(window.firebaseDb, 'conversations'),
		where('users', 'array-contains', igCurrentUser.uid)
	);
	try { if (igConversationsUnsub) igConversationsUnsub(); } catch(_) {}
	igConversationsUnsub = onSnapshot(q, (snap) => {
		const list = [];
		snap.forEach((docSnap) => {
			const d = docSnap.data() || {};
			const time = d.updatedAt?.toDate
				? d.updatedAt.toDate()
				: (d.updatedAt ? new Date(d.updatedAt) : new Date());
			list.push({
				id: docSnap.id,
				title: d.title || d.otherDisplayName || 'Konverzace',
				last: d.lastMessage || '',
				time,
				avatar: ''
			});
		});
		igConversations = list.sort((a, b) => b.time - a.time);
		igRenderConversations();
		if (!igSelectedConvId && igConversations.length > 0) {
			igOpenConversation(igConversations[0].id);
		}
	});
}

/** Deep link: ?userId=...&listingId=...&listingTitle=... **/
function igHandleDeepLink() {
	const p = igParams();
	const userId = p.get('userId');
	const listingTitle = p.get('listingTitle');
	const listingId = p.get('listingId');
	// Vytvořit / vybrat konverzaci pro daného uživatele
	if (userId) {
		const payload = { userId, listingId, listingTitle };
		if (!igCurrentUser) {
			igPendingDeepLink = payload;
		} else {
			igEnsureConversationFromDeepLink(payload);
		}
	}
}

async function igEnsureConversationFromDeepLink({ userId, listingId, listingTitle }) {
	try {
		if (!igCurrentUser || !window.firebaseDb) return;
		const { doc, getDoc, setDoc, serverTimestamp } = await igFS();
		const convId = igConvIdFor(igCurrentUser.uid, userId);
		const convRef = doc(window.firebaseDb, 'conversations', convId);
		const snap = await getDoc(convRef);
		if (!snap.exists()) {
			await setDoc(convRef, {
				id: convId,
				users: [igCurrentUser.uid, userId],
				updatedAt: serverTimestamp(),
				lastMessage: '',
				pinnedListing: listingId ? { id: listingId, title: listingTitle || '', userId } : null
			});
		} else if (listingId && !snap.data()?.pinnedListing) {
			await setDoc(convRef, {
				pinnedListing: { id: listingId, title: listingTitle || '', userId },
				updatedAt: serverTimestamp()
			}, { merge: true });
		}
		igSelectedConvId = convId;
		// Zobrazit předmět (ad title) nad zprávami
		if (listingTitle) {
			const subject = igQ('igSubject');
			const subjectText = igQ('igSubjectText');
			if (subject && subjectText) {
				if (listingId) {
					const a = document.createElement('a');
					a.href = `ad-detail.html?id=${encodeURIComponent(listingId)}&userId=${encodeURIComponent(userId)}`;
					a.textContent = listingTitle;
					a.target = '_blank';
					a.rel = 'noopener';
					subjectText.innerHTML = '';
					subjectText.appendChild(a);
				} else {
					subjectText.textContent = listingTitle;
				}
				subject.style.display = 'inline-flex';
			}
			const input = igQ('igText');
			if (input) {
				if (!input.placeholder) input.placeholder = 'K inzerátu: ' + listingTitle;
				if (!input.value) input.value = 'K inzerátu: ' + listingTitle + ' – ';
			}
		}
		igOpenConversation(convId);
	} catch (e) {
		console.error('igEnsureConversationFromDeepLink error', e);
	}
}

/** Gating – přihlášení povolí psaní **/
function igUpdateGating() {
	const prompt = igQ('igLoginPrompt');
	const inputBar = igQ('igInput');
	const input = igQ('igText');
	const send = igQ('igSend');
	const files = igQ('igFiles');
	const isLogged = !!igCurrentUser;
	if (prompt) prompt.style.display = isLogged ? 'none' : 'flex';
	if (inputBar) inputBar.style.display = isLogged ? 'block' : 'none';
	if (input) input.disabled = !isLogged;
	if (send) send.disabled = !isLogged;
	if (files) files.disabled = !isLogged;
}

/** Render konverzací **/
function igRenderConversations(list = igConversations) {
	const el = igQ('igConversations');
	if (!el) return;
	if (!list || list.length === 0) {
		el.innerHTML = '<div style="padding:12px; color:#6b7280;">Žádné konverzace</div>';
        return;
    }
	el.innerHTML = list.map(c => `
		<div class="ig-conv ${igSelectedConvId === c.id ? 'active' : ''}" data-id="${c.id}">
			<div class="ig-avatar"><i class="fas fa-user"></i></div>
			<div>
				<div class="ig-title">${c.title}</div>
				<div class="ig-last">${c.last || ''}</div>
            </div>
			<div class="ig-time">${igFormatTime(c.time)}</div>
                </div>
	`).join('');
	// click handlers
	Array.from(el.querySelectorAll('.ig-conv')).forEach(item => {
		item.addEventListener('click', () => {
			const id = item.getAttribute('data-id');
			igOpenConversation(id);
            });
        });
}

function igFilterConversations() {
	const q = (igQ('igSearch')?.value || '').toLowerCase();
	const filtered = igConversations.filter(c => (c.title || '').toLowerCase().includes(q) || (c.last || '').toLowerCase().includes(q));
	igRenderConversations(filtered);
}

/** Otevření konverzace **/
async function igOpenConversation(convId) {
	igSelectedConvId = convId;
	igRenderConversations();
	// hlavička
	const conv = igConversations.find(c => c.id === convId);
	igQ('igPeerName').textContent = conv?.title || 'Konverzace';
	igQ('igPeerStatus').textContent = 'Online';
	await igSubscribeMessages(convId);
}

/** Render zpráv **/
function igRenderMessages() {
	const box = igQ('igMessages');
	if (!box) return;
	const msgs = igMessagesByConvId[igSelectedConvId] || [];
	if (msgs.length === 0) {
		box.innerHTML = '<div class="ig-empty">Zatím žádné zprávy – napište první.</div>';
        return;
    }
	box.innerHTML = msgs.map(m => {
		const mine = igCurrentUser ? (m.senderId === igCurrentUser.uid) : false;
		const imgs = (m.images || []).map(img => `<img src="${img.url}" alt="${img.name||''}">`).join('');
        return `
			<div class="ig-row ${mine ? 'mine' : ''}">
				<div class="ig-avatar"><i class="fas fa-user"></i></div>
				<div class="ig-bubble">
					${m.text ? `<div>${m.text}</div>` : ''}
					${imgs ? `<div class=\"ig-images\">${imgs}</div>` : ''}
					<div class="ig-meta">${igFormatTime(m.createdAt)}</div>
            </div>
			</div>`;
    }).join('');
	box.scrollTop = box.scrollHeight;
}

/** Náhled vybraných obrázků **/
function igRenderFilePreview() {
	const wrap = igQ('igFilePreview');
	if (!wrap) return;
	if (igSelectedFiles.length === 0) { wrap.innerHTML=''; return; }
	wrap.innerHTML = igSelectedFiles.map((f, i) => {
		const url = URL.createObjectURL(f);
		return `<img src="${url}" alt="náhled ${i+1}">`;
	}).join('');
}

/** Odeslání zprávy **/
async function igHandleSend() {
	try {
		if (!igCurrentUser) return; // gating
		if (!igSelectedConvId) return;
		const input = igQ('igText');
		const text = (input?.value || '').trim();
		if (!text && igSelectedFiles.length === 0) return;
		const { doc, collection, addDoc, setDoc, serverTimestamp, updateDoc } = await igFS();

		// Upload obrázků (pokud jsou)
		let uploaded = [];
		if (igSelectedFiles.length > 0) {
			try {
				const { getStorage, ref, uploadBytes, getDownloadURL } = await igStorage();
				const storage = getStorage();
				const ts = Date.now();
				const uploads = igSelectedFiles.map(async (f, idx) => {
					const r = ref(storage, `chats/${igSelectedConvId}/${ts}_${idx}_${f.name}`);
					const snap = await uploadBytes(r, f);
					const url = await getDownloadURL(snap.ref);
					return { name: f.name, url };
				});
				uploaded = await Promise.all(uploads);
			} catch (e) {
				console.warn('Upload obrázků selhal, posílám bez obrázků', e);
				uploaded = [];
			}
		}

		// Zapsat zprávu
		const msgsRef = collection(window.firebaseDb, 'conversations', igSelectedConvId, 'messages');
		await addDoc(msgsRef, {
			senderId: igCurrentUser.uid,
			text: text || '',
			images: uploaded,
			createdAt: serverTimestamp()
		});

		// Aktualizovat konverzaci (lastMessage/updatedAt)
		await updateDoc(doc(window.firebaseDb, 'conversations', igSelectedConvId), {
			lastMessage: text || (uploaded.length ? '📷 Foto' : ''),
			updatedAt: serverTimestamp()
		}).catch(async () => {
			// pokud by konverzace neexistovala, vytvořit
			await setDoc(doc(window.firebaseDb, 'conversations', igSelectedConvId), {
				id: igSelectedConvId,
				users: [igCurrentUser.uid],
				lastMessage: text || (uploaded.length ? '📷 Foto' : ''),
				updatedAt: serverTimestamp()
			}, { merge: true });
		});

		// Vyčistit UI
		if (input) input.value = '';
		igSelectedFiles = [];
		igRenderFilePreview();
	} catch (e) {
		console.error('igHandleSend error', e);
	}
}

/** Realtime zprávy pro konverzaci **/
async function igSubscribeMessages(convId) {
	if (!window.firebaseDb || !convId) return;
	const { collection, query, orderBy, onSnapshot } = await igFS();
	try { if (igMessagesUnsub) igMessagesUnsub(); } catch(_) {}
	igMessagesUnsub = onSnapshot(
		query(collection(window.firebaseDb, 'conversations', convId, 'messages'), orderBy('createdAt', 'asc')),
		(snap) => {
			const msgs = [];
			snap.forEach((d) => {
				const m = d.data() || {};
				msgs.push({
					id: d.id,
					senderId: m.senderId,
					text: m.text || '',
					images: m.images || [],
					createdAt: m.createdAt?.toDate ? m.createdAt.toDate() : (m.createdAt ? new Date(m.createdAt) : new Date())
				});
			});
			igMessagesByConvId[convId] = msgs;
			igRenderMessages();
		}
	);
}

// Export / integrace: voláno z inzerátu (přesměruje na chat s parametry)
window.contactSeller = function(listingId, sellerUid, listingTitle) {
	const url = new URL(window.location.origin + '/chat.html');
	url.searchParams.set('userId', sellerUid || '');
	if (listingId) url.searchParams.set('listingId', listingId);
	if (listingTitle) url.searchParams.set('listingTitle', listingTitle);
	window.location.href = url.toString();
};

// Export pro případné využití
window.igOpenConversation = igOpenConversation;

// Konec – chat napojen na Firestore, realtime posluchače konverzací i zpráv