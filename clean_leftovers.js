const fs = require('fs');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace everything between UNIFIED MOBILE MENU block and SCROLL REVEAL with clean code
  const dirtyPattern = /\/\*\s*───\s*UNIFIED MOBILE MENU[\s\S]*?(?=\/\*\s*───\s*SCROLL REVEAL|\/\*\s*───\s*MODERN HERO|\/\*\s*Scroll Reveal|\/\*\s*Contact FAQ|\/\*\s*Navbar Scroll)/gi;

  const cleanNavSection = `/* ─── UNIFIED MOBILE MENU & NAVBAR HANDLER ───────────── */
    (function() {
      const navbar = document.getElementById('navbar');
      if (navbar) {
        window.addEventListener('scroll', function() {
          if (window.scrollY > 40) navbar.classList.add('scrolled');
          else navbar.classList.remove('scrolled');
        }, { passive: true });
      }

      const hamburger = document.getElementById('hamburger');
      const mobileMenu = document.getElementById('mobile-menu');
      if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function(e) {
          e.stopPropagation();
          const isOpen = mobileMenu.classList.contains('active') || mobileMenu.style.display === 'block';
          if (isOpen) {
            mobileMenu.classList.remove('active');
            mobileMenu.style.setProperty('display', 'none', 'important');
            mobileMenu.hidden = true;
            hamburger.setAttribute('aria-expanded', 'false');
          } else {
            mobileMenu.classList.add('active');
            mobileMenu.style.setProperty('display', 'block', 'important');
            mobileMenu.hidden = false;
            hamburger.setAttribute('aria-expanded', 'true');
          }
          const spans = hamburger.querySelectorAll('span');
          if (spans.length >= 3) {
            if (!isOpen) {
              spans[0].style.transform = 'translateY(7px) rotate(45deg)';
              spans[1].style.opacity = '0';
              spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
            } else {
              spans[0].style.transform = '';
              spans[1].style.opacity = '';
              spans[2].style.transform = '';
            }
          }
        });

        mobileMenu.querySelectorAll('a').forEach(function(a) {
          a.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            mobileMenu.style.setProperty('display', 'none', 'important');
            mobileMenu.hidden = true;
            hamburger.setAttribute('aria-expanded', 'false');
            const spans = hamburger.querySelectorAll('span');
            if (spans.length >= 3) {
              spans[0].style.transform = '';
              spans[1].style.opacity = '';
              spans[2].style.transform = '';
            }
          });
        });
      }
    })();

    `;

  if (dirtyPattern.test(content)) {
    content = content.replace(dirtyPattern, cleanNavSection);
  }

  // Validate syntax across all script tags
  const scriptBlocks = content.match(/<script>([\s\S]*?)<\/script>/gi);
  let errorCount = 0;
  if (scriptBlocks) {
    scriptBlocks.forEach((block, idx) => {
      const code = block.replace(/<\/?script>/gi, '');
      try {
        new Function(code);
      } catch (err) {
        errorCount++;
        console.error(`❌ Syntax Error in ${file} script #${idx+1}: ${err.message}`);
      }
    });
  }

  if (errorCount === 0) {
    console.log(`✅ ${file}: 100% Clean & Validated JS!`);
  }

  fs.writeFileSync(file, content, 'utf8');
});
