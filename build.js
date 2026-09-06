const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Telugu:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;500;600&family=Source+Serif+4:ital@0;1&display=swap" rel="stylesheet">`;

// ---------- load content ----------
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "content/site.json"), "utf8"));
const storiesDir = path.join(ROOT, "content/stories");
const storyFiles = fs.readdirSync(storiesDir).filter(f => f.endsWith(".json"));
const stories = storyFiles.map(f => JSON.parse(fs.readFileSync(path.join(storiesDir, f), "utf8")));

const SITE_TITLE = `${site.brand} — ${site.authorName}`;

function nav(rel) {
  return `
<nav class="site-nav">
  <div class="site-nav-inner">
    <a class="brand" href="${rel}index.html">${site.brand.replace(/(\S+)$/, '<span>$1</span>')}</a>
    <div class="nav-links">
      <a href="${rel}index.html">హోమ్</a>
      <a href="${rel}index.html#stories">కథలు</a>
      <a href="${rel}about.html">నా గురించి</a>
    </div>
  </div>
</nav>`;
}

function footer(rel) {
  return `
<footer class="site-footer">
  <p class="name">${site.authorName}</p>
  <p class="line">కథలు · రహస్యాలు · జ్ఞాపకాలు</p>
  <div class="foot-links">
    <a href="${rel}index.html">హోమ్</a>
    <a href="${rel}about.html">నా గురించి</a>
  </div>
</footer>`;
}

// ---------- render episode body (paragraphs, --- divider, centered end line) ----------
function renderBody(body) {
  const paras = body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  let out = "";
  for (const p of paras) {
    if (p === "---") { out += `<div class="divider" aria-hidden="true"><span></span></div>\n`; continue; }
    if (/^-\s.+-$/.test(p) && p.length < 40) { out += `<p class="the-end">${p}</p>\n`; continue; }
    out += `<p>${p}</p>\n`;
  }
  return out;
}

const storyPageCss = `
.hero{width:100%;line-height:0;background:#0a0f1a;}
.hero img{display:block;width:100%;height:auto;}
.meta{max-width:var(--max-read);margin:0 auto;padding:1.75rem 1.5rem 0.5rem;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;font-size:13px;color:var(--mist-dim);}
.meta .tag{border:0.5px solid rgba(147,164,187,0.35);border-radius:999px;padding:4px 14px;color:var(--mist);}
.meta .sep{color:var(--mist-dim);}
.ep-nav{max-width:var(--max-read);margin:0 auto;padding:1rem 1.5rem 0.5rem;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;}
.ep-pill{font-size:12.5px;padding:6px 13px;border-radius:999px;border:1px solid rgba(147,164,187,0.3);}
.ep-pill.is-live{color:#0a0f1a;background:var(--gold);border-color:var(--gold);font-weight:600;}
.ep-pill.is-locked{color:var(--mist-dim);background:transparent;}
.panel-wrap{background:var(--bg-night);padding:1.25rem 1.25rem 3rem;}
.panel{max-width:var(--max-read);margin:0 auto 1.5rem;background:var(--parchment);color:var(--ink);border-radius:6px;padding:3rem 2.75rem;box-shadow:0 30px 60px -20px rgba(0,0,0,0.55);}
.panel .ep-label{font-family:'Noto Sans Telugu',sans-serif;font-size:12.5px;font-weight:600;color:var(--gold-soft);margin:0 0 8px;}
.panel h1{font-family:'Noto Serif Telugu',serif;font-weight:700;font-size:28px;line-height:1.3;margin:0 0 6px;color:var(--ink);}
.panel .byline{font-family:'Noto Sans Telugu',sans-serif;font-size:14px;color:var(--ink-soft);margin:0 0 2.25rem;}
.panel p{font-family:'Noto Serif Telugu',serif;font-size:17px;line-height:1.9;margin:0 0 1.3rem;text-align:justify;}
.divider{display:flex;justify-content:center;margin:2.5rem 0;}
.divider span{width:60px;height:1px;background:rgba(42,32,21,0.3);}
.the-end{text-align:center !important;font-weight:600;color:var(--ink-soft);margin:2rem 0 0 !important;}
.upcoming{max-width:var(--max-read);margin:0 auto;padding:1rem 1.5rem 4rem;}
.upcoming h3{font-family:'Noto Serif Telugu',serif;font-weight:600;font-size:18px;color:var(--mist);margin:0 0 1.25rem;text-align:center;}
.ep-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(190px, 1fr));gap:14px;}
.ep-card{border:1px dashed rgba(147,164,187,0.3);border-radius:6px;padding:1.75rem 1.25rem;text-align:center;}
.ep-card .lock{font-size:18px; opacity:0.7;}
.ep-card-num{font-family:'Noto Sans Telugu',sans-serif;font-size:12px;color:var(--gold-soft);margin:10px 0 4px;font-weight:600;}
.ep-card-title{font-family:'Noto Serif Telugu',serif;font-size:15px;color:var(--mist);margin:0 0 6px;}
.ep-card-status{font-family:'Noto Sans Telugu',sans-serif;font-size:12px;color:var(--mist-dim);margin:0;}
@media (max-width:600px){.panel{padding:2rem 1.4rem;}.panel h1{font-size:23px;}.panel p{font-size:16px;}}
`;

function buildStoryPage(story) {
  let navPills = "", episodeSections = "", upcomingCards = "";
  story.episodes.forEach((ep, i) => {
    const num = i + 1;
    const isPublished = ep.status === "published";
    navPills += `<span class="ep-pill ${isPublished ? "is-live" : "is-locked"}">ఎపిసోడ్ ${num}${isPublished ? "" : " · త్వరలో"}</span>\n`;
    if (isPublished) {
      episodeSections += `
      <div class="panel" id="ep-${num}">
        <p class="ep-label">ఎపిసోడ్ ${num}</p>
        <h1>${ep.title}</h1>
        ${ep.byline ? `<p class="byline">${ep.byline}</p>` : ``}
        ${renderBody(ep.body)}
      </div>\n`;
    } else {
      upcomingCards += `
      <div class="ep-card">
        <span class="lock">&#128274;</span>
        <p class="ep-card-num">ఎపిసోడ్ ${num}</p>
        <p class="ep-card-title">${ep.title}</p>
        <p class="ep-card-status">త్వరలో విడుదల అవుతుంది</p>
      </div>\n`;
    }
  });

  return `<!DOCTYPE html>
<html lang="te">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${story.title} — ${site.authorName}</title>
${FONT_LINK}
<link rel="stylesheet" href="../assets/style.css">
<style>${storyPageCss}</style>
</head>
<body>
${nav("../")}
<div class="hero"><img src="..${story.poster}" alt="Poster for ${story.title}"></div>
<div class="meta">${story.tags.map(t => `<span class="tag">${t}</span>`).join('<span class="sep">·</span>')}</div>
<div class="ep-nav">${navPills}</div>
<div class="panel-wrap">${episodeSections}</div>
<div class="upcoming"><h3>రాబోయే ఎపిసోడ్‌లు</h3><div class="ep-grid">${upcomingCards}</div></div>
${footer("../")}
</body>
</html>`;
}

// ---------- HOME PAGE ----------
const homeCss = `
.hero-band{max-width:var(--max); margin:0 auto; padding:4rem 24px 2.5rem; text-align:center;}
.hero-band .kicker{font-family:'Noto Sans Telugu',sans-serif;font-size:13px;color:var(--gold-soft);margin:0 0 14px;}
.hero-band h1{font-family:'Noto Serif Telugu',serif;font-weight:700;font-size:34px;color:var(--parchment);margin:0 0 16px;line-height:1.35;}
.hero-band p{font-family:'Noto Sans Telugu',sans-serif;font-size:15px;color:var(--mist);max-width:520px;margin:0 auto;line-height:1.7;}
.section-label{max-width:var(--max); margin:0 auto; padding:0 24px; font-family:'Noto Serif Telugu',serif; font-weight:600; font-size:19px; color:var(--parchment);}
.story-grid{max-width:var(--max); margin:0 auto; padding:20px 24px 5rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:22px;}
.story-card{background:var(--bg-raised); border-radius:10px; overflow:hidden; border:0.5px solid rgba(147,164,187,0.15); display:flex; flex-direction:column;}
.story-card .thumb{height:220px; overflow:hidden; background:#050810;}
.story-card .thumb img{width:100%;height:100%;object-fit:cover; object-position:center 15%;}
.story-card .body{padding:20px 22px 24px;}
.story-card .card-tag{font-family:'Noto Sans Telugu',sans-serif;font-size:11.5px;color:var(--gold-soft);margin:0 0 8px;}
.story-card h3{font-family:'Noto Serif Telugu',serif;font-size:20px;color:var(--parchment);margin:0 0 10px;line-height:1.35;}
.story-card .hook{font-family:'Noto Sans Telugu',sans-serif;font-size:13.5px;color:var(--mist);line-height:1.65;margin:0 0 16px;}
.story-card .read-link{font-family:'Noto Sans Telugu',sans-serif;font-size:13px;font-weight:600;color:var(--gold);}
`;

function buildHomePage() {
  const cards = stories.map(story => {
    const firstTag = story.tags[0] || "కథ";
    return `
  <a class="story-card" href="stories/${story.slug}.html">
    <div class="thumb"><img src="${story.posterThumb}" alt="${story.title} poster"></div>
    <div class="body">
      <p class="card-tag">${firstTag} · సీరియల్</p>
      <h3>${story.title}</h3>
      <p class="hook">${story.hook}</p>
      <span class="read-link">ఎపిసోడ్ 1 చదవండి →</span>
    </div>
  </a>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="te">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${SITE_TITLE}</title>
${FONT_LINK}
<link rel="stylesheet" href="assets/style.css">
<style>${homeCss}</style>
</head>
<body>
${nav("")}
<div class="hero-band">
  <p class="kicker">${site.kicker}</p>
  <h1>${site.heroLine1}<br>${site.heroLine2}</h1>
  <p>${site.heroSub}</p>
</div>
<h2 class="section-label" id="stories">కథలు</h2>
<div class="story-grid">${cards}</div>
${footer("")}
</body>
</html>`;
}

// ---------- ABOUT PAGE ----------
const aboutCss = `
.about-wrap{max-width:var(--max-read); margin:0 auto; padding:4rem 24px 5rem;}
.about-wrap h1{font-family:'Noto Serif Telugu',serif;font-weight:700;font-size:28px;color:var(--parchment);margin:0 0 6px;}
.about-wrap .role{font-family:'Noto Sans Telugu',sans-serif;font-size:14px;color:var(--gold-soft);margin:0 0 2rem;}
.about-wrap p{font-family:'Noto Serif Telugu',serif;font-size:16.5px;line-height:1.9;color:var(--mist);margin:0 0 1.25rem;}
`;

function buildAboutPage() {
  return `<!DOCTYPE html>
<html lang="te">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>నా గురించి — ${SITE_TITLE}</title>
${FONT_LINK}
<link rel="stylesheet" href="assets/style.css">
<style>${aboutCss}</style>
</head>
<body>
${nav("")}
<div class="about-wrap">
  <h1>${site.authorName}</h1>
  <p class="role">రచయిత — ${site.brand}</p>
  ${site.aboutBio.map(p => `<p>${p}</p>`).join("\n")}
</div>
${footer("")}
</body>
</html>`;
}

// ---------- write output ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "stories"), { recursive: true });
fs.mkdirSync(path.join(DIST, "assets"), { recursive: true });
fs.mkdirSync(path.join(DIST, "admin"), { recursive: true });

fs.cpSync(path.join(ROOT, "assets"), path.join(DIST, "assets"), { recursive: true });
fs.cpSync(path.join(ROOT, "admin"), path.join(DIST, "admin"), { recursive: true });

fs.writeFileSync(path.join(DIST, "index.html"), buildHomePage());
fs.writeFileSync(path.join(DIST, "about.html"), buildAboutPage());
for (const story of stories) {
  fs.writeFileSync(path.join(DIST, "stories", `${story.slug}.html`), buildStoryPage(story));
}

console.log(`Built ${stories.length} stories into dist/`);
