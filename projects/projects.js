(function () {
  'use strict';

  const CTA_BY_TYPE = {
    'project-homepage': 'Open project homepage',
    'external-homepage': 'Open project homepage',
    'github-repo': 'Open GitHub repository'
  };

  async function loadProjects() {
    const response = await fetch('../data/projects.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.projects)) {
      throw new Error('Invalid project data format');
    }

    return data.projects.slice().sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }

  function isExternalLink(url) {
    return /^https?:\/\//.test(url);
  }

  function renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    grid.innerHTML = projects.map((project, index) => {
      const href = project.url || '#';
      const badge = project.badge || '';
      const title = project.title || 'Untitled Project';
      const meta = project.meta || '';
      const description = project.description || '';
      const cta = CTA_BY_TYPE[project.linkType] || 'Open project homepage';
      const externalClass = isExternalLink(href) ? ' is-external' : '';

      return `
        <a class="hub-card${externalClass}" href="${href}" style="--card-index:${index}">
          <span class="hub-card-badge">${badge}</span>
          <h2 class="hub-card-title">${title}</h2>
          <p class="hub-card-meta">${meta}</p>
          <p class="hub-card-desc">${description}</p>
          <span class="hub-card-cta">${cta} <span aria-hidden="true">→</span></span>
        </a>
      `;
    }).join('');
  }

  function renderError(message) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    grid.innerHTML = `
      <div class="hub-card">
        <span class="hub-card-badge">Unavailable</span>
        <h2 class="hub-card-title">Failed to load projects</h2>
        <p class="hub-card-desc">${message}</p>
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const projects = await loadProjects();
      renderProjects(projects);
    } catch (error) {
      console.error('Failed to load projects hub:', error);
      renderError('Please refresh the page or return to the homepage and try again.');
    }
  });
})();
