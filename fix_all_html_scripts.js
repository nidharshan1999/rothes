const fs = require('fs');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace script tag contents up to first real feature script with clean script
  const scriptStartIdx = content.indexOf('<script>');
  if (scriptStartIdx === -1) return;

  const scriptEndIdx = content.lastIndexOf('</script>');
  const scriptContent = content.substring(scriptStartIdx + 8, scriptEndIdx);

  // Split lines and filter out old hamburger / navbar / broken lines
  const lines = scriptContent.split('\n');
  const cleanLines = [];

  let skipping = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('/* ─── HAMBURGER') || line.includes('/* ─── UNIFIED MOBILE') || line.includes('const navbar =') || line.includes('/* Navbar Scroll')) {
      skipping = true;
      continue;
    }

    if (skipping) {
      if (line.includes('/* ─── SCROLL REVEAL') || line.includes('/* Scroll Reveal') || line.includes('const reveal') || line.includes('const observer') || line.includes('/* ─── MODERN HERO') || line.includes('/* ─── COUNTER') || line.includes('/* Contact FAQ') || line.includes('const faqItems')) {
        skipping = false;
        cleanLines.push(line);
      }
      continue;
    }

    cleanLines.push(line);
  }

  const cleanNavScript = `
    /* ─── UNIFIED MOBILE MENU & NAVBAR HANDLER ───────────── */
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

  const finalScriptBody = cleanNavScript + '\n' + cleanLines.join('\n');
  const newContent = content.substring(0, scriptStartIdx + 8) + '\n' + finalScriptBody + '\n' + content.substring(scriptEndIdx);

  // Validate syntax
  let isValid = false;
  try {
    new Function(finalScriptBody);
    isValid = true;
  } catch (err) {
    console.error(`❌ ${file}: Syntax Error -> ${err.message}`);
  }

  if (isValid) {
    console.log(`✅ ${file}: 100% CLEAN & SYNTACTICALLY VALID!`);
    fs.writeFileSync(file, newContent, 'utf8');
  }
});
