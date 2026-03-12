/**
 * Personal Academic Homepage - Enhanced JavaScript
 */

(function () {
    'use strict';

    const CONFIG = {
        animationDuration: 600,
        scrollOffset: 80,
        themeKey: 'theme-preference',
        lazyLoadThreshold: 100
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

        debounce(func, wait) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },

        scrollToElement(element, offset = CONFIG.scrollOffset) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        },

        isInViewport(element, threshold = CONFIG.lazyLoadThreshold) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= -threshold &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        animate(element, animationClass, duration = CONFIG.animationDuration) {
            element.classList.add(animationClass);
            setTimeout(() => {
                element.classList.remove(animationClass);
            }, duration);
        }
    };

    const ThemeManager = {
        currentTheme: 'light',

        init() {
            const savedTheme = localStorage.getItem(CONFIG.themeKey);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (savedTheme) {
                this.setTheme(savedTheme);
            } else if (prefersDark) {
                this.setTheme('dark');
            }

            // 监听系统主题变化
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(CONFIG.themeKey)) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });

            // 绑定切换按钮
            this.bindToggleButton();
        },

        setTheme(theme) {
            this.currentTheme = theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(CONFIG.themeKey, theme);

            // 触发主题变化事件
            window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
        },

        toggle() {
            const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
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
                menuToggle.addEventListener('click', () => {
                    mobileNav.classList.toggle('active');
                    menuToggle.classList.toggle('active');
                });

                mobileNav.querySelectorAll('.nav-link').forEach(link => {
                    link.addEventListener('click', () => {
                        mobileNav.classList.remove('active');
                        menuToggle.classList.remove('active');
                    });
                });

                document.addEventListener('click', (e) => {
                    if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
                        mobileNav.classList.remove('active');
                        menuToggle.classList.remove('active');
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

    const AnimationManager = {
        init() {
            this.initScrollAnimations();
        },

        initScrollAnimations() {
            const animatedElements = document.querySelectorAll('[data-animate]');

            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const animation = entry.target.dataset.animate;
                        entry.target.classList.add(animation);
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            animatedElements.forEach(el => observer.observe(el));
        }
    };

    // ========================================
    // 懒加载管理
    // ========================================
    const LazyLoadManager = {
        init() {
            if ('IntersectionObserver' in window) {
                this.initIntersectionObserver();
            } else {
                this.initFallback();
            }
        },

        initIntersectionObserver() {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: `${CONFIG.lazyLoadThreshold}px`
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        },

        initFallback() {
            let lazyImages = document.querySelectorAll('img[data-src]');

            const lazyLoad = () => {
                lazyImages.forEach(img => {
                    if (Utils.isInViewport(img)) {
                        this.loadImage(img);
                    }
                });
            };

            window.addEventListener('scroll', Utils.throttle(lazyLoad, 200));
            window.addEventListener('resize', Utils.throttle(lazyLoad, 200));
            lazyLoad();
        },

        loadImage(img) {
            const src = img.dataset.src;
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
            }
        }
    };

    const PerformanceManager = {
        init() {
            this.measurePageLoad();
            this.monitorLongTasks();
        },

        measurePageLoad() {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        console.log('Page Load Time:', {
                            DNS: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
                            TCP: Math.round(perfData.connectEnd - perfData.connectStart),
                            TTFB: Math.round(perfData.responseStart - perfData.requestStart),
                            DOM: Math.round(perfData.domComplete - perfData.domLoading),
                            Total: Math.round(perfData.loadEventEnd - perfData.startTime)
                        });
                    }
                }, 0);
            });
        },

        monitorLongTasks() {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn('Long Task Warning:', entry.duration + 'ms', entry);
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            }
        }
    };

    // === Interaction Enhancements ===
    const InteractionManager = {
        init() {
            this.initScrollReveal();
            this.initGlassNavbar();
            this.initMagneticIcons();
            this.initRippleButtons();
            this.initPageLoader();
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

        // Magnetic hover effect on social icons
        initMagneticIcons() {
            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReduced) return;
            const links = document.querySelectorAll('.social-link');
            links.forEach(link => {
                link.addEventListener('mousemove', (e) => {
                    const rect = link.getBoundingClientRect();
                    const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
                    const y = (e.clientY - rect.top - rect.height / 2) * 0.18;
                    link.style.transform = `translate(${x}px, ${y}px)`;
                });
                link.addEventListener('mouseleave', () => {
                    link.style.transform = '';
                });
            });
        },

        // Ripple effect on filter buttons
        initRippleButtons() {
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;

                const existing = btn.querySelector('.ripple-effect');
                if (existing) existing.remove();

                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect');
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * 2;
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                btn.appendChild(ripple);

                ripple.addEventListener('animationend', () => ripple.remove());
            });
        },

        // Page loader fade-out
        initPageLoader() {
            const loader = document.getElementById('pageLoader');
            if (!loader) return;
            // Short delay so the ring animation is visible
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
        AnimationManager.init();
        LazyLoadManager.init();
        PerformanceManager.init();
        InteractionManager.init();

        document.body.classList.add('loaded');

        console.log('🚀 Academic Homepage Loaded');
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
