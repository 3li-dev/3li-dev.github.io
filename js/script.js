
const folderButton = document.getElementById("folderButton");
const photoGallery = document.getElementById("photoGallery");
const photoSection = document.querySelector(".photo-section");
const heroNav = document.querySelector(".hero-nav");
const aboutSection = document.querySelector(".about-me");

// Navigation behaviour
function updateNavigation() {
    if (!heroNav || !aboutSection || !photoSection) return;

    const about = aboutSection.getBoundingClientRect();
    const photo = photoSection.getBoundingClientRect();

    const aboutVisible =
        about.top < window.innerHeight && about.bottom > 0;

    const photoVisible =
        photo.top < window.innerHeight && photo.bottom > 0;

    heroNav.classList.toggle("nav-about", aboutVisible && !photoVisible);
    heroNav.classList.toggle("nav-hidden", photoVisible);
}

window.addEventListener("scroll", updateNavigation);
window.addEventListener("resize", updateNavigation);

updateNavigation();

// Open and close the gallery
if (folderButton && photoGallery) {
    folderButton.addEventListener("click", async () => {

        if (photoGallery.classList.contains("open")) {
            photoGallery.classList.remove("open");
            folderButton.setAttribute("aria-expanded", "false");
            return;
        }

        const photos = document.querySelectorAll(".scattered-photo");

        await Promise.all(
            [...photos].map(photo => photo.decode().catch(() => {}))
        );

        photoGallery.classList.add("open");
        folderButton.setAttribute("aria-expanded", "true");
    });
}

// Automatically close gallery when scrolling away
if (photoSection && photoGallery && folderButton) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                photoGallery.classList.remove("open");
                folderButton.setAttribute("aria-expanded", "false");
            }
        });
    }, {
        threshold: 0.1
    });

    observer.observe(photoSection);
}
