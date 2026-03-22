document.addEventListener('DOMContentLoaded', () => {
    // Inject lightbox HTML with navigation, caption and counter
    const lightboxHTML = `
        <div id="lightbox" class="lightbox-modal">
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <button class="lightbox-nav lightbox-prev" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>
            <img class="lightbox-content" id="lightbox-img" alt="Enlarged view">
            <button class="lightbox-nav lightbox-next" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>
            <div class="lightbox-footer">
                <span class="lightbox-caption" id="lightbox-caption"></span>
                <span class="lightbox-counter" id="lightbox-counter"></span>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const caption     = document.getElementById('lightbox-caption');
    const counter     = document.getElementById('lightbox-counter');
    const closeBtn    = document.querySelector('.lightbox-close');
    const prevBtn     = document.querySelector('.lightbox-prev');
    const nextBtn     = document.querySelector('.lightbox-next');

    let currentGroupImages = [];
    let currentIndex = 0;

    // Only include images whose container is visible
    function getVisibleImagesInCard(clickedImg) {
        let container = clickedImg.closest('.project-card');
        if (!container) container = clickedImg.closest('#gallery-container');
        if (!container) return [clickedImg];
        
        return Array.from(container.querySelectorAll('.gallery-img')).filter(img => {
            const item = img.closest('.gallery-item');
            return !item || !item.classList.contains('hide');
        });
    }

    function updateLightbox() {
        if (currentGroupImages.length === 0) return;

        const img = currentGroupImages[currentIndex];
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';

        // Caption: read from sibling .gallery-title
        const wrapper = img.closest('.gallery-card') || img.parentElement;
        const titleEl = wrapper ? wrapper.querySelector('.gallery-title') : null;
        caption.textContent = titleEl ? titleEl.textContent.trim() : (img.alt || '');

        // Counter
        if (currentGroupImages.length > 1) {
            counter.textContent = `${currentIndex + 1} / ${currentGroupImages.length}`;
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        } else {
            counter.textContent = '';
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }

        // Disable buttons at the boundaries (no loop)
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === currentGroupImages.length - 1;
        prevBtn.style.opacity = prevBtn.disabled ? '0.25' : '1';
        nextBtn.style.opacity = nextBtn.disabled ? '0.25' : '1';
    }

    function showNext() {
        if (currentIndex >= currentGroupImages.length - 1) return;
        currentIndex++;
        updateLightbox();
    }

    function showPrev() {
        if (currentIndex <= 0) return;
        currentIndex--;
        updateLightbox();
    }

    // Attach click events to all gallery images
    const images = document.querySelectorAll('.gallery-img');
    images.forEach(img => {
        img.addEventListener('click', () => {
            currentGroupImages = getVisibleImagesInCard(img);
            currentIndex = currentGroupImages.indexOf(img);
            if (currentIndex === -1) currentIndex = 0;

            updateLightbox();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { lightboxImg.src = ''; }, 300);
    };

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

    prevBtn.addEventListener('click', e => { e.stopPropagation(); showPrev(); });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); showNext(); });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape')      closeLightbox();
        if (e.key === 'ArrowLeft')   showPrev();
        if (e.key === 'ArrowRight')  showNext();
    });
});
