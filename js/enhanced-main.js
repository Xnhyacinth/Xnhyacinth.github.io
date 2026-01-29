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
            this.bindScrollEffect();
        },

        bindScrollEffect() {
            const navbar = document.querySelector('.navbar');
            if (!navbar) return;

            const handleScroll = Utils.throttle(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }, 100);

            window.addEventListener('scroll', handleScroll);
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

                document.addEventListener('click', (e) => {
                    if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
                        mobileNav.classList.remove('active');
                        menuToggle.classList.remove('active');
                    }
                });
            }
        }
    };

    const AnimationManager = {
        init() {
            this.initScrollAnimations();
            this.initHoverEffects();
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
        },

        initHoverEffects() {
            document.querySelectorAll('.card-hover').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-4px)';
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0)';
                });
            });

            this.initTypewriterEffect();
            this.initMagneticEffect();
        },

        initTypewriterEffect() {
            const profileName = document.querySelector('.profile-name');
            if (!profileName) return;

            const text = profileName.textContent;
            profileName.textContent = '';
            profileName.style.opacity = '1';

            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    profileName.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };

            setTimeout(typeWriter, 500);
        },

        initMagneticEffect() {
            const socialLinks = document.querySelectorAll('.social-link');

            socialLinks.forEach(link => {
                link.addEventListener('mousemove', (e) => {
                    const rect = link.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    link.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
                });

                link.addEventListener('mouseleave', () => {
                    link.style.transform = 'translate(0, 0)';
                });
            });
        },

        initParallaxEffect() {
            const profileSection = document.querySelector('.profile-section');
            if (!profileSection) return;

            window.addEventListener('scroll', Utils.throttle(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * 0.3;
                profileSection.style.backgroundPosition = `center ${rate}px`;
            }, 16));
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

    const SearchManager = {
        init() {
            this.bindSearchInput();
        },

        bindSearchInput() {
            const searchInput = document.querySelector('.search-input');
            if (!searchInput) return;

            searchInput.addEventListener('input', Utils.debounce((e) => {
                const query = e.target.value.toLowerCase().trim();
                this.performSearch(query);
            }, 300));
        },

        performSearch(query) {
            const publications = document.querySelectorAll('.publication-item');

            publications.forEach(pub => {
                const title = pub.querySelector('.publication-title')?.textContent.toLowerCase() || '';
                const authors = pub.querySelector('.publication-authors')?.textContent.toLowerCase() || '';
                const venue = pub.querySelector('.publication-venue')?.textContent.toLowerCase() || '';

                const isMatch = title.includes(query) ||
                    authors.includes(query) ||
                    venue.includes(query);

                pub.style.display = isMatch ? '' : 'none';

                if (isMatch && query) {
                    Utils.animate(pub, 'animate-fade-in');
                }
            });
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

    function init() {
        ThemeManager.init();
        NavigationManager.init();
        AnimationManager.init();
        LazyLoadManager.init();
        SearchManager.init();
        PerformanceManager.init();

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
