/* ===========================================
   Omotra Website — Main JavaScript
   =========================================== */

document.addEventListener('DOMContentLoaded', function() {
  
  // ===========================================
  // Navigation
  // ===========================================
  const nav = document.querySelector('.nav');
  const mobileBtn = document.querySelector('.nav-mobile-btn');
  const mobileMenu = document.querySelector('.nav-mobile');
  
  // Scroll effect on nav
  let lastScroll = 0;
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
  
  // Mobile menu toggle
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('open');
      const isOpen = mobileMenu.classList.contains('open');
      mobileBtn.innerHTML = isOpen ? '✕' : '☰';
      mobileBtn.setAttribute('aria-expanded', isOpen);
      if (isOpen) {
        var firstLink = mobileMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        mobileBtn.innerHTML = '☰';
        mobileBtn.setAttribute('aria-expanded', 'false');
        mobileBtn.focus();
      }
    });
  }
  
  // ===========================================
  // Hero Parallax Effect
  // ===========================================
  const heroBg = document.querySelector('.hero-bg');
  const heroGrid = document.querySelector('.hero-grid');
  const floatingElements = document.querySelectorAll('.float-element');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  
  if (heroBg || floatingElements.length > 0) {
    var parallaxTicking = false;
    window.addEventListener('scroll', function() {
      if (!parallaxTicking) {
        window.requestAnimationFrame(function() {
          var scrollY = window.pageYOffset;

          // Background parallax
          if (heroBg) {
            heroBg.style.transform = 'translateY(' + (scrollY * 0.05) + 'px) scale(' + (1 + scrollY / 2000) + ')';
            heroBg.style.opacity = Math.max(0.3, 1 - scrollY / 800);
          }

          // Grid parallax
          if (heroGrid) {
            heroGrid.style.transform = 'translateY(' + (scrollY * 0.1) + 'px)';
            heroGrid.style.opacity = Math.max(0.2, 0.5 - scrollY / 1000);
          }

          // Floating elements parallax
          floatingElements.forEach(function(el, index) {
            var speeds = [0.4, 0.55, 0.3, 0.45, 0.35, 0.5];
            var xSpeeds = [0.1, -0.08, 0.15, -0.12, 0, 0];
            var rotations = [0.03, -0.02, 0, 0, -0.025, 0];

            var speed = speeds[index] || 0.4;
            var xSpeed = xSpeeds[index] || 0;
            var rotation = rotations[index] || 0;

            var yOffset = -scrollY * speed;
            var xOffset = scrollY * xSpeed;
            var rotate = scrollY * rotation;
            var opacity = Math.max(0, 1 - scrollY / 400);

            el.style.transform = 'translateY(' + yOffset + 'px) translateX(' + xOffset + 'px) rotate(' + rotate + 'deg)';
            el.style.opacity = opacity;
          });

          // Scroll indicator fade
          if (scrollIndicator) {
            scrollIndicator.style.opacity = Math.max(0, 1 - scrollY / 150);
          }

          parallaxTicking = false;
        });
        parallaxTicking = true;
      }
    });
  }
  
  // ===========================================
  // Fade In On Scroll
  // ===========================================
  const fadeElements = document.querySelectorAll('.fade-in');
  
  const fadeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '-50px'
  });
  
  fadeElements.forEach(function(el) {
    fadeObserver.observe(el);
  });
  
  // ===========================================
  // Contact Form — Vercel Serverless API
  // ===========================================
  
  var contactForm = document.getElementById('contact-form');
  var formSuccess = document.querySelector('.form-success');
  var formError = document.querySelector('.form-error');
  
  // Anti-spam: Record when page loaded (bots submit too fast)
  var formLoadTime = Date.now();
  var MIN_SUBMIT_TIME = 3000; // Minimum 3 seconds before submission allowed
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Hide any previous error messages
      if (formError) {
        formError.style.display = 'none';
      }
      
      // Get form data
      var formData = new FormData(contactForm);
      var data = Object.fromEntries(formData.entries());
      
      // Anti-spam: Check if form was submitted too quickly (likely a bot)
      var timeSinceLoad = Date.now() - formLoadTime;
      if (timeSinceLoad < MIN_SUBMIT_TIME) {
        // Silently reject - show fake success to not alert bots
        contactForm.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
        return;
      }
      
      // Honeypot spam check - if this field is filled, it's a bot
      if (data.website && data.website.length > 0) {
        // Silently reject spam but show success to not alert bots
        contactForm.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
        return;
      }
      
      // Remove honeypot field from data
      delete data.website;
      
      // Basic validation
      if (!data.name || data.name.length < 2) {
        alert('Please enter your name (at least 2 characters)');
        return;
      }
      
      if (!data.email || !isValidEmail(data.email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      if (!data.enquiryType) {
        alert('Please select what you are looking for');
        return;
      }
      
      if (!data.message || data.message.length < 10) {
        alert('Please enter a message (at least 10 characters)');
        return;
      }
      
      // Add metadata
      data.timestamp = new Date().toISOString();
      data.source = window.location.href;
      
      // Show loading state
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;
      
      // Submit form to API
      submitFormData(data, submitBtn, originalText, formSuccess, formError, contactForm);
    });
  }
  
  function submitFormData(data, submitBtn, originalText, formSuccess, formError, contactForm) {
    const showError = function(message) {
      if (formError) {
        formError.textContent = message || 'Something went wrong. Please try again or email us directly at build@omotra.com';
        formError.style.display = 'block';
      }
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    };
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(function(response) {
      return response.json().catch(function() {
        return { success: false, error: 'Server returned an unexpected response.' };
      }).then(function(parsed) {
        return { status: response.status, data: parsed };
      });
    }).then(function(result) {
      if (result.status === 200 && result.data.success) {
        contactForm.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
        return;
      }
      if (result.status === 429) {
        showError('Too many submissions. Please try again later.');
        return;
      }
      if (result.status === 500 && result.data && result.data.error === 'Server configuration error') {
        showError('Service unavailable: server configuration error. Please email build@omotra.com.');
        return;
      }
      showError(result.data && result.data.error ? result.data.error : 'Something went wrong. Please try again or email us directly at build@omotra.com');
    }).catch(function(error) {
      console.error('Form submission error:', error);
      showError('Network error. Please check your connection and try again.');
    });
  }
  
  function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  // ===========================================
  // Staggered Animations
  // ===========================================
  const staggerContainers = document.querySelectorAll('[data-stagger]');
  
  staggerContainers.forEach(function(container) {
    const children = container.children;
    Array.from(children).forEach(function(child, index) {
      child.style.animationDelay = (index * 0.1) + 's';
    });
  });
  
  // ===========================================
  // Active Navigation Link
  // ===========================================
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile a');
  
  navLinks.forEach(function(link) {
    const href = link.getAttribute('href');
    if (currentPath === href ||
        (currentPath === '/' && href === '/') ||
        (href !== '/' && currentPath.endsWith(href))) {
      link.classList.add('active');
    }
  });
  
  // ===========================================
  // Smooth Scroll for Anchor Links
  // ===========================================
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
});
