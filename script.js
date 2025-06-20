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
            // Only hide background if no submenu is active
            if (!document.querySelector('.submenu-panel.active')) {
                menuBackground.style.opacity = 0;
            }
        });

        link.addEventListener('click', (e) => {
            // Handle download links separately
            if (link.hasAttribute('download')) {
                setTimeout(()=> toggleMenu(false), 500);
                return;
            }
            
            e.preventDefault();
        
            const submenuId = link.dataset.submenu;
            const submenu = document.getElementById(submenuId);
        
            // If the link has no corresponding submenu, treat it as a section link
            if (!submenu) {
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    toggleMenu(false);
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }, 350);
                }
                return; // Exit here
            }
        
            // --- Logic for links with submenus ---
            
            const isAlreadyActive = link.classList.contains('active');
        
            // First, clear any existing active states
            document.querySelectorAll('.submenu-panel.active').forEach(activeSub => {
                activeSub.classList.remove('active');
            });
            mainMenuLinks.forEach(l => {
                l.classList.remove('active');
            });
        
            // If the clicked link was NOT the one that was active, we activate it.
            // If it WAS active, the previous step already deactivated it, achieving the toggle-off effect.
            if (!isAlreadyActive) {
                link.classList.add('active');
                submenu.classList.add('active');
                
                // Update background
                const bgImage = link.dataset.bg;
                if (bgImage) {
                    menuBackground.style.backgroundImage = `url(${bgImage})`;
                    menuBackground.style.opacity = 1;
                }
            } else {
                // If we just toggled it off, ensure background is cleared.
                menuBackground.style.opacity = 0;
            }
        });
    });

    // --- Search Logic ---
    const toggleSearch = (show) => {
         if (show) {
            searchBar.classList.remove('hidden');
            // Use a short timeout to ensure the element is visible before focusing
            setTimeout(() => searchInput.focus(), 50);
        } else {
            searchBar.classList.add('hidden');
            searchInput.value = '';
            if (searchResultsContainer) {
               searchResultsContainer.innerHTML = '';
            }
        }
    };

    searchButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = searchBar.classList.contains('hidden');
        toggleSearch(isHidden);
    });
    
    closeSearchButton.addEventListener('click', () => toggleSearch(false));

    searchInput.addEventListener('input', () => {
        performSearch(searchInput.value)
    });

    function performSearch(query) {
        if(!searchResultsContainer) return;
        
        // Clear previous results
        searchResultsContainer.innerHTML = '';

        if (query.trim().length < 2) {
            return; // Don't search for very short strings
        }

        const regex = new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
        const results = searchableContent.map(item => {
            const matches = [...item.content.matchAll(regex)];
            return { ...item, matchCount: matches.length };
        }).filter(item => item.matchCount > 0);

        // Sort results by number of matches
        results.sort((a, b) => b.matchCount - a.matchCount);

        if (results.length === 0) {
            searchResultsContainer.innerHTML = `<div class="p-4 text-gray-400">No results found.</div>`;
            return;
        }

        results.forEach(result => {
            const resultElement = document.createElement('a');
            resultElement.href = `#${result.id}`;
            resultElement.className = 'block p-4 border-b border-gray-700 hover:bg-gray-600 transition-colors duration-200';
            
            // Create a snippet
            const firstMatchIndex = result.content.toLowerCase().indexOf(query.toLowerCase());
            const startIndex = Math.max(0, firstMatchIndex - 50);
            const endIndex = Math.min(result.content.length, firstMatchIndex + query.length + 50);
            let snippet = result.content.substring(startIndex, endIndex);

            // Add ellipses if the snippet is truncated
            if(startIndex > 0) snippet = "..." + snippet;
            if(endIndex < result.content.length) snippet = snippet + "...";
            
            // Highlight all matches in the snippet
            snippet = snippet.replace(regex, `<span class="bg-yellow-400 text-black font-bold">${query}</span>`);

            resultElement.innerHTML = `
                <div class="font-bold text-white">${result.title}</div>
                <div class="text-sm text-gray-400 mt-1">${snippet}</div>
            `;

            resultElement.addEventListener('click', (e) => {
                e.preventDefault();
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
            // This logic is now handled inside the menu click listener to allow for menu closing.
            // However, we keep this for any in-page links that are *not* in the menu.
            if (!this.closest('#menu-overlay') && !this.closest('#search-results-container')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
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
                // Let the link's default behavior happen (opening a new tab)
                return;
            }
            card.classList.toggle('expanded');
        });
    });
});
