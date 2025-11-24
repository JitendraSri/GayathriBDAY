// State (DOM references will be obtained after DOM is ready)
let pages = [];
let currentPage = 0;
let isMusicPlaying = false;
let audio = null;

// Typewriter text for the first page
const typewriterText = "Every journey begins with a reason…\n\nThis website is not just a wish…\n\nIt's a small tribute to someone who made my life better since 2017…\n\nSo… welcome to a special story…";

// Function to show a specific page
function showPage(index) {
    // Hide all pages
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the requested page
    pages[index].classList.add('active');

    // Special handling for specific pages
    if (index === 0) {
        // First page - start typewriter effect
        const twEl = document.getElementById('typewriter');
        if (twEl) twEl.textContent = '';
        startTypewriter(twEl);
    } else if (index === 3) {
        // Entering gallery page: ensure slider is initialized and resume slides
        if (slides.length === 0) {
            initSlider();
        } else {
            // Make sure current slide is visible and auto-advance is running
            showSlide(currentSlide);
            resetSlideInterval();
        }
    } else if (index === 4) {
        // Birthday page - start confetti and music
        startConfetti();
        toggleMusic();
    } else if (index === 5) {
        // Last page - stop music after a delay
        setTimeout(() => {
            fadeOutMusic();
        }, 2000);
    }
}

// Function to go to the next page
function nextPage() {
    if (currentPage < pages.length - 1) {
        currentPage++;
        showPage(currentPage);
    }
}

// Function to go to the previous page
function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        showPage(currentPage);
    }
}

// Function to restart the journey
function restartJourney() {
    currentPage = 0;
    showPage(currentPage);
    // Reset music to beginning if it was playing
    if (isMusicPlaying) {
        audio.currentTime = 0;
        audio.play();
    }
}

// Typewriter effect
// Typewriter effect (accept element so we can be safe when DOM wasn't ready earlier)
function startTypewriter(el) {
    const target = el || document.getElementById('typewriter');
    if (!target) return;

    let i = 0;
    const speed = 40; // typing speed in milliseconds

    function type() {
        if (i < typewriterText.length) {
            const char = typewriterText.charAt(i);
            target.innerHTML += char === '\n' ? '<br>' : char;
            i++;
            setTimeout(type, char === '\n' ? speed * 2 : speed);
        }
    }

    type();
}

// Image slider functionality
let currentSlide = 0;
let slideInterval;
let slides = [];

// Function to initialize the slides array and set up the slider
function initSlides() {
    console.log('Initializing slides...');
    slides = Array.from(document.querySelectorAll('.slide'));
    console.log(`Found ${slides.length} slides`);
    
    if (slides.length === 0) {
        console.error('No slides found!');
        return false;
    }

    // Ensure image src attributes are URL-encoded (handles spaces/special chars)
    slides.forEach(slide => {
        const imgs = Array.from(slide.querySelectorAll('img'));
        imgs.forEach(img => {
            const src = img.getAttribute('src');
            if (src) {
                const encoded = encodeURI(src);
                if (encoded !== src) {
                    img.setAttribute('src', encoded);
                }
            }

            // If an image fails to load, visually indicate it instead of disappearing
            img.addEventListener('error', () => {
                console.warn('Image failed to load:', img.getAttribute('src'));
                img.style.opacity = '0.25';
                img.style.filter = 'grayscale(100%)';
            });
        });
    });
    
    // Set initial active slide
    slides.forEach((slide, index) => {
        if (index === 0) {
            slide.style.display = 'flex';
            slide.style.opacity = '1';
        } else {
            slide.style.display = 'none';
            slide.style.opacity = '0';
        }
    });
    
    return true;
}

function showSlide(index) {
    console.log(`showSlide called with index: ${index}`);
    
    // Make sure slides are initialized
    if (slides.length === 0) {
        if (!initSlides()) return;
    }
    
    // Make sure index is within bounds
    if (index >= slides.length) {
        index = 0;
    } else if (index < 0) {
        index = slides.length - 1;
    }
    // If the requested slide is already the current one, ensure it's visible and exit
    if (index === currentSlide) {
        if (slides[index]) {
            slides[index].style.display = 'flex';
            slides[index].style.opacity = '1';
            slides[index].classList.add('active');
        }
        return;
    }
    
    console.log(`Showing slide ${index} of ${slides.length - 1}`);
    
    // Hide current active slide (capture previous index to avoid race when clicking fast)
    if (slides[currentSlide]) {
        const prevIndex = currentSlide;
        slides[prevIndex].style.opacity = '0';
        setTimeout(() => {
            if (slides[prevIndex]) {
                slides[prevIndex].style.display = 'none';
            }
        }, 500);
    }
    
    // Show the requested slide
    if (slides[index]) {
        slides[index].style.display = 'flex';
        setTimeout(() => {
            if (slides[index]) {
                slides[index].style.opacity = '1';
            }
        }, 10);
        
        // Update current slide index
        currentSlide = index;
        
        // Update active class for indicators
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });
        slides[index].classList.add('active');
    }
}

function nextSlide() {
    showSlide(currentSlide + 1);
    resetSlideInterval();
}

function prevSlide() {
    showSlide(currentSlide - 1);
    resetSlideInterval();
}

function goToSlide(index) {
    showSlide(index);
    resetSlideInterval();
}

function resetSlideInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
}

// Initialize the slider
function initSlider() {
    console.log('Initializing slider...');
    
    // Initialize slides array
    if (!initSlides()) {
        console.error('Failed to initialize slides');
        return;
    }
    
    // Show first slide
    showSlide(0);
    
    // Start auto-advancing slides
    resetSlideInterval();
    
    // Add touch events for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;
    
    const slider = document.querySelector('.slider');
    if (slider) {
        console.log('Adding touch events to slider');
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
            console.log('Touch start:', touchStartX);
        }, { passive: true });
        
        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            console.log('Touch end:', touchEndX);
            handleSwipe();
        }, { passive: true });
    } else {
        console.error('Slider element not found!');
    }
    
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance to consider it a swipe
        const swipeDistance = touchStartX - touchEndX;
        console.log('Swipe distance:', swipeDistance);
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe left - go to next slide
                console.log('Swipe left - next slide');
                nextSlide();
            } else {
                // Swipe right - go to previous slide
                console.log('Swipe right - previous slide');
                prevSlide();
            }
        }
    }
    
    console.log('Slider initialization complete');
}

// Initialize behavior when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // Obtain DOM references now that DOM is ready
    pages = Array.from(document.querySelectorAll('.page'));
    audio = document.getElementById('bgMusic');

    // Show the initial page
    showPage(currentPage);

    // Initialize the slider
    initSlider();

    // Handle slider navigation button clicks (delegated)
    document.addEventListener('click', function(event) {
        if (event.target.closest('.slider-btn.prev')) {
            event.preventDefault();
            event.stopPropagation();
            prevSlide();
        }
        if (event.target.closest('.slider-btn.next')) {
            event.preventDefault();
            event.stopPropagation();
            nextSlide();
        }
    });

    // Pause auto-advance when hovering over slider or buttons
    const hoverTargets = document.querySelectorAll('.slider, .slider-btn');
    if (hoverTargets.length) {
        hoverTargets.forEach(element => {
            element.addEventListener('mouseenter', () => {
                clearInterval(slideInterval);
            });
            element.addEventListener('mouseleave', () => {
                resetSlideInterval();
            });
        });
    }

    // Consolidated keyboard navigation
    document.addEventListener('keydown', (e) => {
        // If we are on the gallery page (index 3), arrow keys control slides
        const isGalleryPage = (currentPage === 3);

        switch (e.key) {
            case 'ArrowRight':
                if (isGalleryPage) {
                    nextSlide();
                } else if (currentPage < pages.length - 1) {
                    nextPage();
                }
                break;
            case 'ArrowLeft':
                if (isGalleryPage) {
                    prevSlide();
                } else if (currentPage > 0) {
                    prevPage();
                }
                break;
            case ' ': // spacebar -> next page
                if (!isGalleryPage && currentPage < pages.length - 1) {
                    nextPage();
                }
                break;
            case 'Home':
                currentPage = 0;
                showPage(currentPage);
                break;
            case 'End':
                currentPage = pages.length - 1;
                showPage(currentPage);
                break;
        }
    });
});

// (Hover pause is attached after DOM ready inside DOMContentLoaded)

// Background music control
function toggleMusic() {
    if (!audio) return;

    if (isMusicPlaying) {
        audio.pause();
        isMusicPlaying = false;
    } else {
        audio.play().then(() => {
            isMusicPlaying = true;
        }).catch(e => {
            console.log("Auto-play was prevented:", e);
            isMusicPlaying = false;
        });
    }
}

function fadeOutMusic() {
    if (!audio) return;

    const fadeAudio = setInterval(() => {
        if (audio.volume > 0.05) {
            audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
            audio.pause();
            audio.volume = 1.0;
            clearInterval(fadeAudio);
            isMusicPlaying = false;
        }
    }, 150);
}

// Confetti effect
function startConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    if (!confettiContainer) return;
    confettiContainer.innerHTML = ''; // Clear any existing confetti
    
    // Create confetti elements
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        // Random properties for each confetti piece
        const size = Math.random() * 15 + 5; // 5px to 20px
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        const posX = Math.random() * 100; // 0% to 100% of container width
        const delay = Math.random() * 5; // 0s to 5s delay
        const duration = Math.random() * 3 + 2; // 2s to 5s duration
        
        // Apply styles
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.left = `${posX}%`;
        confetti.style.animationDelay = `${delay}s`;
        confetti.style.animationDuration = `${duration}s`;
        
        confettiContainer.appendChild(confetti);
    }
    
    // Add CSS for confetti animation once
    if (!document.getElementById('confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
            @keyframes confetti-fall {
                0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
            
            .confetti-piece {
                position: absolute;
                border-radius: 50%;
                animation: confetti-fall linear infinite;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
}



// Touch swipe detection for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    // Ignore page-swipe when starting touch inside the slider
    if (e.target && e.target.closest && e.target.closest('.slider')) return;
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    // Ignore page-swipe when ending touch inside the slider
    if (e.target && e.target.closest && e.target.closest('.slider')) return;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance to consider it a swipe
    const swipeDistance = touchStartX - touchEndX;
    
    if (swipeDistance > swipeThreshold) {
        // Swipe left - go to next page
        if (currentPage < pages.length - 1) {
            nextPage();
        }
    } else if (swipeDistance < -swipeThreshold) {
        // Swipe right - go to previous page
        if (currentPage > 0) {
            prevPage();
        }
    }
}
