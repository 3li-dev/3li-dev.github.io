document.addEventListener("DOMContentLoaded", () => {

    const wall = document.getElementById("photoWall");
    if (!wall) return;

    let photos = [...wall.querySelectorAll(".photo-card")];

    const shuffleBtn = document.getElementById("shuffleBtn");

    const viewer = document.getElementById("imageViewer");
    const viewerImage = document.getElementById("viewerImage");
    const viewerCaption = document.getElementById("viewerCaption");
    const viewerLocation = document.getElementById("viewerLocation");
    const viewerCounter = document.getElementById("viewerCounter");

    const closeBtn = document.getElementById("viewerClose");
    const prevBtn = document.getElementById("viewerPrev");
    const nextBtn = document.getElementById("viewerNext");

    if (!viewer || !viewerImage) return;

    let currentIndex = 0;
    let highestZ = 20;

    let activeCard = null;
    let dragData = null;
    let suppressClick = false;

    const isMobile = () => window.innerWidth <= 760;


    // INITIAL POSITIONS

    const positions = [
        { left: 3,  top: 35,  width: 19, rotation: -5 },
        { left: 27, top: 65,  width: 18, rotation: 4 },
        { left: 52, top: 25,  width: 19, rotation: -3 },
        { left: 76, top: 75,  width: 18, rotation: 5 },

        { left: 8,  top: 320, width: 19, rotation: 4 },
        { left: 32, top: 350, width: 18, rotation: -5 },
        { left: 57, top: 315, width: 19, rotation: 5 },
        { left: 79, top: 365, width: 17, rotation: -4 },

        { left: 3,  top: 610, width: 18, rotation: -3 },
        { left: 26, top: 625, width: 19, rotation: 5 },
        { left: 51, top: 600, width: 18, rotation: -4 },
        { left: 75, top: 640, width: 19, rotation: 3 },

        { left: 20, top: 680, width: 17, rotation: -5 },
        { left: 57, top: 710, width: 18, rotation: 4 }
    ];


    function applyPositions() {

        if (isMobile()) return;

        photos.forEach((photo, index) => {

            const position = positions[index];
            if (!position) return;

            photo.style.setProperty("--left", `${position.left}%`);
            photo.style.setProperty("--top", `${position.top}px`);
            photo.style.setProperty("--width", `${position.width}%`);
            photo.style.setProperty("--rotation", `${position.rotation}deg`);

            photo.style.zIndex = index + 2;

        });

    }

    applyPositions();


    // SHUFFLE

    function shuffleArray(array) {

        const shuffled = [...array];

        for (let i = shuffled.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

        }

        return shuffled;

    }


    if (shuffleBtn) {

        shuffleBtn.addEventListener("click", () => {

            if (isMobile()) {

                const shuffled = shuffleArray(photos);

                // Keep decorative elements after the photographs.
                const firstDecoration = wall.querySelector(
                    ".wall-note, .wall-doodle, .wall-sticker"
                );

                shuffled.forEach(photo => {
                    wall.insertBefore(photo, firstDecoration);
                });

                // Update the order used by next / previous.
                photos = [...wall.querySelectorAll(".photo-card")];

                return;
            }

            photos.forEach(photo => {

                const wallWidth = wall.clientWidth;
                const wallHeight = wall.clientHeight;

                const width = photo.offsetWidth;
                const height = photo.offsetHeight;

                const maxLeft = Math.max(0, wallWidth - width);
                const maxTop = Math.max(0, wallHeight - height);

                const left = Math.random() * maxLeft;
                const top = Math.random() * maxTop;
                const rotation = Math.random() * 12 - 6;

                photo.style.setProperty(
                    "--left",
                    `${(left / wallWidth) * 100}%`
                );

                photo.style.setProperty("--top", `${top}px`);
                photo.style.setProperty("--rotation", `${rotation}deg`);

                photo.style.zIndex = ++highestZ;

            });

        });

    }


    // DRAG PHOTOGRAPHS

    photos.forEach(photo => {

        photo.addEventListener("pointerdown", event => {

            if (isMobile() || event.button !== 0) return;

            activeCard = photo;
            suppressClick = false;

            const rect = photo.getBoundingClientRect();

            dragData = {
                startX: event.clientX,
                startY: event.clientY,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top,
                moved: false
            };

            photo.style.zIndex = ++highestZ;

        });


        photo.addEventListener("pointermove", event => {

            if (activeCard !== photo || !dragData) return;

            const distanceX = event.clientX - dragData.startX;
            const distanceY = event.clientY - dragData.startY;

            if (Math.abs(distanceX) > 5 || Math.abs(distanceY) > 5) {

                dragData.moved = true;
                suppressClick = true;

            }

            if (!dragData.moved) return;

            photo.classList.add("dragging");

            const wallRect = wall.getBoundingClientRect();

            const newLeft =
                event.clientX - wallRect.left - dragData.offsetX;

            const newTop =
                event.clientY - wallRect.top - dragData.offsetY;

            photo.style.setProperty(
                "--left",
                `${(newLeft / wall.clientWidth) * 100}%`
            );

            photo.style.setProperty("--top", `${newTop}px`);

        });


        function stopDragging() {

            if (activeCard !== photo) return;

            photo.classList.remove("dragging");

            activeCard = null;
            dragData = null;

        }

        photo.addEventListener("pointerup", stopDragging);
        photo.addEventListener("pointercancel", stopDragging);

        photo.addEventListener("click", () => {

            if (suppressClick) {
                suppressClick = false;
                return;
            }

            openViewer(photos.indexOf(photo));

        });

    });


    // OPEN IMAGE VIEWER
    // Full-resolution image is requested only when a photo is clicked.

    function openViewer(index) {

        if (!photos.length) return;

        currentIndex = (index + photos.length) % photos.length;

        const photo = photos[currentIndex];
        const image = photo.querySelector("img");

        if (!image) return;

        const fullImage =
            image.dataset.full ||
            image.currentSrc ||
            image.src;

        viewerImage.onerror = () => {

            // If the full-size image fails, use the wall version.
            viewerImage.onerror = null;

            console.error("Could not load full-size photograph:", fullImage);

            viewerImage.src = image.currentSrc || image.src;

        };

        viewerImage.alt = image.alt || "Photography by Ali";
        viewerImage.decoding = "async";
        viewerImage.loading = "eager";
        viewerImage.setAttribute("fetchpriority", "high");

        viewerCaption.textContent = photo.dataset.caption || "";
        viewerLocation.textContent = photo.dataset.location || "";

        viewerCounter.textContent =
            `${String(currentIndex + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;

        // Open the viewer and request the full-size image.
        viewer.classList.add("active");
        viewer.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        viewerImage.src = fullImage;

    }


    // CLOSE VIEWER

    function closeViewer() {

        viewer.classList.remove("active");
        viewer.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

        // Remove the active full-size image source.
        viewerImage.removeAttribute("src");
        viewerImage.removeAttribute("srcset");
        viewerImage.alt = "";
        viewerImage.onerror = null;

    }


    if (closeBtn) {
        closeBtn.addEventListener("click", closeViewer);
    }

    viewer.addEventListener("click", event => {

        if (event.target === viewer) {
            closeViewer();
        }

    });


    // NEXT / PREVIOUS

    function nextPhoto() {

        openViewer(currentIndex + 1);

    }

    function previousPhoto() {

        openViewer(currentIndex - 1);

    }

    if (nextBtn) {
        nextBtn.addEventListener("click", nextPhoto);
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", previousPhoto);
    }


    // KEYBOARD CONTROLS

    document.addEventListener("keydown", event => {

        if (!viewer.classList.contains("active")) return;

        if (event.key === "Escape") {
            closeViewer();
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            nextPhoto();
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            previousPhoto();
        }

    });


    // IMAGE ERROR HANDLING

    photos.forEach(photo => {

        const image = photo.querySelector("img");
        if (!image) return;

        image.addEventListener("error", () => {

            console.error("Could not load wall photograph:", image.src);

        });

    });

});
