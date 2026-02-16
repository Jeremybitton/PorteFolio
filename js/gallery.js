document.addEventListener('DOMContentLoaded', () => {
    // Inject lightbox HTML with navigation
    const lightboxHTML = `
        <div id="lightbox" class="lightbox-modal">
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <button class="lightbox-nav lightbox-prev" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>
            <img class="lightbox-content" id="lightbox-img" alt="Enlarged view">
            <button class="lightbox-nav lightbox-next" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    // State
    let currentGroupImages = [];
    let currentIndex = 0;

    // Helper to find all gallery images in the same card container
    function getImagesInSameCard(clickedImg) {
        // Find closest parent that acts as a container card
        const card = clickedImg.closest('.project-card'); 
        if (!card) return [clickedImg]; // Fallback if not inside a card
        
        // Convert NodeList to Array to use array methods
        return Array.from(card.querySelectorAll('.gallery-img'));
    }

    function updateLightboxImage() {
        if (currentGroupImages.length === 0) return;
        
        const img = currentGroupImages[currentIndex];
        lightboxImg.src = img.src;
        
        // Hide/Show arrows based on group size
        if (currentGroupImages.length > 1) {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }

    function showNext() {
        if (currentGroupImages.length <= 1) return;
        currentIndex = (currentIndex + 1) % currentGroupImages.length;
        updateLightboxImage();
    }

    function showPrev() {
        if (currentGroupImages.length <= 1) return;
        currentIndex = (currentIndex - 1 + currentGroupImages.length) % currentGroupImages.length;
        updateLightboxImage();
    }

    // Attach click events to all gallery images
    const images = document.querySelectorAll('.gallery-img');
    images.forEach(img => {
        img.addEventListener('click', () => {
            // Identify the group
            currentGroupImages = getImagesInSameCard(img);
            // Find index of clicked image in that group
            currentIndex = currentGroupImages.indexOf(img);

            updateLightboxImage();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    // Close functionality
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        // Reset src after transition to avoid flicker if re-opened ? 
        // Better leave it, or clear it after timeout.
        setTimeout(() => { lightboxImg.src = ''; }, 300); 
    };

    closeBtn.addEventListener('click', closeLightbox);
    
    // Close on click outside image (on the backdrop)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Navigation events
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing
        showPrev();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing
        showNext();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
});
