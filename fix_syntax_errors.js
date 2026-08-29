const fs = require('fs');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Remove the extra }); after if (hamburger && mobileMenu) { ... }
  if (content.includes('    }\n    });')) {
    content = content.replace('    }\n    });', '    }');
    changed = true;
  }
  if (content.includes('    }\r\n    });')) {
    content = content.replace('    }\r\n    });', '    }');
    changed = true;
  }

  // Validate script blocks
  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const jsCode = match[1];
    try {
      new Function(jsCode);
    } catch (err) {
      console.error(`Syntax Error in ${file}: ${err.message}`);
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned up JS syntax error in ${file}`);
  }
});
