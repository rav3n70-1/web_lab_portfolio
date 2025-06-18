document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const body = document.body;
    const header = document.getElementById('header');
    const menuButton = document.getElementById('menu-button');
    const closeMenuButton = document.getElementById('close-menu-button');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuBackground = document.getElementById('menu-background');
    const mainMenu = document.getElementById('main-menu');
    const mainMenuLinks = document.querySelectorAll('.main-menu-link');
    const searchButton = document.getElementById('search-button');
    const searchBar = document.getElementById('search-bar');
    const closeSearchButton = document.getElementById('close-search-button');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results-container');
    const mainContent = document.getElementById('main-content');
    const backToTopButton = document.getElementById('back-to-top');
    const heroSection = document.getElementById('hero');
    const skillCountElement = document.getElementById('skill-count');

    let searchableContent = [];

    // --- Build Search Index ---
    const buildSearchIndex = () => {
        searchableContent = [];
        const sections = document.querySelectorAll('main section[id]');
        sections.forEach(section => {
            const titleElement = section.querySelector('h2');
            const title = titleElement ? titleElement.textContent : 'Unnamed Section';
            searchableContent.push({
                id: section.id,
                title: title,
                content: section.textContent || section.innerText
            });
        });
    };
    buildSearchIndex();

    // --- Menu Logic ---
    const toggleMenu = (show) => {
        if (show) {
            menuOverlay.classList.remove('invisible', 'opacity-0');
            body.classList.add('overflow-hidden');
        } else {
            menuOverlay.classList.add('opacity-0');
            setTimeout(() => {
                menuOverlay.classList.add('invisible');
                body.classList.remove('overflow-hidden');
                resetMenuState();
            }, 300);
        }
    };

    const resetMenuState = () => {
        document.querySelectorAll('.submenu-panel.active').forEach(submenu => {
            submenu.classList.remove('active');
        });
        mainMenu.classList.remove('submenu-active');
        mainMenuLinks.forEach(link => link.classList.remove('active'));
        menuBackground.style.opacity = 0;
    };

    menuButton.addEventListener('click', () => toggleMenu(true));
    closeMenuButton.addEventListener('click', () => toggleMenu(false));

    mainMenuLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const bgImage = link.dataset.bg;
            if (bgImage) {
                menuBackground.style.backgroundImage = `url(${bgImage})`;
                menuBackground.style.opacity = 1;
            }
        });
        
        link.addEventListener('mouseleave', () => {
            if (!mainMenu.classList.contains('submenu-active')) {
                menuBackground.style.opacity = 0;
            }
        });

        link.addEventListener('click', (e) => {
            e.preventDefault();
            const submenuId = link.dataset.submenu;
            const submenu = document.getElementById(submenuId);
            if (submenu) {
                document.querySelectorAll('.submenu-panel.active').forEach(activeSub => {
                    activeSub.classList.remove('active');
                });
                submenu.classList.add('active');
                mainMenu.classList.add('submenu-active');
                mainMenuLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    document.querySelectorAll('.submenu-back-button').forEach(button => {
        button.addEventListener('click', () => {
            const activeSubmenu = document.querySelector('.submenu-panel.active');
            if (activeSubmenu) {
                activeSubmenu.classList.remove('active');
            }
            mainMenu.classList.remove('submenu-active');
            mainMenuLinks.forEach(link => link.classList.remove('active'));
            menuBackground.style.opacity = 0;
        });
    });

    // --- Search Logic ---
    const toggleSearch = (show) => {
        if (show) {
            searchBar.classList.remove('hidden');
            searchInput.focus();
        } else {
            searchBar.classList.add('hidden');
            searchInput.value = '';
            searchResultsContainer.innerHTML = '';
        }
    };

    searchButton.addEventListener('click', () => {
        const isHidden = searchBar.classList.contains('hidden');
        toggleSearch(isHidden);
    });
    
    closeSearchButton.addEventListener('click', () => toggleSearch(false));
    searchInput.addEventListener('input', () => performSearch(searchInput.value));

    function performSearch(query) {
        searchResultsContainer.innerHTML = '';
        if (query.trim().length < 2) {
            return;
        }

        const regex = new RegExp(query, 'gi');
        const results = searchableContent.filter(item => item.content.match(regex));

        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            
            const matchIndex = result.content.search(regex);
            const startIndex = Math.max(0, matchIndex - 30);
            const endIndex = Math.min(result.content.length, matchIndex + query.length + 30);
            let snippet = '...' + result.content.substring(startIndex, endIndex) + '...';
            
            snippet = snippet.replace(regex, `<span class="search-highlight">${query}</span>`);

            resultElement.innerHTML = `
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-snippet">${snippet}</div>
            `;

            resultElement.addEventListener('click', () => {
                const targetElement = document.getElementById(result.id);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
                toggleSearch(false);
            });
            searchResultsContainer.appendChild(resultElement);
        });
    }

    // --- Animation & General Listeners ---
    window.addEventListener('scroll', () => {
        header.classList.toggle('header-scrolled', window.scrollY > 50);
        backToTopButton.style.display = window.scrollY > 300 ? 'block' : 'none';
        const scrollOffset = window.pageYOffset;
        if (heroSection) {
             heroSection.style.backgroundPositionY = `${scrollOffset * 0.5}px`;
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            if (!menuOverlay.classList.contains('invisible')) {
                toggleMenu(false);
            }
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }, 350);
            }
        });
    });

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if(entry.target.id === 'skills' && skillCountElement) {
                    animateCounter(skillCountElement, 20, 100);
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });

    function animateCounter(element, target, duration) {
        let start = 0;
        const increment = target / (duration / 10);
        const interval = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.innerText = target;
                clearInterval(interval);
            } else {
                element.innerText = Math.ceil(start);
            }
        }, 20);
    }

    // --- Project Card Expansion Logic ---
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.view-project-link')) {
                return;
            }
            card.classList.toggle('expanded');
        });
    });
});
