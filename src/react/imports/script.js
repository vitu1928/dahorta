document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Header scroll background change
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile menu toggle (simple version)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            // Logic for mobile drawer can be added here
            console.log('Mobile menu clicked');
        });
    }

    // Scroll reveal animations (simple CSS-based)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('section-hidden');
        observer.observe(section);
    });

    // Load generated images (since they have unique IDs)
    // Note: In a real scenario, these would be fixed paths or managed by a CMS.
    // I'll use the paths of the images I just generated.

    const images = {
        'img-proteico': 'bowl_proteico_1774377359541.png',
        'img-vegano': 'bowl_vegano_power_1774377373737.png',
        'img-mediterraneo': 'bowl_mediterraneo_1774377387078.png',
        'hero-img-fallback': 'hero_fresh_ingredients_1774377408448.png'
    };

    Object.entries(images).forEach(([id, path]) => {
        const el = document.getElementById(id);
        if (el) {
            // Need to construct the brainstorming folder path or just use the local relative path if copied
            // Actually, I'll copy the images to the current directory for the web app to access them.
            el.src = path;
        }
    });
});
