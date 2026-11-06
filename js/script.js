const folderButton = document.getElementById("folderButton");
const photoGallery = document.getElementById("photoGallery");
const photoSection = document.querySelector(".photo-section");

// Open and close the gallery
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


// Automatically close when scrolling away
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