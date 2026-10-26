/**
 * Piolo Data Saver & Instant Navigation System (React-style SPA transitions)
 */

(function() {
    'use strict';

    // 1. Initial State Check (Executed immediately to prevent FOUC)
    const STORAGE_KEY = 'piolo_low_data_mode';
    
    function isAutoSlowConnection() {
        if (navigator.connection) {
            if (navigator.connection.saveData) return true;
            const type = navigator.connection.effectiveType;
            if (type === 'slow-2g' || type === '2g' || type === '3g') return true;
        }
        return false;
    }

    function checkLowDataState() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            return stored === 'true';
        }
        return isAutoSlowConnection();
    }

    let isLowData = checkLowDataState();

    function applyLowDataClass() {
        if (isLowData) {
            document.documentElement.classList.add('low-data-mode');
        } else {
            document.documentElement.classList.remove('low-data-mode');
        }
    }

    applyLowDataClass();

    window.PioloDataSaver = {
        isEnabled: function() { return isLowData; },
        toggle: function(forceState) {
            isLowData = (forceState !== undefined) ? forceState : !isLowData;
            localStorage.setItem(STORAGE_KEY, isLowData ? 'true' : 'false');
            applyLowDataClass();
            updateToggleButtonsUI();
            
            // Notification toast
            showToast(isLowData ? '⚡ Mode Économie de Données Activé' : '✨ Mode Haute Qualité Activé');
        }
    };

    function updateToggleButtonsUI() {
        const buttons = document.querySelectorAll('.data-saver-toggle-btn');
        buttons.forEach(btn => {
            if (isLowData) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                btn.title = 'Mode Éco Actif (Cliquez pour désactiver)';
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
                btn.title = 'Activer le Mode Économie de Données';
            }
        });
    }

    function showToast(message) {
        let toast = document.getElementById('piolo-toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'piolo-toast-notification';
            toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                background: #111b21;
                color: #ffffff;
                padding: 10px 20px;
                border-radius: 25px;
                font-size: 13px;
                font-weight: 600;
                box-shadow: 0 4px 15px rgba(0,0,0,0.25);
                z-index: 99999;
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: none;
                border: 1px solid #D4AF37;
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 2500);
    }

    // 2. React-Style SPA Instant Navigation Engine (Fast HTML Swap)
    const pageCache = new Map();

    async function fetchPage(url) {
        if (pageCache.has(url)) {
            return pageCache.get(url);
        }
        const response = await fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-Piolo-SPA': '1'
            }
        });
        if (!response.ok) throw new Error('Network error');
        const text = await response.text();
        pageCache.set(url, text);
        return text;
    }

    async function navigateTo(url, pushState = true) {
        if (url.includes('/admin/') || url.includes('/logout/') || url.includes('/media/')) {
            window.location.href = url;
            return;
        }

        try {
            if (window.showPioloLoader) window.showPioloLoader();

            const htmlText = await fetchPage(url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const newMain = doc.querySelector('main');
            const currentMain = document.querySelector('main');
            const newTitle = doc.querySelector('title');

            if (newMain && currentMain) {
                currentMain.style.opacity = '0.5';
                currentMain.style.transition = 'opacity 0.15s ease';

                setTimeout(() => {
                    currentMain.innerHTML = newMain.innerHTML;
                    if (newTitle) document.title = newTitle.innerText;
                    
                    if (pushState) {
                        history.pushState({ url: url }, '', url);
                    }
                    
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    currentMain.style.opacity = '1';

                    initLowDataDeferrals();
                    updateToggleButtonsUI();

                    const loader = document.getElementById('page-loader-overlay');
                    if (loader) {
                        loader.style.opacity = '0';
                        loader.style.visibility = 'hidden';
                    }
                }, 150);
            } else {
                window.location.href = url;
            }
        } catch (err) {
            console.warn('Fast navigation fallback:', err);
            window.location.href = url;
        }
    }

    function setupPrefetching() {
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a');
            if (link && link.origin === window.location.origin) {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    fetchPage(href).catch(() => {});
                }
            }
        });
    }

    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.data-saver-toggle-btn');
        if (toggleBtn) {
            e.preventDefault();
            e.stopPropagation();
            window.PioloDataSaver.toggle();
            return;
        }

        const link = e.target.closest('a');
        if (link && link.origin === window.location.origin) {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:') && link.target !== '_blank' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                navigateTo(href);
            }
        }
    });

    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.url) {
            navigateTo(e.state.url, false);
        } else {
            navigateTo(window.location.href, false);
        }
    });

    // 3. Defer Heavy Media (360 Tours & Videos) in Low Data Mode
    function initLowDataDeferrals() {
        if (!isLowData) return;

        const heavyIframes = document.querySelectorAll('iframe[src*="panorama"], iframe[src*="360"], .pano-iframe');
        heavyIframes.forEach(iframe => {
            if (iframe.dataset.deferred) return;
            iframe.dataset.deferred = 'true';
            const realSrc = iframe.src;
            iframe.removeAttribute('src');

            const placeholder = document.createElement('div');
            placeholder.className = 'low-data-pano-placeholder';
            placeholder.style.cssText = `
                width: 100%;
                height: 300px;
                background: #1a252f;
                color: #ffffff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                border: 1px dashed #D4AF37;
            `;
            placeholder.innerHTML = `
                <i class="fa-solid fa-bolt" style="font-size: 32px; color: #D4AF37; margin-bottom: 10px;"></i>
                <h4 style="margin: 0 0 5px 0; font-size: 16px;">Visite 360° masquée en Mode Éco</h4>
                <p style="font-size: 13px; color: #a0aec0; margin-bottom: 15px;">Économisez jusqu'à 15 Mo de données sur cette page.</p>
                <button type="button" class="btn-load-360" style="
                    background: #D4AF37;
                    color: #000;
                    border: none;
                    padding: 8px 18px;
                    border-radius: 20px;
                    font-weight: 700;
                    cursor: pointer;
                ">Charger la visite 360°</button>
            `;

            iframe.parentNode.insertBefore(placeholder, iframe);
            iframe.style.display = 'none';

            placeholder.querySelector('.btn-load-360').addEventListener('click', () => {
                iframe.src = realSrc;
                iframe.style.display = 'block';
                placeholder.remove();
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        updateToggleButtonsUI();
        initLowDataDeferrals();
        setupPrefetching();
    });

})();
