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

/* =============================================
   READING PROGRESS BAR
============================================= */
(function () {
  const fill = document.getElementById('scroll-progress-fill');
  if (!fill) return;
  let ticking = false;
  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    fill.style.width = max > 0 ? `${(scrolled / max) * 100}%` : '0%';
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

/* =============================================
   ACTIVE NAV LINK — highlight section in view
============================================= */
(function () {
  const navLinks = document.querySelectorAll('.main-nav .nav-link[href^="#"]');
  if (!navLinks.length) return;

  const map = new Map();
  navLinks.forEach(link => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) map.set(section, link);
  });
  if (!map.size) return;

  const setActive = (activeLink) => {
    navLinks.forEach(l => l.classList.toggle('active', l === activeLink));
  };

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(map.get(entry.target));
    });
  }, { rootMargin: `-${68 + 40}px 0px -55% 0px`, threshold: 0 });

  map.forEach((_, section) => navObserver.observe(section));
})();

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = () => window.matchMedia('(hover: none)').matches;

/* =============================================
   HERO VIDEO — pause when off-screen / tab hidden
   (saves CPU/battery + bandwidth on lower-end devices)
============================================= */
(function () {
  const heroVideo = document.querySelector('.hero-video');
  if (!heroVideo) return;

  const tryPlay = () => { 
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay prevented - try again on first user interaction
        document.addEventListener('touchstart', () => heroVideo.play().catch(() => {}), { once: true, passive: true });
        document.addEventListener('click', () => heroVideo.play().catch(() => {}), { once: true, passive: true });
      });
    }
  };

  // Force play immediately on load for Mac Safari
  tryPlay();

  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && document.visibilityState === 'visible') tryPlay();
        else heroVideo.pause();
      });
    }, { threshold: 0.15 });
    heroObserver.observe(heroVideo);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) heroVideo.pause();
    else if (heroVideo.getBoundingClientRect().top < window.innerHeight) tryPlay();
  });
})();

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
  overlay.setAttribute('aria-label', 'Mobile navigation');
  overlay.innerHTML = `
    <a href="#services" class="nav-link" onclick="closeMenu()">Services</a>
    <a href="#catalogues" class="nav-link" onclick="closeMenu()">Catalogues</a>
    <a href="#studio"   class="nav-link" onclick="closeMenu()">Studio Rental</a>
    <a href="#careers"  class="nav-link" onclick="closeMenu()">Careers</a>
    <a href="#contact"  class="nav-link" onclick="closeMenu()">Contact</a>
    <a href="#contact" class="magnetic-btn btn-primary" onclick="closeMenu()" style="font-size:1rem;padding:12px 32px;margin-top:8px">Get a Free Consultation</a>
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

    // Basic required-field check (native validity, since form has novalidate)
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const btn = form.querySelector('.submit-btn');

    const name    = form.querySelector('#f-name')?.value.trim()    || '';
    const phone   = form.querySelector('#f-phone')?.value.trim()   || '';
    const service = form.querySelector('#f-service')?.value        || '';
    const message = form.querySelector('#f-message')?.value.trim() || '';

    const serviceLabel = form.querySelector('#f-service')?.selectedOptions?.[0]?.textContent || service;

    const subject = `New Inquiry from ${name || 'Website Visitor'} — ${serviceLabel}`;
    const body =
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Service of Interest: ${serviceLabel}\n\n` +
      `Message:\n${message || '(no message provided)'}`;

    const mailtoLink = `mailto:hello@skenllp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (btn) {
      const orig = btn.textContent;
      btn.textContent = 'Opening your email app…';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      // Give the email client a moment to open before resetting the UI
      window.location.href = mailtoLink;

      setTimeout(() => {
        btn.textContent  = '✓ Ready to Send!';
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
      }, 600);
    } else {
      window.location.href = mailtoLink;
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

/* =============================================
   STATS BAR — COUNT-UP ANIMATION
============================================= */
(function () {
  const bar = document.querySelector('.stats-bar');
  if (!bar || prefersReduced) return;

  const items = [
    { numEl: bar.querySelector('.stat-item:nth-child(1) .stat-number'),
      sufEl: bar.querySelector('.stat-item:nth-child(1) .stat-suffix'),
      end: 50, suffix: '+' },
    { numEl: bar.querySelector('.stat-item:nth-child(2) .stat-number'),
      sufEl: bar.querySelector('.stat-item:nth-child(2) .stat-suffix'),
      end: 3, suffix: '' },
    { numEl: bar.querySelector('.stat-item:nth-child(3) .stat-number'),
      sufEl: bar.querySelector('.stat-item:nth-child(3) .stat-suffix'),
      end: 4, suffix: '' },
  ];

  let ran = false;

  const countUp = () => {
    if (ran) return;
    ran = true;
    bar.classList.add('in-view');

    items.forEach(({ numEl, sufEl, end, suffix }) => {
      if (!numEl) return;
      if (sufEl) sufEl.textContent = suffix;
      let current = 0;
      const duration = 1400;
      const step = 16;
      const increment = end / (duration / step);

      const timer = setInterval(() => {
        current += increment;
        if (current >= end) { current = end; clearInterval(timer); }
        numEl.textContent = Math.floor(current);
      }, step);
    });
  };

  new IntersectionObserver(
    ([e]) => { if (e.isIntersecting) countUp(); },
    { threshold: 0.5 }
  ).observe(bar);
})();

/* =============================================
   SERVICE CARDS — STAGGERED ENTRANCE
============================================= */
(function () {
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length || prefersReduced) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('card-visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  cards.forEach(c => observer.observe(c));
})();

/* =============================================
   SECTION HEADING — UNDERLINE DRAW
============================================= */
(function () {
  const wrappers = document.querySelectorAll(
    '.section-header, .clients-header, .careers-header, .branding-portfolio-header, .about-text-col, .horizontal-intro'
  );
  if (!wrappers.length || prefersReduced) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('heading-visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  wrappers.forEach(el => observer.observe(el));
})();

/* =============================================
   CLIENT LOGOS — ENTRANCE FADE
============================================= */
(function () {
  const section = document.querySelector('.clients-section');
  if (!section || prefersReduced) return;

  new IntersectionObserver(
    ([e]) => { if (e.isIntersecting) section.classList.add('logos-visible'); },
    { threshold: 0.15 }
  ).observe(section);
})();

/* =============================================
   CAREER CARDS — ENTRANCE ANIMATION
============================================= */
(function () {
  const cards = document.querySelectorAll('.career-card');
  if (!cards.length || prefersReduced) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('career-visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach(c => observer.observe(c));
})();

/* =============================================
   SCROLL TO TOP BUTTON
============================================= */
(function () {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Cursor expand for custom cursor
  if (typeof cursor !== 'undefined' && cursor) {
    btn.addEventListener('mouseenter', () => cursor.classList.add('cursor-expand'));
    btn.addEventListener('mouseleave', () => cursor.classList.remove('cursor-expand'));
  }
})();

/* =============================================
   BENTO ITEMS — TILT ON MOUSE MOVE
============================================= */
(function () {
  if (prefersReduced || isTouch()) return;

  document.querySelectorAll('.bento-item').forEach(item => {
    item.addEventListener('mousemove', e => {
      const r = item.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      item.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)';
      item.style.transform = '';
      setTimeout(() => { item.style.transition = ''; }, 550);
    });
  });
})();

/* =============================================
   PRICING CARDS — TILT ON MOUSE MOVE
============================================= */
(function () {
  if (prefersReduced || isTouch()) return;

  document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      const base = card.classList.contains('master-card') ? 'scale(1.04)' : '';
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) ${base} translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      card.style.transform = card.classList.contains('master-card') ? 'scale(1.04)' : '';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
})();

/* =============================================
   BRANDING PORTFOLIO — GALLERY LIGHTBOX
============================================= */
(function () {
  'use strict';

  /* ── Elements ── */
  const lb          = document.getElementById('branding-lightbox');
  const lbBackdrop  = lb ? lb.querySelector('.branding-lightbox-backdrop') : null;
  const lbClose     = document.getElementById('branding-lightbox-close');
  const lbPrev      = document.getElementById('branding-lightbox-prev');
  const lbNext      = document.getElementById('branding-lightbox-next');
  const lbImg       = document.getElementById('branding-lightbox-img');
  const lbImgWrap   = document.getElementById('branding-lightbox-img-wrap');
  const lbLoader    = lb ? lb.querySelector('.branding-lightbox-img-loader') : null;
  const lbCounter   = document.getElementById('branding-lightbox-counter');
  const lbTitle     = document.getElementById('branding-lightbox-title');
  const lbTag       = lb ? lb.querySelector('.branding-lightbox-tag') : null;
  const lbThumbsEl  = document.getElementById('branding-lightbox-thumbs');

  if (!lb || !lbImg) return;

  /* ── State ── */
  let images    = [];
  let current   = 0;
  let lastFocus = null;
  let touchStartX = 0;

  /* ── Open lightbox ── */
  function openLightbox(card) {
    try { images = JSON.parse(card.dataset.images || '[]'); } catch (e) { images = []; }
    if (!images.length) return;

    const title = card.dataset.title || 'Branding Project';
    const tag   = card.dataset.project
      ? card.dataset.project.replace(/-/g, ' ').replace(/\bBranding\b/i, '').trim()
      : 'Brand Identity';

    if (lbTitle)  lbTitle.textContent  = title;
    if (lbTag)    lbTag.textContent    = 'Brand Identity';

    current  = 0;

    buildThumbs();
    loadImage(0, null);

    lastFocus = document.activeElement;
    lb.setAttribute('aria-hidden', 'false');
    lb.classList.add('lb-open');
    document.body.style.overflow = 'hidden';

    // Focus close button
    setTimeout(() => { if (lbClose) lbClose.focus(); }, 80);
  }

  /* ── Close lightbox ── */
  function closeLightbox() {
    lb.classList.remove('lb-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  /* ── Build thumbnail strip ── */
  function buildThumbs() {
    if (!lbThumbsEl) return;
    lbThumbsEl.innerHTML = '';
    images.forEach((src, i) => {
      const btn = document.createElement('button');
      btn.className = 'lb-thumb' + (i === 0 ? ' lb-thumb-active' : '');
      btn.setAttribute('aria-label', `Go to image ${i + 1}`);
      btn.setAttribute('role', 'listitem');
      const img = document.createElement('img');
      img.src    = src;
      img.alt    = '';
      img.loading = 'lazy';
      btn.appendChild(img);
      btn.addEventListener('click', () => goToImage(i, i > current ? 'right' : 'left'));
      lbThumbsEl.appendChild(btn);
    });
  }

  /* ── Update active thumbnail ── */
  function setActiveThumb(idx) {
    if (!lbThumbsEl) return;
    lbThumbsEl.querySelectorAll('.lb-thumb').forEach((t, i) => {
      t.classList.toggle('lb-thumb-active', i === idx);
    });
    // Scroll active thumb into view
    const thumb = lbThumbsEl.children[idx];
    if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  /* ── Load an image ── */
  function loadImage(idx, direction) {
    if (!images[idx]) return;

    // Show loader
    if (lbLoader) lbLoader.classList.add('lb-spinning');
    if (lbImg)    lbImg.classList.add('lb-loading');

    const imgSrc = images[idx];
    const preload = new Image();
    preload.onload = () => {
      if (!lbImg) return;
      lbImg.src = preload.src;
      lbImg.alt = `Image ${idx + 1} of ${images.length}`;
      lbImg.classList.remove('lb-loading');
      if (lbLoader) lbLoader.classList.remove('lb-spinning');

      // Slide animation
      if (direction) {
        lbImg.classList.remove('lb-anim-right', 'lb-anim-left');
        void lbImg.offsetWidth; // reflow
        lbImg.classList.add(direction === 'right' ? 'lb-anim-right' : 'lb-anim-left');
      }
    };
    preload.onerror = () => {
      if (lbImg)    lbImg.classList.remove('lb-loading');
      if (lbLoader) lbLoader.classList.remove('lb-spinning');
    };
    preload.src = imgSrc;

    current = idx;
    if (lbCounter) lbCounter.textContent = `${idx + 1} / ${images.length}`;
    setActiveThumb(idx);

    // Nav button state
    if (lbPrev) lbPrev.disabled = (idx === 0);
    if (lbNext) lbNext.disabled = (idx === images.length - 1);
  }

  /* ── Go to specific image ── */
  function goToImage(idx, direction) {
    if (idx < 0 || idx >= images.length) return;
    const dir = direction || (idx > current ? 'right' : 'left');
    loadImage(idx, dir);
  }

  /* ── Navigate ── */
  function goPrev() { if (current > 0) goToImage(current - 1, 'left'); }
  function goNext() { if (current < images.length - 1) goToImage(current + 1, 'right'); }

  /* ── Wire card clicks ── */
  document.querySelectorAll('.branding-card').forEach(card => {
    card.addEventListener('click', () => openLightbox(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(card);
      }
    });
  });

  /* ── Wire lightbox controls ── */
  if (lbClose)    lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);
  if (lbPrev)     lbPrev.addEventListener('click', goPrev);
  if (lbNext)     lbNext.addEventListener('click', goNext);

  /* ── Keyboard navigation ── */
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('lb-open')) return;
    switch (e.key) {
      case 'Escape':    closeLightbox();   break;
      case 'ArrowLeft': goPrev();          break;
      case 'ArrowRight':goNext();          break;
    }
  });

  /* ── Touch/swipe support ── */
  if (lbImgWrap) {
    lbImgWrap.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    lbImgWrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        dx < 0 ? goNext() : goPrev();
      }
    }, { passive: true });
  }

  /* ── Trap focus inside lightbox ── */
  lb.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = lb.querySelectorAll(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  });

  /* ── Entrance animation for branding cards ── */
  if (!prefersReduced) {
    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          cardObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.branding-card.sr').forEach(c => cardObserver.observe(c));
  }

})();


/* =============================================
   CATALOGUE CARDS — ENTRANCE ANIMATION
============================================= */
(function () {
  const cards = document.querySelectorAll('.catalogue-card');
  if (!cards.length || prefersReduced) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach(c => observer.observe(c));
})();

/* =============================================
   PDF CATALOGUE VIEWER
============================================= */
(function () {
  'use strict';

  // Defer everything until DOM + all scripts are fully ready
  function init() {
    // PDF.js must be present
    if (typeof pdfjsLib === 'undefined') {
      console.warn('PDF.js not loaded — catalogue viewer disabled.');
      return;
    }

    // Point the worker at the matching version
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    /* ── DOM refs ── */
    const modal        = document.getElementById('catalogue-viewer-modal');
    const backdrop     = modal && modal.querySelector('.viewer-backdrop');
    const viewerContainer = modal && modal.querySelector('.viewer-container');
    const closeBtn     = document.getElementById('viewer-close-btn');
    const downloadBtn  = document.getElementById('viewer-download-btn');
    const fullscreenBtn = document.getElementById('viewer-fullscreen-btn');
    const prevBtn      = document.getElementById('viewer-prev-btn');
    const nextBtn      = document.getElementById('viewer-next-btn');
    const zoomInBtn    = document.getElementById('viewer-zoom-in');
    const zoomOutBtn   = document.getElementById('viewer-zoom-out');
    const canvas       = document.getElementById('pdf-canvas');
    const canvasWrap   = document.getElementById('viewer-canvas-wrapper');
    const loadingEl    = document.getElementById('viewer-loading');
    const titleEl      = document.getElementById('viewer-title');
    const curPageEl    = document.getElementById('viewer-current-page');
    const totPageEl    = document.getElementById('viewer-total-pages');
    const zoomLbl      = document.getElementById('viewer-zoom-level');
    const ctaBtn       = document.getElementById('viewer-cta-btn');

    if (!modal || !canvas) return;

    const ctx = canvas.getContext('2d');

    /* ── State ── */
    let pdfDoc       = null;
    let currentPage  = 1;
    let totalPages   = 0;
    let renderTask   = null; // track in-flight render so we can cancel
    let currentPdf   = '';
    let lastFocus    = null;
    let touchStartX  = 0;

    /* ── Helpers ── */
    function showLoading(yes) {
      if (!loadingEl) return;
      loadingEl.classList.toggle('hidden', !yes);
    }

    function updateNav() {
      if (prevBtn) prevBtn.disabled = (currentPage <= 1);
      if (nextBtn) nextBtn.disabled = (currentPage >= totalPages);
    }

    /* ── Compute the best scale so the page fits fully inside the wrapper ── */
    function fitScale(page) {
      // natural page size at scale=1
      const viewport1 = page.getViewport({ scale: 1 });
      const availableW = canvasWrap.clientWidth - 48;  // minus padding
      const availableH = canvasWrap.clientHeight - 48; // minus padding
      const fitW = availableW / viewport1.width;
      const fitH = availableH > 0 ? availableH / viewport1.height : fitW;
      // use the smaller ratio so the whole page fits both ways (no overflow)
      const fit = Math.min(fitW, fitH);
      // clamp between 0.5 and 3
      return Math.min(3, Math.max(0.5, fit));
    }

    /* ── Render a page ── */
    async function renderPage(pageNum) {
      if (!pdfDoc) return;

      // Cancel any in-flight render
      if (renderTask) {
        renderTask.cancel();
        renderTask = null;
      }

      showLoading(true);

      try {
        const page     = await pdfDoc.getPage(pageNum);
        const scale    = fitScale(page);
        const viewport = page.getViewport({ scale });

        // Set the canvas pixel dimensions exactly as PDF.js needs
        canvas.width  = viewport.width;
        canvas.height = viewport.height;

        // Clear previous content
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;
        renderTask = null;

        currentPage = pageNum;
        if (curPageEl) curPageEl.textContent = pageNum;
        if (zoomLbl)   zoomLbl.textContent   = Math.round(scale * 100) + '%';
        updateNav();
      } catch (err) {
        // RenderingCancelledException is expected when we cancel — ignore it
        if (err && err.name !== 'RenderingCancelledException') {
          console.error('PDF render error:', err);
          if (loadingEl) {
            loadingEl.innerHTML = '<p style="color:#D35400;font-weight:600">Could not render this page.</p>';
            loadingEl.classList.remove('hidden');
            return;
          }
        }
      }

      showLoading(false);
    }

    /* ── Open viewer ── */
    async function openViewer(pdfUrl, title, pagesHint) {
      currentPdf   = pdfUrl;
      currentPage  = 1;
      pdfDoc       = null;

      // Reset UI
      if (titleEl)   titleEl.textContent   = title;
      if (curPageEl) curPageEl.textContent = '1';
      if (totPageEl) totPageEl.textContent = pagesHint || '…';
      if (zoomLbl)   zoomLbl.textContent   = '…';
      canvas.width  = 0;
      canvas.height = 0;

      lastFocus = document.activeElement;
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      showLoading(true);

      // Wire download button
      if (downloadBtn) {
        downloadBtn.onclick = () => {
          const a = document.createElement('a');
          a.href     = currentPdf;
          a.download = decodeURIComponent(currentPdf.split('/').pop());
          a.click();
        };
      }

      // Focus close button once open
      setTimeout(() => { if (closeBtn) closeBtn.focus(); }, 80);

      try {
        // Guard against the page being opened directly via file:// — PDF.js'
        // worker + range-request fetches are blocked by browsers in that mode.
        if (location.protocol === 'file:') {
          throw new Error('LOCAL_FILE_PROTOCOL');
        }
        // Encode spaces/special chars safely without double-encoding a URL
        // that may already contain %-escapes.
        const safeUrl = encodeURI(decodeURI(pdfUrl));
        pdfDoc = await pdfjsLib.getDocument({ url: safeUrl }).promise;
        totalPages = pdfDoc.numPages;
        if (totPageEl) totPageEl.textContent = totalPages;
        await renderPage(1);
      } catch (err) {
        console.error('Failed to load PDF:', err);
        showLoading(false);
        if (loadingEl) {
          const isFileProtocol = location.protocol === 'file:' || (err && err.message === 'LOCAL_FILE_PROTOCOL');
          loadingEl.innerHTML = isFileProtocol
            ? `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D35400" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style="color:#D35400;font-weight:600;text-align:center;max-width:360px">This page was opened directly from disk (file://), which browsers block PDF.js from reading.<br><span style="font-size:0.8rem;font-weight:400;color:#4a5f72">Please serve the site with a local server (e.g. <code>npx serve</code> or <code>python3 -m http.server</code>) or view it on the live domain.</span></p>`
            : `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D35400" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style="color:#D35400;font-weight:600;text-align:center">Failed to load PDF.<br><span style="font-size:0.8rem;font-weight:400;color:#4a5f72">Check that the file exists in the assets/ folder.</span></p>`;
          loadingEl.classList.remove('hidden');
        }
      }
    }

    /* ── Close viewer ── */
    function closeViewer() {
      if (renderTask) { renderTask.cancel(); renderTask = null; }
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) exit.call(document);
      }
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      pdfDoc      = null;
      currentPdf  = '';
      if (lastFocus) lastFocus.focus();
    }

    /* ── Page navigation ── */
    function goTo(delta) {
      const target = currentPage + delta;
      if (target >= 1 && target <= totalPages) renderPage(target);
    }

    /* ── Wire catalogue cards ── */
    document.querySelectorAll('.catalogue-card').forEach(card => {
      const viewBtn = card.querySelector('.catalogue-view-btn');
      if (!viewBtn) return;

      const handleOpen = () => {
        const url   = card.dataset.pdf;
        const title = card.dataset.title;
        const pages = card.dataset.pages;
        if (url && title) openViewer(url, title, pages);
      };

      viewBtn.addEventListener('click', e => { e.stopPropagation(); handleOpen(); });
      card.addEventListener('click', handleOpen);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpen(); }
      });
    });

    /* ── Wire modal controls ── */
    if (closeBtn)    closeBtn.addEventListener('click', closeViewer);
    if (backdrop)    backdrop.addEventListener('click', closeViewer);
    if (prevBtn)     prevBtn.addEventListener('click', () => goTo(-1));
    if (nextBtn)     nextBtn.addEventListener('click', () => goTo(+1));
    if (zoomInBtn)   zoomInBtn.addEventListener('click', async () => {
      if (!pdfDoc) return;
      const page = await pdfDoc.getPage(currentPage);
      const natural = page.getViewport({ scale: 1 }).width;
      const curScale = canvas.width / natural;
      if (curScale < 3) {
        const newScale = Math.min(3, curScale + 0.25);
        const vp = page.getViewport({ scale: newScale });
        canvas.width  = vp.width;
        canvas.height = vp.height;
        if (renderTask) renderTask.cancel();
        renderTask = page.render({ canvasContext: ctx, viewport: vp });
        await renderTask.promise;
        renderTask = null;
        if (zoomLbl) zoomLbl.textContent = Math.round(newScale * 100) + '%';
      }
    });
    if (zoomOutBtn)  zoomOutBtn.addEventListener('click', async () => {
      if (!pdfDoc) return;
      const page = await pdfDoc.getPage(currentPage);
      const natural = page.getViewport({ scale: 1 }).width;
      const curScale = canvas.width / natural;
      if (curScale > 0.5) {
        const newScale = Math.max(0.5, curScale - 0.25);
        const vp = page.getViewport({ scale: newScale });
        canvas.width  = vp.width;
        canvas.height = vp.height;
        if (renderTask) renderTask.cancel();
        renderTask = page.render({ canvasContext: ctx, viewport: vp });
        await renderTask.promise;
        renderTask = null;
        if (zoomLbl) zoomLbl.textContent = Math.round(newScale * 100) + '%';
      }
    });

    /* ── Fullscreen toggle ── */
    function isFullscreen() {
      return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    function toggleFullscreen() {
      if (!viewerContainer) return;
      if (!isFullscreen()) {
        const req = viewerContainer.requestFullscreen || viewerContainer.webkitRequestFullscreen;
        if (req) req.call(viewerContainer);
      } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) exit.call(document);
      }
    }

    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

    ['fullscreenchange', 'webkitfullscreenchange'].forEach(evt => {
      document.addEventListener(evt, () => {
        // Re-fit the current page once the container has finished resizing
        setTimeout(() => { if (pdfDoc) renderPage(currentPage); }, 100);
      });
    });

    /* ── CTA button ── */
    if (ctaBtn) {
      ctaBtn.addEventListener('click', e => {
        e.preventDefault();
        closeViewer();
        setTimeout(() => {
          const contact = document.getElementById('contact');
          if (contact) {
            window.scrollTo({
              top: contact.getBoundingClientRect().top + window.scrollY - 68,
              behavior: 'smooth'
            });
          }
        }, 420);
      });
    }

    /* ── Keyboard ── */
    document.addEventListener('keydown', e => {
      if (modal.getAttribute('aria-hidden') === 'true') return;
      switch (e.key) {
        case 'Escape':      closeViewer(); break;
        case 'ArrowLeft':   goTo(-1);      break;
        case 'ArrowRight':  goTo(+1);      break;
      }
    });

    /* ── Ctrl + Wheel zoom ── */
    if (canvasWrap) {
      canvasWrap.addEventListener('wheel', e => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        // trigger the zoom buttons programmatically
        if (e.deltaY < 0) zoomInBtn && zoomInBtn.click();
        else              zoomOutBtn && zoomOutBtn.click();
      }, { passive: false });
    }

    /* ── Touch swipe for page navigation ── */
    if (canvasWrap) {
      canvasWrap.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      canvasWrap.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) goTo(dx < 0 ? 1 : -1);
      }, { passive: true });
    }

    /* ── Focus trap ── */
    modal.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const els   = modal.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      const first = els[0];
      const last  = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* ── Re-render on window resize (so fit-scale stays correct) ── */
    let resizeDebounce;
    window.addEventListener('resize', () => {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        if (modal.getAttribute('aria-hidden') === 'false' && pdfDoc) {
          renderPage(currentPage);
        }
      }, 250);
    });
  }

  // Run after everything (DOM + external scripts) is fully loaded
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init, { once: true });
  }

})();
