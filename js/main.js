// Vynix Studio – Shared JavaScript (Modrinth live data)
const MODRINTH_USER = 'NovaGamer15';
const API = 'https://api.modrinth.com/v2';

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function formatNumber(n) {
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString() : '0';
}

function projectTypeLabel(type) {
  const map = { mod: 'Mod', modpack: 'Modpack', plugin: 'Plugin', resourcepack: 'Resource Pack', shader: 'Shader', datapack: 'Data Pack' };
  return map[type] || type;
}

function statusLabel(status) {
  const map = {
    approved: { text: 'Approved', class: 'status-released' },
    processing: { text: 'Under Review', class: 'status-dev' },
    draft: { text: 'Draft', class: 'status-planned' },
    unlisted: { text: 'Unlisted', class: 'status-planned' },
    rejected: { text: 'Rejected', class: 'status-dev' },
    archived: { text: 'Archived', class: 'status-planned' },
    private: { text: 'Private', class: 'status-planned' },
    withheld: { text: 'Withheld', class: 'status-dev' },
    scheduled: { text: 'Scheduled', class: 'status-dev' },
    unknown: { text: 'Unknown', class: 'status-planned' }
  };
  return map[status] || { text: status || 'Unknown', class: 'status-planned' };
}

function renderProjectCard(project) {
  const url = `https://modrinth.com/${project.project_type}/${project.slug}`;
  const icon = project.icon_url || '';
  const type = projectTypeLabel(project.project_type);
  const status = statusLabel(project.status);
  return `
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;margin-bottom:0.5rem;">
        <div style="display:flex;align-items:center;gap:0.75rem;">
          ${icon ? `<img src="${icon}" alt="" class="project-icon" loading="lazy">` : '<div class="project-icon" style="display:flex;align-items:center;justify-content:center;background:#1e293b;"><i class="fa-solid fa-cube"></i></div>'}
          <div>
            <h3>${project.title || project.slug}</h3>
            <div class="type">${type}</div>
          </div>
        </div>
        <span class="status-pill ${status.class}">${status.text}</span>
      </div>
      <p>${project.description || 'No description provided.'}</p>
      <div class="stats">
        <span>${formatNumber(project.downloads)} downloads</span>
        <span>${formatNumber(project.followers)} followers</span>
      </div>
    </a>`;
}

async function loadCreatorProjects(containerId, statusId) {
  const container = document.getElementById(containerId);
  const status = statusId ? document.getElementById(statusId) : null;
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading projects from Modrinth...</div>';
  if (status) status.textContent = 'Loading...';

  try {
    // Get basic list, then fetch full details for status
    const list = await fetchJson(`${API}/user/${encodeURIComponent(MODRINTH_USER)}/projects`);
    const detailed = await Promise.all(
      list.map(async (p) => {
        try {
          const full = await fetchJson(`${API}/project/${p.slug}`);
          return { ...p, ...full };
        } catch {
          return p;
        }
      })
    );

    const sorted = detailed
      .filter(p => p.slug && p.project_type)
      .sort((a, b) => new Date(b.date_created || b.published || 0) - new Date(a.date_created || a.published || 0));

    if (!sorted.length) {
      container.innerHTML = '<p class="loading">No public projects found.</p>';
      if (status) status.textContent = '0 projects';
      return;
    }

    container.innerHTML = sorted.map(renderProjectCard).join('');
    if (status) status.textContent = `${sorted.length} project${sorted.length === 1 ? '' : 's'} from Modrinth (live status)`;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="error loading">Could not load projects. <button onclick="loadCreatorProjects('${containerId}','${statusId||''}')" class="btn btn-secondary" style="margin-top:0.5rem;">Retry</button></div>`;
    if (status) status.textContent = 'Failed to load';
  }
}

// Official static products (can be expanded)
const officialProducts = [
  { name: 'Vynix PVP', type: 'Modpack', status: 'Released', slug: 'vynix-pvp', description: 'Lightweight, high-FPS modpack built for competitive PvP.' },
  { name: 'VynixShader', type: 'Shader', status: 'Released', slug: 'vynixshader', description: 'Clean visuals, graceful lighting, and smooth performance.' },
  { name: 'Vynix Pack', type: 'Resource Pack', status: 'Development', description: 'Cohesive visual resource pack for the Vynix ecosystem.' },
  { name: 'Vynix Launcher', type: 'Launcher', status: 'Planned', description: 'Focused launcher experience for Vynix products.' },
  { name: 'Vynix Forge', type: 'Platform', status: 'Planned', description: 'Internal tools and infrastructure for building Minecraft technology.' }
];

function renderOfficialCards(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = officialProducts.map(p => `
    <article class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <h3>${p.name}</h3>
          <div class="type">${p.type}</div>
        </div>
        <span class="status-pill status-${p.status.toLowerCase().replace(' ', '-')}">${p.status}</span>
      </div>
      <p>${p.description}</p>
      ${p.slug ? `<a href="https://modrinth.com/${p.type === 'Modpack' ? 'modpack' : 'shader'}/${p.slug}" target="_blank" class="btn btn-secondary" style="margin-top:0.75rem;font-size:0.75rem;">View on Modrinth</a>` : ''}
    </article>
  `).join('');
}

// Auto-init on pages that have the containers
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('creator-projects-grid')) {
    loadCreatorProjects('creator-projects-grid', 'creator-projects-status');
  }
  if (document.getElementById('official-products-grid')) {
    renderOfficialCards('official-products-grid');
  }
});
