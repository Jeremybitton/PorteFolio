// Script principal
// Contient : revealOnScroll, gestion menu collapse, thème jour/nuit, formspree

document.addEventListener('DOMContentLoaded', function () {

    // ═══════════════════════════════════════
    //  THEME TOGGLE (Jour / Nuit)
    // ═══════════════════════════════════════
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('portfolio-theme', next);
            updateThemeIcon(next);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (!icon) return;
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
            themeToggle.setAttribute('aria-label', 'Passer en mode jour');
        } else {
            icon.className = 'fa-solid fa-moon';
            themeToggle.setAttribute('aria-label', 'Passer en mode nuit');
        }
    }

    // ═══════════════════════════════════════
    //  REVEAL ON SCROLL
    // ═══════════════════════════════════════
    const sections = document.querySelectorAll('section');
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        sections.forEach((section) => {
            const top = section.getBoundingClientRect().top;
            if (top < triggerBottom) section.classList.add('visible');
        });
    };

    // ═══════════════════════════════════════
    //  NAVBAR SCROLL EFFECT
    // ═══════════════════════════════════════
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }
        revealOnScroll();
    }, { passive: true });

    revealOnScroll();

    // ═══════════════════════════════════════
    //  MENU COLLAPSE BEHAVIOUR
    // ═══════════════════════════════════════
    (function () {
        const navLinks = document.querySelectorAll('#navbarNav .nav-link');
        const navbarCollapseEl = document.getElementById('navbarNav');
        const navbarToggler = document.querySelector('.navbar-toggler');
        if (!navbarCollapseEl) return;

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

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

                if (navbarCollapseEl.classList.contains('show') && window.bootstrap) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapseEl) || new bootstrap.Collapse(navbarCollapseEl, { toggle: false });
                    bsCollapse.hide();
                }
            });
        });

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

        let lastRectBottom = 0;
        window.addEventListener('scroll', () => {
            if (!navbarCollapseEl.classList.contains('show')) return;
            const rect = navbarCollapseEl.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) { hideCollapse(); return; }
            if (lastRectBottom && rect.bottom < lastRectBottom - 6) scheduleHide();
            lastRectBottom = rect.bottom;
        }, { passive: true });

    })();

    // ═══════════════════════════════════════
    //  FORMSPREE AJAX SUBMISSION & TOAST
    // ═══════════════════════════════════════
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = btn.innerHTML;

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

        requestAnimationFrame(() => {
            setTimeout(() => toast.classList.add('show'), 10);
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // ═══════════════════════════════════════
    //  SCROLLSPY EST BASIQUE
    // ═══════════════════════════════════════
    const mainNavLinks = document.querySelectorAll('#navbarNav .nav-link');
    const mainSections = document.querySelectorAll('section');

    function updateActiveLink() {
        let currentSection = '';
        
        mainSections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Ajustement pour la navbar fixe (~120px)
            if (window.scrollY >= (sectionTop - 150)) {
                currentSection = section.getAttribute('id');
            }
        });

        mainNavLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (currentSection && href && href.includes('#' + currentSection)) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveLink);
    // Appel initial au cas où on charge la page au milieu
    updateActiveLink();

    // ═══════════════════════════════════════
    //  GESTION DES MODALES (Projets Personnels)
    // ═══════════════════════════════════════
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Empêche le scroll en arrière-plan
        }
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Réactive le scroll
        }
    };

    // Fermer la modale si on clique en dehors
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Fermer avec Echap
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    });

});
