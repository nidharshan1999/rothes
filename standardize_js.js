const fs = require('fs');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

const cleanMobileJS = `
    /* ─── HAMBURGER MENU TOGGLE ──────────────────────────── */
    (function() {
      const hamburger = document.getElementById('hamburger');
      const mobileMenu = document.getElementById('mobile-menu');
      if (!hamburger || !mobileMenu) return;

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
    })();
`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace any existing hamburger JS logic
  const oldMenuRegex = /\/\*\s*───\s*HAMBURGER MENU[\s\S]*?(?=\/\*\s*───|<script>|<\/script>)/gi;
  const oldMenuRegex2 = /\/\*\s*Hamburger Menu Toggle\s*\*\/[\s\S]*?(?=\/\*|<\/script>)/gi;

  content = content.replace(/const hamburger = document\.getElementById\('hamburger'\);[\s\S]*?mobileMenu\.querySelectorAll[\s\S]*?\}\);/gi, '');
  content = content.replace(/const hamburger = document\.getElementById\('hamburger'\);[\s\S]*?spans\[2\]\.style\.transform = '';\s*\}/gi, '');

  // Inject cleanMobileJS right after <script> tag
  if (content.includes('<script>')) {
    content = content.replace('<script>', `<script>\n${cleanMobileJS}\n`);
  }

  // Validate syntax
  const scriptBlocks = content.match(/<script>([\s\S]*?)<\/script>/gi);
  if (scriptBlocks) {
    scriptBlocks.forEach((block, idx) => {
      const code = block.replace(/<\/?script>/gi, '');
      try {
        new Function(code);
      } catch (err) {
        console.error(`ERROR in ${file} script #${idx+1}: ${err.message}`);
      }
    });
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated and validated ${file}`);
});
