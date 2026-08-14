(function () {
  'use strict';

  var GROUPS = [
    { id: 'survey', title: 'Survey' },
    { id: 'own', title: 'Project pages' },
    { id: 'collaboration', title: 'Collaborations' }
  ];

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isSafeUrl(url) {
    if (!url || url === '#') return false;
    if (url.charAt(0) === '/' || url.indexOf('./') === 0 || url.indexOf('../') === 0) return true;
    try {
      var parsed = new URL(url, window.location.href);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  function isOffsite(url) {
    if (!url || url.charAt(0) === '/' || url.indexOf('./') === 0 || url.indexOf('../') === 0) return false;
    try {
      return new URL(url, window.location.href).origin !== window.location.origin;
    } catch (e) {
      return false;
    }
  }

  function cardCta(project, offsite) {
    if (project.group === 'collaboration') return 'Open collaboration page';
    if (offsite) return 'Open project site';
    return 'Open project page';
  }

  function renderCard(project, index) {
    var href = isSafeUrl(project.url) ? project.url : '#';
    var offsite = isOffsite(href);
    var name = escapeHtml(project.navLabel || project.title || 'Untitled Project');
    var title = project.title && project.title !== project.navLabel
      ? '<p class="hub-card-lead">' + escapeHtml(project.title) + '</p>'
      : '';
    var collab = project.group === 'collaboration';
    var extra = offsite ? ' target="_blank" rel="noopener noreferrer"' : '';

    return (
      '<a class="hub-card' + (collab ? ' is-collaboration' : '') + '" href="' + escapeHtml(href) +
      '" style="--card-index:' + index + '"' + extra + '>' +
        '<span class="hub-card-row">' +
          '<span class="hub-card-badge">' + escapeHtml(project.badge || '') + '</span>' +
          (collab ? '<span class="hub-card-stamp">Collaboration</span>' : '') +
        '</span>' +
        '<h3 class="hub-card-title">' + name + '</h3>' +
        title +
        '<p class="hub-card-meta">' + escapeHtml(project.meta || '') + '</p>' +
        '<p class="hub-card-desc">' + escapeHtml(project.description || '') + '</p>' +
        '<span class="hub-card-cta">' + escapeHtml(cardCta(project, offsite)) +
          ' <span aria-hidden="true">' + (offsite ? '↗' : '→') + '</span></span>' +
      '</a>'
    );
  }

  function renderProjects(projects) {
    var board = document.getElementById('projectsBoard');
    if (!board) return;

    board.innerHTML = GROUPS.map(function (group) {
      var items = projects.filter(function (p) {
        return (p.group || 'own') === group.id;
      });
      if (!items.length) return '';
      return (
        '<section class="hub-group hub-group--' + group.id + '" aria-labelledby="hub-group-' + group.id + '">' +
          '<h2 class="hub-group-title" id="hub-group-' + group.id + '">' + escapeHtml(group.title) + '</h2>' +
          '<div class="hub-grid">' + items.map(renderCard).join('') + '</div>' +
        '</section>'
      );
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var board = document.getElementById('projectsBoard');
    fetch('../data/projects.json', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.projects)) throw new Error('Invalid project data');
        var projects = data.projects.slice().sort(function (a, b) {
          return Number(a.order || 0) - Number(b.order || 0);
        });
        renderProjects(projects);
      })
      .catch(function () {
        if (!board) return;
        board.innerHTML =
          '<div class="hub-card"><span class="hub-card-badge">Unavailable</span>' +
          '<h3 class="hub-card-title">Failed to load projects</h3>' +
          '<p class="hub-card-desc">Please refresh the page or return to the homepage and try again.</p></div>';
      });
  });
})();
