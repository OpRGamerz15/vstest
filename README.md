# Vynix Studio – Multi-page Website

Clean, multi-file structure for the Vynix Studio Minecraft software site.

## Structure
```
vynix-studio/
├── index.html              # Homepage
├── css/style.css           # Shared styles
├── js/main.js              # Shared JS (live Modrinth loading)
├── projects/index.html     # All projects
├── dashboard/index.html    # Control Center
├── development/index.html  # Development pipeline
├── releases/index.html     # Recent releases
└── assets/                 # Put logos / screenshots here
```

## Features
- Live Modrinth project cards (icons, descriptions, downloads, followers)
- Official product showcase
- Separate pages for Home, Projects, Dashboard, Development, Releases
- Dark theme matching the original studio aesthetic
- Mobile-friendly
- No single massive inline script

## How to use
1. Upload the entire `vynix-studio` folder to your web host (or replace your current site files).
2. Make sure the folder structure is preserved.
3. Visit `index.html` — projects will load live from Modrinth automatically.

## Notes
- Projects load from `https://api.modrinth.com/v2/user/NovaGamer15/projects`
- You can add screenshots or a logo in the `assets/` folder and reference them in the HTML.
- Font Awesome icons and Plus Jakarta Sans are loaded from CDN.
