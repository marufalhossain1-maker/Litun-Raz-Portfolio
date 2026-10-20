
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  // ------------------------------
  // CURRENT YEAR
  // ------------------------------

  const year = $("#currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // ------------------------------
  // MOBILE NAVIGATION
  // ------------------------------

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");
  const navItems = $$(".nav-link, .nav-cta");

  function closeMenu() {
    if (!menuToggle || !navLinks) return;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navLinks.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen =
        menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute(
        "aria-expanded",
        String(!isOpen)
      );

      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Open navigation" : "Close navigation"
      );

      navLinks.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    navItems.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (
        navLinks.classList.contains("is-open") &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 640) {
        closeMenu();
      }
    });
  }

  // ------------------------------
  // SCROLL PROGRESS
  // ------------------------------

  const scrollProgress = $("#scrollProgress");

  let scrollTicking = false;

  function updateScrollProgress() {
    if (!scrollProgress) return;

    const scrollableHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const progress =
      scrollableHeight > 0
        ? (window.scrollY / scrollableHeight) * 100
        : 0;

    scrollProgress.style.width = `${progress}%`;
    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollProgress);
        scrollTicking = true;
      }
    },
    { passive: true }
  );

  updateScrollProgress();

  // ------------------------------
  // REVEAL ON SCROLL
  // ------------------------------

  const revealElements = $$(".reveal");

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -25px 0px"
      }
    );

    revealElements.forEach((element, index) => {
      // A small stagger without a heavy animation library.
      element.style.transitionDelay =
        `${Math.min(index % 4, 3) * 65}ms`;

      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  // ------------------------------
  // ACTIVE NAVIGATION
  // ------------------------------

  const sections = $$("main section[id]");
  const sectionLinks = $$(".nav-link");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          sectionLinks.forEach((link) => {
            const active =
              link.getAttribute("href") ===
              `#${entry.target.id}`;

            link.classList.toggle("active", active);
          });
        });
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  // ------------------------------
  // SUBTLE 3D HERO EFFECT
  // Desktop / mouse only
  // ------------------------------

  const heroVisual = $("#heroVisual");
  const heroFrame = $(".hero-frame", heroVisual || document);

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  if (heroVisual && heroFrame && finePointer.matches && !reduceMotion) {
    heroVisual.addEventListener("pointermove", (event) => {
      const rect = heroVisual.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) / rect.width - 0.5;

      const y =
        (event.clientY - rect.top) / rect.height - 0.5;

      const rotateY = x * 7;
      const rotateX = y * -7;

      heroFrame.style.transform =
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroVisual.addEventListener("pointerleave", () => {
      heroFrame.style.transform =
        "rotateX(0deg) rotateY(0deg)";
    });
  }

  // ------------------------------
  // PHOTO GALLERY
  // ------------------------------

  const galleryItems = $$(".gallery-item");
  const photoCount = $("#photoCount");

  const photos = galleryItems.map((item) => ({
    element: item,
    image: $("img", item),
    title: item.dataset.title || "Untitled",
    src: item.dataset.image
  }));

  if (photoCount) {
    photoCount.textContent =
      `${String(photos.length).padStart(2, "0")} FRAMES`;
  }

  // ------------------------------
  // LIGHTBOX
  // ------------------------------

  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxCaption = $("#lightboxCaption");
  const lightboxCounter = $("#lightboxCounter");
  const lightboxClose = $("#lightboxClose");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");

  let activePhoto = 0;
  let lastFocusedElement = null;

  function renderPhoto(index) {
    if (!photos.length || !lightboxImage) return;

    activePhoto = (index + photos.length) % photos.length;

    const photo = photos[activePhoto];

    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.title;

    if (lightboxCaption) {
      lightboxCaption.textContent = photo.title;
    }

    if (lightboxCounter) {
      lightboxCounter.textContent =
        `${String(activePhoto + 1).padStart(2, "0")} / ` +
        `${String(photos.length).padStart(2, "0")}`;
    }

    if (lightboxPrev) {
      lightboxPrev.disabled = photos.length < 2;
    }

    if (lightboxNext) {
      lightboxNext.disabled = photos.length < 2;
    }
  }

  function openLightbox(index) {
    if (!lightbox || !photos.length) return;

    lastFocusedElement = document.activeElement;

    renderPhoto(index);

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");

    if (lightboxClose) {
      lightboxClose.focus();
    }
  }

  function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      openLightbox(index);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);

  lightboxPrev?.addEventListener("click", () => {
    renderPhoto(activePhoto - 1);
  });

  lightboxNext?.addEventListener("click", () => {
    renderPhoto(activePhoto + 1);
  });

  // Clicking the backdrop closes the viewer.
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      renderPhoto(activePhoto - 1);
    }

    if (event.key === "ArrowRight") {
      renderPhoto(activePhoto + 1);
    }
  });

  // Touch swipe support for the photo viewer.
  let touchStartX = 0;
  let touchStartY = 0;

  lightbox?.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    },
    { passive: true }
  );

  lightbox?.addEventListener(
    "touchend",
    (event) => {
      const deltaX =
        event.changedTouches[0].clientX - touchStartX;

      const deltaY =
        event.changedTouches[0].clientY - touchStartY;

      // Ignore normal vertical scrolling gestures.
      if (
        Math.abs(deltaX) < 55 ||
        Math.abs(deltaX) < Math.abs(deltaY) * 1.3
      ) {
        return;
      }

      if (deltaX < 0) {
        renderPhoto(activePhoto + 1);
      } else {
        renderPhoto(activePhoto - 1);
      }
    },
    { passive: true }
  );

  // Avoid showing a broken-image icon when an image is missing.
  // Replace the missing file rather than silently using random images.
  $$("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.classList.add("image-missing");
      img.setAttribute("data-image-error", "true");
    });
  });

  console.log("Litun Raz website initialized.");
});

// Disable right-click context menu
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});