// Script principal (déplacé depuis index.html)
// Contient : revealOnScroll + gestion du menu collapse (fermeture au clic, hover/leave, scroll)

document.addEventListener('DOMContentLoaded', function () {
    // revealOnScroll
    const sections = document.querySelectorAll('section');
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        sections.forEach((section) => {
            const top = section.getBoundingClientRect().top;
            if (top < triggerBottom) section.classList.add('visible');
        });
    };
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();

    // Menu collapse behaviour
    (function () {
        const navLinks = document.querySelectorAll('#navbarNav .nav-link');
        const navbarCollapseEl = document.getElementById('navbarNav');
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (!navbarCollapseEl) return;

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // Mobile anchor handling: prevent default, close then smooth scroll
                if (window.innerWidth < 992 && href && href.startsWith('#')) {
                    e.preventDefault();
                    if (window.bootstrap) {
                        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapseEl) || new bootstrap.Collapse(navbarCollapseEl, { toggle: false });
                        bsCollapse.hide();
                    }
                    setTimeout(() => {
                        const target = document.querySelector(href);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            try { history.pushState(null, '', href); } catch (err) { window.location.hash = href; }
                        }
                    }, 220);
                    return;
                }

                // Otherwise close collapse if open
                if (navbarCollapseEl.classList.contains('show') && window.bootstrap) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapseEl) || new bootstrap.Collapse(navbarCollapseEl, { toggle: false });
                    bsCollapse.hide();
                }
            });
        });

        // Auto-close when cursor goes below the menu area, plus other guards
        let collapseHideTimer = null;
        const COLLAPSE_HIDE_DELAY = 180;

        function hideCollapse() {
            if (!window.bootstrap) return;
            if (!navbarCollapseEl.classList.contains('show')) return;
            const bs = bootstrap.Collapse.getInstance(navbarCollapseEl) || new bootstrap.Collapse(navbarCollapseEl, { toggle: false });
            bs.hide();
        }

        function scheduleHide() {
            if (collapseHideTimer) clearTimeout(collapseHideTimer);
            collapseHideTimer = setTimeout(hideCollapse, COLLAPSE_HIDE_DELAY);
        }
        function cancelHide() {
            if (collapseHideTimer) { clearTimeout(collapseHideTimer); collapseHideTimer = null; }
        }

        navbarCollapseEl.addEventListener('mouseleave', () => {
            if (!navbarCollapseEl.classList.contains('show')) return;
            scheduleHide();
        });
        navbarCollapseEl.addEventListener('mouseenter', cancelHide);

        function handlePointer(ev) {
            if (!navbarCollapseEl.classList.contains('show')) return;
            const rect = navbarCollapseEl.getBoundingClientRect();
            if (ev.clientY > rect.bottom + 6) scheduleHide(); else cancelHide();
        }
        document.addEventListener('pointermove', handlePointer);
        document.addEventListener('mousemove', handlePointer);

        // Click / touch outside to close
        document.addEventListener('click', (ev) => {
            if (!navbarCollapseEl.classList.contains('show')) return;
            const inside = navbarCollapseEl.contains(ev.target) || (navbarToggler && navbarToggler.contains(ev.target));
            if (!inside) hideCollapse();
        });
        document.addEventListener('touchstart', (ev) => {
            if (!navbarCollapseEl.classList.contains('show')) return;
            const inside = navbarCollapseEl.contains(ev.target) || (navbarToggler && navbarToggler.contains(ev.target));
            if (!inside) hideCollapse();
        }, { passive: true });

        // Close on scroll if the menu is moved out of view
        let lastRectBottom = 0;
        window.addEventListener('scroll', () => {
            if (!navbarCollapseEl.classList.contains('show')) return;
            const rect = navbarCollapseEl.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) { hideCollapse(); return; }
            if (lastRectBottom && rect.bottom < lastRectBottom - 6) scheduleHide();
            lastRectBottom = rect.bottom;
        }, { passive: true });

    })();

    // --- Formspree AJAX Submission & Toast ---
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = btn.innerHTML;

            // Loading state
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi...';
            btn.disabled = true;

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showToast('Message envoyé avec succès !', 'success');
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        showToast(data["errors"].map(error => error["message"]).join(", "), 'error');
                    } else {
                        showToast('Oups ! Une erreur est survenue.', 'error');
                    }
                }
            } catch (error) {
                showToast('Erreur de connexion.', 'error');
            } finally {
                btn.innerHTML = originalBtnText;
                btn.disabled = false;
            }
        });
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        const iconClass = type === 'success' ? 'fa-check-circle toast-success-icon' : 'fa-exclamation-circle toast-error-icon';
        
        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            setTimeout(() => toast.classList.add('show'), 10);
        });

        // Remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

});

