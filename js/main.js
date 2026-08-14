/**
 * Personal Academic Homepage - Enhanced JavaScript
 */

(function () {
    'use strict';

    const CONFIG = {
        scrollOffset: 80,
        themeKey: 'theme-preference'
    };

    const Utils = {
        throttle(func, limit) {
            let inThrottle;
            return function (...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        scrollToElement(element, offset = CONFIG.scrollOffset) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const ThemeManager = {
        currentTheme: 'light',

        readStoredTheme() {
            try {
                const saved = localStorage.getItem(CONFIG.themeKey);
                return saved === 'dark' || saved === 'light' ? saved : null;
            } catch (e) {
                return null;
            }
        },

        applyTheme(theme) {
            const next = theme === 'dark' ? 'dark' : 'light';
            this.currentTheme = next;
            document.documentElement.setAttribute('data-theme', next);
            const toggleBtn = document.querySelector('.theme-toggle');
            if (toggleBtn) {
                toggleBtn.setAttribute(
                    'aria-label',
                    next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
                );
            }
            window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
        },

        persistTheme(theme) {
            try {
                localStorage.setItem(CONFIG.themeKey, theme);
            } catch (e) { /* private mode */ }
        },

        init() {
            const saved = this.readStoredTheme();
            if (saved) {
                this.applyTheme(saved);
            } else {
                this.applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            }

            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.readStoredTheme()) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });

            this.bindToggleButton();
        },

        toggle() {
            const next = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(next);
            this.persistTheme(next);
        },

        bindToggleButton() {
            const toggleBtn = document.querySelector('.theme-toggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    toggleBtn.classList.add('switching');
                    this.toggle();
                    setTimeout(() => {
                        toggleBtn.classList.remove('switching');
                    }, 450);
                });
            }
        }
    };

    const NavigationManager = {
        init() {
            this.bindSmoothScroll();
            this.bindActiveLink();
            this.bindMobileMenu();
            this.bindDropdowns();
        },

        bindSmoothScroll() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const targetId = anchor.getAttribute('href');
                    if (targetId === '#') return;

                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        Utils.scrollToElement(targetElement);

                        history.pushState(null, null, targetId);
                    }
                });
            });
        },

        bindActiveLink() {
            const sections = document.querySelectorAll('section[id], div[id]');
            const navLinks = document.querySelectorAll('.nav-link');

            const observerOptions = {
                root: null,
                rootMargin: `-${CONFIG.scrollOffset}px 0px -50% 0px`,
                threshold: 0
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            }, observerOptions);

            sections.forEach(section => observer.observe(section));
        },

        bindMobileMenu() {
            const menuToggle = document.querySelector('.mobile-menu-toggle');
            const mobileNav = document.querySelector('.mobile-nav');

            if (menuToggle && mobileNav) {
                const setOpen = (open) => {
                    mobileNav.classList.toggle('active', open);
                    menuToggle.classList.toggle('active', open);
                    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                };

                menuToggle.addEventListener('click', () => {
                    setOpen(!mobileNav.classList.contains('active'));
                });

                mobileNav.addEventListener('click', (e) => {
                    if (e.target.closest('.nav-link')) setOpen(false);
                });

                document.addEventListener('click', (e) => {
                    if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
                        setOpen(false);
                    }
                });
            }
        }
        ,
        bindDropdowns() {
            const dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));
            if (!dropdowns.length) return;

            const closeAll = (except) => {
                dropdowns.forEach(dd => {
                    if (dd !== except) {
                        dd.classList.remove('open');
                        const btn = dd.querySelector('.nav-dropdown-toggle');
                        if (btn) btn.setAttribute('aria-expanded', 'false');
                    }
                });
            };

            dropdowns.forEach(dd => {
                const btn = dd.querySelector('.nav-dropdown-toggle');
                if (!btn) return;

                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isOpen = dd.classList.toggle('open');
                    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                    if (isOpen) closeAll(dd);
                });

                dd.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        dd.classList.remove('open');
                        btn.setAttribute('aria-expanded', 'false');
                        btn.blur();
                    }
                });
            });

            document.addEventListener('click', (e) => {
                const inside = e.target.closest('.nav-dropdown');
                if (!inside) closeAll();
            });

            window.addEventListener('blur', () => closeAll());
        }
    };

    const BackToTopManager = {
        init() {
            this.buttons = Array.from(document.querySelectorAll('.js-back-to-top'));
            if (!this.buttons.length) return;

            this.bindEvents();
            this.updateVisibility();
        },

        bindEvents() {
            window.addEventListener('scroll', () => {
                this.updateVisibility();
            }, { passive: true });

            this.buttons.forEach((button) => {
                button.addEventListener('click', () => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            });
        },

        updateVisibility() {
            const visible = window.scrollY > 500;
            this.buttons.forEach((button) => {
                button.style.opacity = visible ? '1' : '0';
                button.style.pointerEvents = visible ? 'auto' : 'none';
            });
        }
    };

    // === Interaction Enhancements ===
    const InteractionManager = {
        init() {
            this.initScrollReveal();
            this.initGlassNavbar();
            this.initScrollProgress();
            this.initPageLoader();
        },

        initScrollProgress() {
            const bar = document.querySelector('.scroll-progress');
            if (!bar) return;

            const onScroll = () => {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
            };

            window.addEventListener('scroll', Utils.throttle(onScroll, 16), { passive: true });
            onScroll();
        },

        // Scroll-reveal: fade-up sections as they enter viewport
        initScrollReveal() {
            const reveals = document.querySelectorAll('.reveal');
            if (!reveals.length) return;

            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReduced) {
                reveals.forEach(el => el.classList.add('active'));
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

            reveals.forEach(el => observer.observe(el));
        },

        // Glassmorphism navbar on scroll
        initGlassNavbar() {
            const navbar = document.querySelector('.navbar');
            if (!navbar) return;

            const onScroll = Utils.throttle(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            }, 100);

            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll(); // set initial state
        },

        // Page loader fade-out
        initPageLoader() {
            const loader = document.getElementById('pageLoader');
            if (!loader) return;
            setTimeout(() => loader.classList.add('hidden'), 400);
            loader.addEventListener('transitionend', () => {
                if (loader.classList.contains('hidden')) {
                    loader.style.display = 'none';
                }
            });
        }
    };

    function init() {
        ThemeManager.init();
        NavigationManager.init();
        BackToTopManager.init();
        InteractionManager.init();
        document.body.classList.add('loaded');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.AcademicSite = {
        ThemeManager,
        NavigationManager,
        Utils,
        CONFIG
    };

})();
