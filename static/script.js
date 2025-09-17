(() => {
	const toggleBtn = document.getElementById('sidebarToggle');
	const sidebar = document.getElementById('sidebar');
	const body = document.body;
	const form = document.getElementById('chatForm');
	const input = document.getElementById('messageInput');
	const messages = document.getElementById('messages');
	const content = document.getElementById('content');
	const gearBtn = document.getElementById('gearBtn');
	const settingsPanel = document.getElementById('settingsPanel');
	const themeToggle = document.getElementById('themeToggle');
	const historyList = document.getElementById('historyList');
    // preview element removed from UI; no reference needed

	function setSidebar(open) {
		sidebar.classList.toggle('open', open);
		body.classList.toggle('sidebar-open', open);
		toggleBtn.setAttribute('aria-expanded', String(open));
		sidebar.setAttribute('aria-hidden', String(!open));
	}

	toggleBtn.addEventListener('click', () => {
		const open = !sidebar.classList.contains('open');
		setSidebar(open);
		// Layout changed, ensure we stay at bottom
		scrollMessagesToBottom();
	});

	gearBtn?.addEventListener('click', (e) => {
		e.stopPropagation();
		const expanded = gearBtn.getAttribute('aria-expanded') === 'true';
		gearBtn.setAttribute('aria-expanded', String(!expanded));
		if (settingsPanel) settingsPanel.classList.toggle('open', !expanded);
		// Rotate gear icon
		if (!expanded) {
			gearBtn.classList.add('rotated');
		} else {
			gearBtn.classList.remove('rotated');
		}
	});

	// Close settings when clicking outside
	document.addEventListener('click', (e) => {
		if (!settingsPanel || !settingsPanel.classList.contains('open')) return;
		const clickInside = settingsPanel.contains(e.target);
		if (!clickInside) {
			gearBtn.setAttribute('aria-expanded', 'false');
			settingsPanel.classList.remove('open');
		}
	});

	// Theme management
	const themes = {
		light: {
			'--bg': '#FFFFFF',
			'--container-bg': '#FFFFFF',
			'--sidebar-bg': '#F3F4F6',
			'--sidebar-text': '#111827',
			'--panel': '#F3F4F6',
			'--text': '#111827',
			'--text-secondary': '#6B7280',
			'--accent-primary': '#2563EB',
			'--accent-primary-hover': '#1D4ED8',
			'--accent-secondary': '#9333EA',
			'--border': '#D1D5DB',
			'--bubble-user-bg': '#2563EB',
			'--bubble-user-text': '#FFFFFF',
			'--bubble-bot-bg': '#E5E7EB',
			'--bubble-bot-text': '#111827',
			'--accent-primary-10': 'rgba(37, 99, 235, 0.1)',
			'--input-bg': '#FFFFFF',
			'--input-border': '#D1D5DB',
			'--sidebar-card-bg': '#FFFFFF',
			'--sidebar-card-bg-hover': '#F3F4F6',
			'--scrollbar-thumb': '#D1D5DB',
			'--scrollbar-thumb-hover': '#BFC6D1',
			'--scrollbar-bg': '#FFFFFF',
			'--sidebar-shadow': '0 2px 8px rgba(0,0,0,0.06)',
			'--settings-bg': '#fff'
		},
		dark: {
			'--bg': '#1F2937',
			'--container-bg': '#1F2937',
			'--sidebar-bg': '#111827',
			'--sidebar-text': '#F9FAFB',
			'--panel': '#1F2937',
			'--text': '#F9FAFB',
			'--text-secondary': '#9CA3AF',
			'--accent-primary': '#3B82F6',
			'--accent-primary-hover': '#2563EB',
			'--accent-secondary': '#8B5CF6',
			'--border': '#4B5563',
			'--bubble-user-bg': '#3B82F6',
			'--bubble-user-text': '#FFFFFF',
			'--bubble-bot-bg': '#374151',
			'--bubble-bot-text': '#F9FAFB',
			'--accent-primary-10': 'rgba(59, 130, 246, 0.1)',
			'--input-bg': '#1F2937',
			'--input-border': '#374151',
			'--sidebar-card-bg': '#111827',
			'--sidebar-card-bg-hover': '#1F2937',
			'--scrollbar-thumb': '#4B5563',
			'--scrollbar-thumb-hover': '#6B7280',
			'--scrollbar-bg': '#1F2937',
			'--settings-bg': '#232b36',
			'--sidebar-shadow': '0 4px 20px rgba(0,0,0,0.1)',
		},
	};

	function applyTheme(name) {
		const vars = themes[name];
		if (!vars) return;
		for (const [k, v] of Object.entries(vars)) document.documentElement.style.setProperty(k, v);
		localStorage.setItem('chatTheme', name);
		// Update theme icon PNG
		if (themeToggle) {
			const img = themeToggle.querySelector('img');
			if (img) img.src = name === 'dark' ? '../static/assests/sun.png' : '../static/assests/moon.png';
		}
		// Update settings gear icon
		const gearBtn = document.getElementById('gearBtn');
		if (gearBtn) {
			const gearImg = gearBtn.querySelector('img');
			if (gearImg) gearImg.src = name === 'dark' ? '../static/assests/settings-white.png' : '../static/assests/settings.png';
		}
		// Update all user avatars and user logo for theme
		const userLogo = document.querySelector('.user-logo img');
		if (userLogo) {
			userLogo.src = name === 'dark' ? '../static/assests/user-white.png' : '../static/assests/user.png';
		}
		document.querySelectorAll('.user-avatar-img').forEach(img => {
			img.src = name === 'dark' ? '../static/assests/user-white.png' : '../static/assests/user.png';
		});
	}

	// Initialize theme from storage or prefers-color-scheme
	const saved = localStorage.getItem('chatTheme');
	if (saved === 'light' || saved === 'dark') applyTheme(saved);
	else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
	else applyTheme('light');

	themeToggle?.addEventListener('click', (e) => {
		e.stopPropagation();
		const current = localStorage.getItem('chatTheme') || 'light';
		applyTheme(current === 'light' ? 'dark' : 'light');
	});

	// Close sidebar with ESC
	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') setSidebar(false);
	});

	// Simple message appender so the page feels alive
	form?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const text = input.value.trim();
		if (!text) return;
		const container = document.createElement('div');
		container.className = 'message right';
		const bubble = document.createElement('div');
		bubble.className = 'bubble';
		bubble.textContent = text;
		// Use theme variables for colors
		bubble.style.background = 'var(--bubble-user-bg)';
		bubble.style.color = 'var(--bubble-user-text)';
		container.appendChild(bubble);
		// Add user logo to the right
		const userLogo = document.createElement('span');
		userLogo.className = 'user-bubble-logo';
		const img = document.createElement('img');
		img.src = '../static/assests/user.png';
		img.alt = 'User';
		img.width = 28;
		img.height = 28;
		userLogo.appendChild(img);
		container.appendChild(userLogo);
		messages.appendChild(container);
		input.value = '';
		scrollMessagesToBottom();

		// Show typing indicator
		const typing = document.createElement('div');
		typing.className = 'message left';
		const typingBubble = document.createElement('div');
		typingBubble.className = 'bubble typing-bubble';
		typingBubble.innerHTML = '<span class="typing-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';
		typing.appendChild(typingBubble);
		messages.appendChild(typing);
		scrollMessagesToBottom();

		// Send to backend and render bot replies gradually
		try {
			const data = await sendToBots(text);
			const replies = (data && data.replies) || [];
			// Preserve server-defined order (sequential relay): do not reorder.

			// Show replies one by one with random delays
			for (const r of replies) {
				// Split bot replies into multiple messages.
				// Accept either a literal backslash+n sequence ("\\n") or real newline characters.
				// Then filter out any empty/whitespace-only lines.
				const botLines = String(r.message)
					.split(/(?:\r?\n|\\n)/)
					.map(l => String(l || '').trim())
					.filter(l => l.length > 0);
				for (const line of botLines) {
					await new Promise(res => setTimeout(res, 300 + Math.random() * 500));
					const left = document.createElement('div');
					left.className = 'message left';
					// Bot logo (emoji) for each bot
					const botLogo = document.createElement('span');
					botLogo.className = 'user-bubble-logo';
					let emoji = '';
					if (r.bot.includes('Empath')) emoji = '💙';
					else if (r.bot.includes('Rationalist')) emoji = '🧠';
					else if (r.bot.includes('Challenger')) emoji = '🔥';
					else if (r.bot.includes('Optimist')) emoji = '✨';
					botLogo.textContent = emoji;
					// Find the last actual message bubble (skip typing indicator if present)
					let lastMessageEl = messages.lastElementChild;
					if (lastMessageEl && lastMessageEl.querySelector && lastMessageEl.querySelector('.typing-bubble')) {
						lastMessageEl = lastMessageEl.previousElementSibling;
					}
					const lastBubble = lastMessageEl ? lastMessageEl.querySelector('.bubble') : null;
					const lastSender = lastBubble ? lastBubble.getAttribute('data-bot') : null;
					// If the previous visible bubble is from the same bot, hide this avatar and mark grouped spacing
					if (lastSender === r.bot) {
						botLogo.classList.add('avatar-hidden');
						left.classList.add('grouped');
					} else {
						// mark explicit separation for clearer visual break
						left.classList.add('separation');
					}
					left.appendChild(botLogo);
					const botBubble = document.createElement('div');
					botBubble.className = 'bubble';
					botBubble.textContent = line;
					botBubble.setAttribute('data-bot', r.bot);
					botBubble.setAttribute('aria-label', r.bot);
					left.appendChild(botBubble);
					// Insert the new message before the typing indicator so typing stays at the bottom
					if (typing && messages.lastElementChild === typing) {
						messages.insertBefore(left, typing);
					} else {
						messages.appendChild(left);
					}
					scrollMessagesToBottom();
				}
			}
		} catch (err) {
			const left = document.createElement('div');
			left.className = 'message left';
			const errBubble = document.createElement('div');
			errBubble.className = 'bubble';
			errBubble.textContent = `System: ${String(err)}`;
			left.appendChild(errBubble);
			messages.appendChild(left);
			scrollMessagesToBottom();
		} finally {
			// Remove typing indicator when all replies are shown or on error
			typing.remove();
		}
	});

	// ---- Logs History ----
	async function loadLogs() {
		if (!historyList) return;
		try {
			const res = await fetch('/logs');
			if (!res.ok) throw new Error('Failed to load logs');
			const data = await res.json();
			historyList.innerHTML = '';

			// Insert a "New Chat" button as the first card in the history list
			const newChat = document.createElement('div');
			newChat.className = 'user-card history-card history-new-chat';
			newChat.setAttribute('role', 'button');
			newChat.setAttribute('tabindex', '0');
			const newAvatar = document.createElement('div');
			newAvatar.className = 'user-avatar';
			newAvatar.textContent = '+';
			const newInfo = document.createElement('div');
			newInfo.className = 'history-info';
			newInfo.style.display = 'flex';
			newInfo.style.flexDirection = 'column';
			newInfo.style.minWidth = '0';
			const newName = document.createElement('div');
			newName.className = 'history-name';
			newName.textContent = 'New Chat';
			const newMeta = document.createElement('div');
			newMeta.className = 'history-meta';
			newMeta.textContent = 'Start a fresh conversation';
			newInfo.appendChild(newName);
			newInfo.appendChild(newMeta);
			newChat.appendChild(newAvatar);
			newChat.appendChild(newInfo);
			newChat.addEventListener('click', () => { window.location.href = '/chat'; });
			newChat.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = '/chat'; } });
			historyList.appendChild(newChat);

			const files = (data && data.files) || [];
			for (const f of files) {
				const item = document.createElement('div');
				item.className = 'user-card history-card';
				item.setAttribute('role', 'button');
				item.setAttribute('tabindex', '0');
				item.dataset.name = f.name;
				const avatar = document.createElement('div');
				avatar.className = 'user-avatar';
				avatar.textContent = '🗂️';
				const info = document.createElement('div');
				info.className = 'history-info';
				info.style.display = 'flex';
				info.style.flexDirection = 'column';
				info.style.minWidth = '0'; // allow ellipsis
				const name = document.createElement('div');
				name.className = 'history-name';
				name.textContent = f.name;
				const meta = document.createElement('div');
				meta.className = 'history-meta';
				meta.textContent = `${f.mtime} • ${(f.size/1024).toFixed(1)} KB`;
				info.appendChild(name);
				info.appendChild(meta);
				item.appendChild(avatar);
				item.appendChild(info);
				item.addEventListener('click', () => { loadLogAsChat(f.name); });
				item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadLogAsChat(f.name); } });
				historyList.appendChild(item);
			}
			// no preview pane anymore
		} catch (e) {
			if (historyList) historyList.innerHTML = `<div class="history-meta">${String(e)}</div>`;
		}
	}

	// Load logs on sidebar open
	const originalSetSidebar = setSidebar;
	setSidebar = function(open) {
		originalSetSidebar(open);
		if (open) loadLogs();
	};

	// Render a selected log into the chat area
	async function loadLogAsChat(name) {
		try {
			const res = await fetch(`/logs/${encodeURIComponent(name)}`);
			if (!res.ok) throw new Error('Failed to fetch log');
			const data = await res.json();
			renderChatFromLog(String((data && data.content) || ''));
		} catch (e) {
			console.error(e);
		}
	}

	function renderChatFromLog(text) {
		if (!messages) return;
		messages.innerHTML = '';
		const lines = String(text).split(/\r?\n/);
		for (let raw of lines) {
			const line = String(raw || '').trim();
			if (!line) continue;
			if (line.startsWith('===')) continue; // header
			if (line.startsWith('[SYS]')) continue; // system note
			// [USER] message
			if (line.startsWith('[USER]')) {
				const msg = line.replace(/^\[USER\]\s*/,'');
				// Split on real newlines OR literal \n sequences
				const parts = String(msg)
					.split(/(?:\r?\n|\\n)/)
					.map(s => String(s || '').trim())
					.filter(s => s.length > 0);
				for (const p of parts) appendUserMessage(p);
				continue;
			}
			// [Bot] message
			const m = line.match(/^\[(Empath|Rationalist|Challenger|Optimist)\]\s*(.*)$/);
			if (m) {
				const base = m[1];
				const content = m[2] || '';
				const parts = String(content)
					.split(/(?:\r?\n|\\n)/)
					.map(s => String(s || '').trim())
					.filter(s => s.length > 0);
				for (const p of parts) appendBotMessage(base, p);
			}
		}
		// Scroll to bottom after render
		scrollMessagesToBottom();
	}

	function appendUserMessage(text) {
		const container = document.createElement('div');
		container.className = 'message right';
		const bubble = document.createElement('div');
		bubble.className = 'bubble';
		bubble.textContent = text;
		bubble.style.background = 'var(--bubble-user-bg)';
		bubble.style.color = 'var(--bubble-user-text)';
		container.appendChild(bubble);
		const userLogo = document.createElement('span');
		userLogo.className = 'user-bubble-logo';
		const img = document.createElement('img');
		img.src = '../static/assests/user.png';
		img.alt = 'User';
		img.width = 28; img.height = 28;
		userLogo.appendChild(img);
		container.appendChild(userLogo);
		messages.appendChild(container);
	}

	function appendBotMessage(base, text) {
		const left = document.createElement('div');
		left.className = 'message left';
		const botLogo = document.createElement('span');
		botLogo.className = 'user-bubble-logo';
		let emoji = '';
		switch (base) {
			case 'Empath': emoji = '💙'; break;
			case 'Rationalist': emoji = '🧠'; break;
			case 'Challenger': emoji = '🔥'; break;
			case 'Optimist': emoji = '✨'; break;
		}
		botLogo.textContent = emoji;

		// Grouping: hide avatar and tighten spacing if same bot as previous bubble
		let lastMessageEl = messages.lastElementChild;
		if (lastMessageEl && lastMessageEl.querySelector && lastMessageEl.querySelector('.typing-bubble')) {
			lastMessageEl = lastMessageEl.previousElementSibling;
		}
		const lastBubble = lastMessageEl ? lastMessageEl.querySelector('.bubble') : null;
		const lastSender = lastBubble ? lastBubble.getAttribute('data-bot') : null;
		const currentLabel = `${base} ${emoji}`.trim();
		if (lastSender === currentLabel) {
			botLogo.classList.add('avatar-hidden');
			left.classList.add('grouped');
		} else {
			left.classList.add('separation');
		}

		left.appendChild(botLogo);
		const botBubble = document.createElement('div');
		botBubble.className = 'bubble';
		botBubble.textContent = text;
		botBubble.setAttribute('data-bot', currentLabel);
		botBubble.setAttribute('aria-label', currentLabel);
		left.appendChild(botBubble);
		messages.appendChild(left);
	}

	async function sendToBots(message) {
		const res = await fetch('/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message })
		});
		if (!res.ok) {
			const t = await res.text();
			throw new Error(t || 'Request failed');
		}
		return res.json();
	}

// Simple message appender so the page feels alive
function scrollMessagesToBottom() {
	if (!content) return;
	// Use rAF to ensure layout is up to date before scrolling
	requestAnimationFrame(() => {
		content.scrollTop = content.scrollHeight;
	});
}

// Always keep chat at bottom on load and when window resizes
window.addEventListener('DOMContentLoaded', scrollMessagesToBottom);
window.addEventListener('resize', scrollMessagesToBottom);


// Observe new messages (from any source) and keep view at bottom
const observer = new MutationObserver(() => {
	scrollMessagesToBottom();
});
if (messages) {
	observer.observe(messages, { childList: true, subtree: true, characterData: true });
}

// --- User Info Modal logic ---
document.addEventListener('DOMContentLoaded', function () {
	// Modal HTML is injected at the end of body if not present
	if (!document.getElementById('userInfoModal')) {
		fetch('/templates/user_info_modal.html').then(r => r.text()).then(html => {
			document.body.insertAdjacentHTML('beforeend', html);
			setupUserModal();
		});
	} else {
		setupUserModal();
	}

		function setupUserModal() {
			const userBtn = document.getElementById('userBtn');
			const modal = document.getElementById('userInfoModal');
			const closeBtn = document.getElementById('closeUserInfoModal');
			const nameInput = document.getElementById('userInfoName');
			const passInput = document.getElementById('userInfoPassword');
			const descInput = document.getElementById('userInfoDesc');
			if (userBtn && modal && closeBtn) {
				userBtn.addEventListener('click', function (e) {
					e.preventDefault();
					// Prefill with localStorage if present (bypass sets these)
					if (nameInput) nameInput.value = localStorage.getItem('user') || '';
					if (passInput) passInput.value = localStorage.getItem('password') || '';
					if (descInput) descInput.value = localStorage.getItem('description') || '';
					modal.style.display = 'flex';
				});
				closeBtn.addEventListener('click', function () {
					modal.style.display = 'none';
				});
				modal.addEventListener('click', function (e) {
					if (e.target === modal) modal.style.display = 'none';
				});
				// Save on submit
				const form = document.getElementById('userInfoForm');
				if (form) {
					form.addEventListener('submit', function(ev) {
						ev.preventDefault();
						if (nameInput) localStorage.setItem('user', nameInput.value);
						if (passInput) localStorage.setItem('password', passInput.value);
						if (descInput) localStorage.setItem('description', descInput.value);
						modal.style.display = 'none';
					});
				}
			}
		}
});

})();

