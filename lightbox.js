/* ===== Lightbox JavaScript ===== */

class Lightbox {
  constructor() {
    this.currentIndex = 0;
    this.images = [];
    this.init();
  }

  init() {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "lightbox-overlay";
    overlay.className = "lightbox-overlay";
    overlay.innerHTML = `
      <div class="lightbox-container">
        <button class="lightbox-nav lightbox-prev" aria-label="السابق">&lt;</button>
        <img class="lightbox-image" src="" alt="" />
        <button class="lightbox-nav lightbox-next" aria-label="التالي">&gt;</button>
        <button class="lightbox-close" aria-label="إغلاق">&times;</button>
        <div class="lightbox-counter"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    this.overlay = overlay;
    this.image = overlay.querySelector(".lightbox-image");
    this.counter = overlay.querySelector(".lightbox-counter");
    this.prevBtn = overlay.querySelector(".lightbox-prev");
    this.nextBtn = overlay.querySelector(".lightbox-next");
    this.closeBtn = overlay.querySelector(".lightbox-close");

    this.prevBtn.addEventListener("click", () => this.prev());
    this.nextBtn.addEventListener("click", () => this.next());
    this.closeBtn.addEventListener("click", () => this.close());
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (!this.overlay.classList.contains("active")) return;
      if (e.key === "ArrowLeft") this.prev();
      if (e.key === "ArrowRight") this.next();
      if (e.key === "Escape") this.close();
    });
  }

  setImages(images) {
    this.images = images;
  }

  open(index = 0) {
    this.currentIndex = index;
    this.show();
    this.overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  show() {
    if (this.images.length === 0) return;
    const img = this.images[this.currentIndex];
    this.image.src = img.src;
    this.image.alt = img.alt;
    this.counter.textContent = `${this.currentIndex + 1} من ${
      this.images.length
    }`;
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.show();
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.show();
  }
}

// Initialize lightbox when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.lightbox = new Lightbox();
});
