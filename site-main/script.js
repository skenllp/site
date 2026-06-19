/* =============================================
   SKEN LLP — script.js
   Vanilla JS: Cursor, Scroll, Parallax,
   Horizontal Pricing, Services Hover, Form
============================================= */

/* =============================================
   PAGE LOADER — hide once all assets loaded
============================================= */
(function () {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  function hideLoader() {
    loader.classList.add('loader-done');
    loader.addEventListener('transitionend', () => { if (loader.parentNode) loader.remove(); }, { once: true });
    setTimeout(() => { if (loader.parentNode) loader.remove(); }, 900);
  }

  // Safety cap: never block user longer than 5s
  const maxWait = setTimeout(hideLoader, 5000);

  window.addEventListener('load', () => {
    clearTimeout(maxWait);
    // Small delay so user sees the animation at least briefly
    setTimeout(hideLoader, 400);
  }, { once: true });
})();

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = () => window.matchMedia('(hover: none)').matches;

/* =============================================
   CUSTOM CURSOR
============================================= */
const cursor   = document.getElementById('custom-cursor');
const cursorTx = document.getElementById('cursor-text');
let mx = -300, my = -300, rx = -300, ry = -300;

if (!isTouch() && cursor) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
  });

  (function tickRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    if (cursorTx) cursorTx.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
    requestAnimationFrame(tickRing);
  })();

  // Cursor state per element
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const label = el.dataset.cursor;
      cursor.classList.add('cursor-expand');
      if (cursorTx) { cursorTx.textContent = label; cursorTx.classList.add('visible'); }
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-expand');
      if (cursorTx) { cursorTx.textContent = ''; cursorTx.classList.remove('visible'); }
    });
  });

  // Cursor on buttons
  document.querySelectorAll('.magnetic-btn, button, .book-btn, .social-link, .hotline').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-expand'));
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
}

/* =============================================
   MAGNETIC BUTTONS
============================================= */
if (!isTouch()) {
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      btn.style.transform = `translate(${dx * 0.32}px, ${dy * 0.32}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)';
      btn.style.transform  = 'translate(0,0)';
      setTimeout(() => { btn.style.transition = ''; }, 550);
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.18s ease';
    });
  });
}

/* =============================================
   HEADER — hide on scroll down / show on scroll up
============================================= */
const header = document.getElementById('main-header');
let lastY = 0, headerTick = false;

window.addEventListener('scroll', () => {
  if (!headerTick) {
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y > lastY && y > 90) { header.classList.add('hidden'); }
      else                      { header.classList.remove('hidden'); }
      lastY = y;
      headerTick = false;
    });
    headerTick = true;
  }
}, { passive: true });

/* =============================================
   MOBILE NAV
============================================= */
const menuBtn = document.querySelector('.mobile-menu-btn');
let overlay   = document.querySelector('.mobile-overlay');

// Create overlay if missing
if (!overlay) {
  overlay = document.createElement('nav');
  overlay.className = 'mobile-overlay';
  overlay.innerHTML = `
    <a href="#home"     class="nav-link" onclick="closeMenu()">Home</a>
    <a href="#about"    class="nav-link" onclick="closeMenu()">Who We Are</a>
    <a href="#services" class="nav-link" onclick="closeMenu()">Services</a>
    <a href="#studio"   class="nav-link" onclick="closeMenu()">Studio Rental</a>
    <a href="#careers"  class="nav-link" onclick="closeMenu()">Careers</a>
    <a href="#contact"  class="nav-link" onclick="closeMenu()">Contact</a>
    <a href="#studio" class="magnetic-btn btn-primary" onclick="closeMenu()" style="font-size:1rem;padding:12px 32px">Book Studio Space</a>
  `;
  document.body.appendChild(overlay);
}

function openMenu() {
  menuBtn.classList.add('open');
  overlay.classList.add('open');
  menuBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  menuBtn.classList.remove('open');
  overlay.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    overlay.classList.contains('open') ? closeMenu() : openMenu();
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeMenu();
});

/* =============================================
   SMOOTH ANCHOR SCROLL
============================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

/* =============================================
   TEXT REVEAL — wrap each .reveal-wrapper line
============================================= */
function wrapRevealLines() {
  document.querySelectorAll('.reveal-text .reveal-wrapper').forEach((wrapper, i) => {
    const text = wrapper.innerHTML;
    wrapper.innerHTML = `<span class="reveal-line" style="transition-delay:${i * 0.08}s">${text}</span>`;
  });
}
wrapRevealLines();

/* =============================================
   INTERSECTION OBSERVER — reveal animations
============================================= */
if (!prefersReduced) {
  // Reveal text blocks
  const textObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        textObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal-text').forEach(el => textObserver.observe(el));

  // Generic scroll-reveal (.sr)
  const srObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        srObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.sr').forEach(el => srObserver.observe(el));

} else {
  // Reduced motion: show all immediately
  document.querySelectorAll('.reveal-text').forEach(el => el.classList.add('revealed'));
  document.querySelectorAll('.reveal-line').forEach(el => { el.style.transform = 'none'; });
  document.querySelectorAll('.sr').forEach(el => el.classList.add('visible'));
}

/* =============================================
   PARALLAX — arch image in about section
============================================= */
const parallaxImg = document.querySelector('.parallax-img');
let paraTick = false;

if (parallaxImg && !prefersReduced && !isTouch()) {
  window.addEventListener('scroll', () => {
    if (!paraTick) {
      requestAnimationFrame(() => {
        const parent = parallaxImg.closest('.arch-mask');
        if (!parent) { paraTick = false; return; }
        const rect = parent.getBoundingClientRect();
        const vh   = window.innerHeight;
        if (rect.bottom > 0 && rect.top < vh) {
          const progress = (vh - rect.top) / (vh + rect.height); // 0 → 1
          const shift = (progress - 0.5) * -40; // ±20px
          parallaxImg.style.transform = `translateY(${shift}px)`;
        }
        paraTick = false;
      });
      paraTick = true;
    }
  }, { passive: true });
}

/* =============================================
   SERVICES — hover expand matrix
/* =============================================
   SERVICES — hover expand matrix + mouse tracking
============================================= */
const serviceCards = document.querySelectorAll('.service-card');

if (!isTouch()) {
  serviceCards.forEach(card => {
    const activate = () => {
      card.classList.add('active');
      serviceCards.forEach(s => { if (s !== card) s.classList.add('shrink'); });
    };
    const deactivate = () => {
      card.classList.remove('active');
      serviceCards.forEach(s => s.classList.remove('shrink'));
    };

    card.addEventListener('mouseenter', activate);
    card.addEventListener('mouseleave', deactivate);
    card.addEventListener('focus',      activate);
    card.addEventListener('blur',       deactivate);

    // Track mouse coordinates for interactive glow
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* =============================================
   HORIZONTAL SCROLL PRICING
============================================= */
const hSection   = document.querySelector('.horizontal-scroll-section');
const hContainer = document.querySelector('.horizontal-scroll-container');
const hProgress  = document.querySelector('.scroll-progress-fill');
let hTick = false;

function handleHScroll() {
  if (!hSection || !hContainer) return;

  // Mobile: no transform
  if (window.innerWidth <= 768) {
    hContainer.style.transform = '';
    hTick = false;
    return;
  }

  const sTop   = hSection.offsetTop;
  const sH     = hSection.offsetHeight;
  const vH     = window.innerHeight;
  const range  = sH - vH;
  const scrolled = window.scrollY;

  if (scrolled >= sTop && scrolled <= sTop + range) {
    const progress   = (scrolled - sTop) / range;
    const trackW     = hContainer.parentElement.offsetWidth;
    const totalW     = hContainer.scrollWidth;
    const maxShift   = totalW - trackW;
    hContainer.style.transform = `translateX(${-(progress * maxShift)}px)`;
    if (hProgress) hProgress.style.width = `${progress * 100}%`;
  } else if (scrolled < sTop) {
    hContainer.style.transform = 'translateX(0)';
    if (hProgress) hProgress.style.width = '0%';
  } else {
    const trackW  = hContainer.parentElement.offsetWidth;
    const totalW  = hContainer.scrollWidth;
    const maxShift = totalW - trackW;
    hContainer.style.transform = `translateX(${-maxShift}px)`;
    if (hProgress) hProgress.style.width = '100%';
  }

  hTick = false;
}

window.addEventListener('scroll', () => {
  if (!hTick) { requestAnimationFrame(handleHScroll); hTick = true; }
}, { passive: true });

handleHScroll(); // run on load

/* =============================================
   ACTIVE NAV LINK ON SCROLL
============================================= */
const sections  = document.querySelectorAll('section[id], footer[id]');
const navLinks  = document.querySelectorAll('.main-nav .nav-link');
let navTick = false;

function updateNav() {
  const mid = window.scrollY + window.innerHeight / 3;
  sections.forEach(sec => {
    if (mid >= sec.offsetTop && mid < sec.offsetTop + sec.offsetHeight) {
      const id = sec.id;
      navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
      });
    }
  });
  navTick = false;
}

window.addEventListener('scroll', () => {
  if (!navTick) { requestAnimationFrame(updateNav); navTick = true; }
}, { passive: true });

/* =============================================
   CONTACT FORM — floating labels + submit
============================================= */
document.querySelectorAll('.input-group input, .input-group textarea, .input-group select').forEach(input => {
  const group = input.closest('.input-group');

  const check = () => {
    group.classList.toggle('filled', input.value.trim().length > 0);
  };

  input.addEventListener('input',  check);
  input.addEventListener('change', check);
  check();
});

const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn = form.querySelector('.submit-btn');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      setTimeout(() => {
        btn.textContent  = '✓ Message Sent!';
        btn.style.background = '#8A9A86';
        btn.style.opacity = '1';
        setTimeout(() => {
          btn.textContent = orig;
          btn.disabled    = false;
          btn.style.background = '';
          btn.style.opacity    = '';
          form.reset();
          form.querySelectorAll('.input-group').forEach(g => g.classList.remove('filled'));
        }, 3000);
      }, 1000);
    }
  });
}

/* =============================================
   RESIZE — reset horizontal scroll on mobile
============================================= */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth <= 768 && hContainer) {
      hContainer.style.transform = '';
    }
  }, 180);
});

/* =============================================
   STUDIO GALLERY LIGHTBOX PREVIEW
============================================= */
document.addEventListener('DOMContentLoaded', () => {
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg   = document.getElementById('lightbox-img');
  const lightboxCap   = document.getElementById('lightbox-caption');
  const closeBtn      = document.querySelector('.lightbox-close');
  const prevBtn       = document.querySelector('.lightbox-prev');
  const nextBtn       = document.querySelector('.lightbox-next');
  
  const bentoItems    = Array.from(document.querySelectorAll('.bento-item'));
  
  if (!lightboxModal || bentoItems.length === 0) return;
  
  // Create gallery array map
  const gallery = bentoItems.map((item, index) => {
    const img = item.querySelector('.bento-img');
    const titleEl = item.querySelector('.bento-title');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : '',
      title: titleEl ? titleEl.textContent.trim() : 'Studio Space',
      element: item,
      index: index
    };
  });
  
  let currentIndex = 0;
  
  function showPhoto(index) {
    currentIndex = index;
    const photo = gallery[index];
    if (!photo || !photo.src) return;
    
    lightboxImg.classList.remove('loaded');
    lightboxImg.onload = () => {
      lightboxImg.classList.add('loaded');
    };
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt;
    lightboxCap.textContent = photo.title;
    
    lightboxModal.classList.add('open');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  
  function hideLightbox() {
    lightboxModal.classList.remove('open');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.classList.remove('loaded');
  }
  
  function goNext() {
    let idx = (currentIndex + 1) % gallery.length;
    showPhoto(idx);
  }
  
  function goPrev() {
    let idx = (currentIndex - 1 + gallery.length) % gallery.length;
    showPhoto(idx);
  }
  
  // Attach click to bento items
  gallery.forEach(item => {
    item.element.style.cursor = 'pointer';
    item.element.addEventListener('click', (e) => {
      e.preventDefault();
      showPhoto(item.index);
    });
  });
  
  // Close / Prev / Next events
  if (closeBtn) closeBtn.addEventListener('click', hideLightbox);
  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  if (nextBtn) nextBtn.addEventListener('click', goNext);
  
  // Close on backdrop click
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      hideLightbox();
    }
  });
  
  // Key triggers
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('open')) return;
    if (e.key === 'Escape') hideLightbox();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

  // Re-bind cursor state for custom lightbox controls if custom cursor is active
  if (typeof cursor !== 'undefined' && cursor) {
    const customButtons = [closeBtn, prevBtn, nextBtn];
    customButtons.forEach(btn => {
      if (!btn) return;
      btn.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-expand');
        const label = btn.dataset.cursor;
        if (cursorTx && label) {
          cursorTx.textContent = label;
          cursorTx.classList.add('visible');
        }
      });
      btn.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-expand');
        if (cursorTx) {
          cursorTx.textContent = '';
          cursorTx.classList.remove('visible');
        }
      });
    });
  }
});
