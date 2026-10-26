/* static/js/chat.js */
document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    const emptyState = document.getElementById('chat-empty');
    const chatWrapper = document.getElementById('chat-wrapper');
    const attachBtn = document.getElementById('attach-btn');
    const fileInput = document.getElementById('chat-file-input');
    const micBtn = document.getElementById('mic-btn');
    const sendBtn = document.getElementById('send-btn');
    
    // Reply Preview elements
    const replyPreview = document.getElementById('reply-preview');
    const closeReplyBtn = document.getElementById('close-reply');
    const replyPreviewName = document.getElementById('reply-preview-name');
    const replyPreviewText = document.getElementById('reply-preview-text');
    const replyToIdInput = document.getElementById('reply-to-id');

    if (!chatForm || !chatWrapper) return;

    const CONVERSATION_ID = chatWrapper.dataset.conversationId || window.CONVERSATION_ID;
    const CURRENT_USER_ID = chatWrapper.dataset.userId || window.CURRENT_USER_ID;

    if (!CONVERSATION_ID) return;

    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    let micPressTimer;

    function toggleSendMicButtons() {
        if (chatInput && (chatInput.value.trim() !== '' || (fileInput && fileInput.files.length > 0))) {
            if (micBtn) micBtn.style.display = 'none';
            if (sendBtn) sendBtn.style.display = 'flex';
        } else {
            if (micBtn) micBtn.style.display = 'flex';
            if (sendBtn) sendBtn.style.display = 'none';
        }
    }

    if (chatInput) {
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if(this.value.trim() === '') {
                this.style.height = 'auto';
            }
            toggleSendMicButtons();
        });

        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (chatInput.value.trim() !== '' || (fileInput && fileInput.files.length > 0)) {
                    sendMessage();
                }
            }
        });
    }

    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            toggleSendMicButtons();
            if (fileInput.files.length > 0) {
                if (chatInput) chatInput.placeholder = "Fichier: " + fileInput.files[0].name;
            } else {
                if (chatInput) chatInput.placeholder = "Écrivez votre message...";
            }
        });
    }

    // --- Voice Recording Fix ---
    if (micBtn) {
        micBtn.addEventListener('mousedown', (e) => { e.preventDefault(); handleMicPress(); });
        micBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMicPress(); }, {passive: false});
        
        document.addEventListener('mouseup', handleMicRelease);
        document.addEventListener('touchend', handleMicRelease);
    }

    function handleMicPress() {
        micPressTimer = setTimeout(() => {
            startRecording();
        }, 300);
    }

    function handleMicRelease() {
        clearTimeout(micPressTimer);
        if (isRecording) {
            stopRecording();
        }
    }

    async function startRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("L'enregistrement vocal n'est pas supporté par votre navigateur.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            isRecording = true;
            if (micBtn) micBtn.classList.add('recording');

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());
                
                if (audioChunks.length > 0 && audioBlob.size > 1000) {
                    await sendAudioMessage(audioBlob);
                }
            });

            mediaRecorder.start();
        } catch (err) {
            console.error("Erreur d'accès au micro:", err);
        }
    }

    function stopRecording() {
        if (isRecording && mediaRecorder && mediaRecorder.state !== "inactive") {
            isRecording = false;
            if (micBtn) micBtn.classList.remove('recording');
            mediaRecorder.stop();
        }
    }

    // --- Reply & Delete Logic ---
    function openReply(messageId, senderName, contentText) {
        if (replyToIdInput) replyToIdInput.value = messageId;
        if (replyPreviewName) replyPreviewName.textContent = senderName;
        if (replyPreviewText) replyPreviewText.textContent = contentText || "Fichier joint";
        if (replyPreview) replyPreview.style.display = 'block';
        if (chatInput) chatInput.focus();
    }

    if (closeReplyBtn) {
        closeReplyBtn.addEventListener('click', () => {
            if (replyPreview) replyPreview.style.display = 'none';
            if (replyToIdInput) replyToIdInput.value = '';
        });
    }

    async function deleteMessage(messageId, msgElement) {
        if (confirm("Voulez-vous supprimer ce message pour tout le monde ?")) {
            try {
                const res = await fetch(`/messages/api/delete/${messageId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCsrfToken()
                    }
                });
                if (res.ok) {
                    msgElement.remove();
                } else {
                    alert("Erreur lors de la suppression.");
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    function attachMessageInteractions(msgElement) {
        if (msgElement.dataset.interactionsAttached) return;
        msgElement.dataset.interactionsAttached = 'true';

        const actionsBtn = msgElement.querySelector('.chat-msg-actions svg');
        const dropdown = msgElement.querySelector('.chat-msg-dropdown');
        if (actionsBtn && dropdown) {
            actionsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.chat-msg-dropdown.show').forEach(d => {
                    if (d !== dropdown) d.classList.remove('show');
                });
                dropdown.classList.toggle('show');
            });

            const replyAction = dropdown.querySelector('.action-reply');
            if (replyAction) {
                replyAction.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.remove('show');
                    const isSent = msgElement.classList.contains('sent');
                    const senderName = isSent ? "Vous" : (document.querySelector('.chat-header h2')?.textContent || "Interlocuteur");
                    const text = msgElement.querySelector('.msg-content')?.textContent || "Fichier/Audio";
                    openReply(msgElement.dataset.id, senderName, text);
                });
            }

            const deleteAction = dropdown.querySelector('.action-delete');
            if (deleteAction) {
                deleteAction.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.remove('show');
                    deleteMessage(msgElement.dataset.id, msgElement);
                });
            }
        }

        let touchStartX = 0;
        let touchStartY = 0;
        let longPressTimer;

        msgElement.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            msgElement.style.transition = 'none';

            longPressTimer = setTimeout(() => {
                const isSent = msgElement.classList.contains('sent');
                if (isSent) {
                    if (confirm("Voulez-vous supprimer ce message ?")) {
                        deleteMessage(msgElement.dataset.id, msgElement);
                    }
                }
            }, 600);
        }, {passive: true});

        msgElement.addEventListener('touchmove', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const diffX = touchEndX - touchStartX;
            const diffY = Math.abs(touchEndY - touchStartY);

            if (Math.abs(diffX) > 10 || diffY > 10) {
                clearTimeout(longPressTimer);
            }

            if (diffX > 0 && diffY < 30) {
                msgElement.style.transform = `translateX(${Math.min(diffX, 50)}px)`;
            }
        }, {passive: true});

        msgElement.addEventListener('touchend', (e) => {
            clearTimeout(longPressTimer);
            msgElement.style.transition = 'transform 0.2s ease';
            msgElement.style.transform = `translateX(0)`;

            const touchEndX = e.changedTouches[0].screenX;
            const diffX = touchEndX - touchStartX;
            
            if (diffX > 50) {
                const isSent = msgElement.classList.contains('sent');
                const senderName = isSent ? "Vous" : (document.querySelector('.chat-header h2')?.textContent || "Interlocuteur");
                const text = msgElement.querySelector('.msg-content')?.textContent || "Fichier/Audio";
                openReply(msgElement.dataset.id, senderName, text);
            }
        });
    }

    document.addEventListener('click', () => {
        document.querySelectorAll('.chat-msg-dropdown.show').forEach(d => d.classList.remove('show'));
    });

    document.querySelectorAll('.chat-message').forEach(attachMessageInteractions);

    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    scrollToBottom();

    function getCsrfToken() {
        const tokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
        return tokenElement ? tokenElement.value : '';
    }

    function appendMessage(msg, isSent) {
        if (emptyState) emptyState.remove();

        if (document.querySelector(`.chat-message[data-id="${msg.id}"]`)) return;

        const div = document.createElement('div');
        div.className = `chat-message ${isSent ? 'sent' : 'received'}`;
        div.dataset.id = msg.id;
        
        let innerHtml = '';

        innerHtml += `
            <div class="chat-msg-actions">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
                <div class="chat-msg-dropdown">
                    <div class="action-reply">Répondre</div>
                    ${isSent ? '<div class="action-delete" style="color: #ef5350;">Supprimer</div>' : ''}
                </div>
            </div>`;

        if (msg.reply_to_id) {
            innerHtml += `
                <div class="msg-reply-to" onclick="document.querySelector('.chat-message[data-id=\\'${msg.reply_to_id}\\']')?.scrollIntoView({behavior: 'smooth', block: 'center'})">
                    <strong>Message cité</strong><br>
                    ${msg.reply_to_content ? msg.reply_to_content.substring(0, 50) : "Fichier/Audio"}
                </div>`;
        }

        if (msg.file_url) {
            const isImage = msg.file_url.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) != null || msg.file_url.toLowerCase().includes('image');
            if (isImage) {
                innerHtml += `
                    <a href="${msg.file_url}" target="_blank">
                        <img src="${msg.file_url}" alt="Image attachée" style="max-width: 100%; border-radius: 8px; margin-bottom: 8px; cursor: pointer;">
                    </a>`;
            } else {
                innerHtml += `
                    <a href="${msg.file_url}" target="_blank" style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.05); padding: 8px; border-radius: 8px; text-decoration: none; color: inherit; margin-bottom: 8px;">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                        <span style="font-size: 13px; word-break: break-all;">${msg.file_name || 'Fichier joint'}</span>
                    </a>`;
            }
        }

        if (msg.voice_url) {
            innerHtml += `
                <audio controls style="max-width: 250px; height: 40px; margin-bottom: 8px; outline: none;">
                    <source src="${msg.voice_url}" type="audio/webm">
                    Votre navigateur.
                </audio>`;
        }

        if (msg.content) {
            const safeContent = msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            innerHtml += `<div class="msg-content">${safeContent}</div>`;
        }
        
        innerHtml += `<div class="msg-time">${msg.created_at}</div>`;
        
        div.innerHTML = innerHtml;
        if (messagesContainer) {
            messagesContainer.appendChild(div);
        }
        attachMessageInteractions(div);
        scrollToBottom();
    }

    async function sendMessage() {
        const content = chatInput ? chatInput.value.trim() : '';
        const file = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;
        const replyToId = replyToIdInput ? replyToIdInput.value : '';
        
        if (!content && !file) return;

        if (chatInput) {
            chatInput.value = '';
            chatInput.style.height = 'auto';
            chatInput.placeholder = "Écrivez votre message...";
        }
        if (fileInput) fileInput.value = '';
        if (replyPreview) replyPreview.style.display = 'none';
        if (replyToIdInput) replyToIdInput.value = '';
        toggleSendMicButtons();
        
        const fd = new FormData();
        if (content) fd.append('content', content);
        if (file) fd.append('file', file);
        if (replyToId) fd.append('reply_to_id', replyToId);

        await sendFormData(fd, content, file ? file.name : null, replyToId);
    }

    async function sendAudioMessage(audioBlob) {
        const replyToId = replyToIdInput ? replyToIdInput.value : '';
        if (replyPreview) replyPreview.style.display = 'none';
        if (replyToIdInput) replyToIdInput.value = '';

        const fd = new FormData();
        fd.append('voice', audioBlob, 'voice_message.webm');
        if (replyToId) fd.append('reply_to_id', replyToId);

        await sendFormData(fd, "🎤 Message vocal", null, replyToId);
    }

    async function sendFormData(fd, optContentPreview, optFilePreview, replyToId) {
        if (chatInput) chatInput.disabled = true;

        const tempId = 'temp-' + Date.now();
        
        const tempMsgObj = {
            id: tempId,
            content: optContentPreview || '',
            created_at: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            file_url: null,
            file_name: optFilePreview,
            voice_url: null,
            reply_to_id: replyToId
        };
        appendMessage(tempMsgObj, true);
        
        const tempMsg = document.querySelector(`.chat-message[data-id="${tempId}"]`);
        if (tempMsg) tempMsg.style.opacity = '0.6';

        try {
            const res = await fetch(`/messages/api/send/${CONVERSATION_ID}/`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'X-CSRFToken': getCsrfToken()
                },
                body: fd
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.id && tempMsg) {
                    tempMsg.remove();
                    appendMessage(data, true);
                }
            } else {
                console.error('Server error', res.status);
                if (tempMsg) tempMsg.remove();
            }
        } catch (err) {
            console.error('Network error', err);
            if (tempMsg) tempMsg.remove();
        } finally {
            if (chatInput) {
                chatInput.disabled = false;
                chatInput.focus();
            }
        }
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage();
        });
    }

    async function fetchNewMessages() {
        const messageEls = document.querySelectorAll('.chat-message');
        let lastId = 0;
        
        for (let i = messageEls.length - 1; i >= 0; i--) {
            if (!messageEls[i].dataset.id.startsWith('temp-')) {
                lastId = messageEls[i].dataset.id;
                break;
            }
        }

        try {
            const res = await fetch(`/messages/api/fetch/${CONVERSATION_ID}/?last_id=${lastId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.messages && data.messages.length > 0) {
                    data.messages.forEach(msg => {
                        appendMessage(msg, msg.sender_id == CURRENT_USER_ID);
                    });
                }
            }
        } catch (err) {}
    }

    let pollingTimer = setInterval(fetchNewMessages, 3000);

    fetchNewMessages();
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(pollingTimer);
        } else {
            fetchNewMessages();
            pollingTimer = setInterval(fetchNewMessages, 3000);
        }
    });
});
