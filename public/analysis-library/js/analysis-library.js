const DATA_PATH = '../app/sample_01_supply_chain_profile.json';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
    }

    const data = await response.json();
    renderLibraryPage(data);
  } catch (error) {
    console.error(error);
    renderErrorState(error);
  }
});

function renderLibraryPage(data) {
  renderHeader(data);
  renderGroups(data);
}

function renderHeader(data) {
  const datasetName = prettyTitle(data?.meta?.dataset_name || 'Unknown Dataset');
  const candidates = Array.isArray(data?.all_analysis_candidates) ? data.all_analysis_candidates : [];
  const featuredCount = candidates.filter(item => item?.included_in_overview).length;

  document.getElementById('context-dataset-name').textContent = datasetName;
  document.getElementById('page-title').textContent = `${datasetName} Analysis Library`;

  const subtitle = featuredCount > 0
    ? `Browse every viable analysis generated for this dataset, including those not featured in the main overview.`
    : `Browse every viable analysis generated for this dataset.`;

  document.getElementById('page-subtitle').textContent = subtitle;

  const stats = [
    `${candidates.length} valid analyses`,
    `${featuredCount} featured in Overview`
  ];

  document.getElementById('hero-stats').innerHTML = stats
    .map(item => `<span class="stat-chip">${escapeHtml(item)}</span>`)
    .join('');
}

function renderGroups(data) {
  const candidates = Array.isArray(data?.all_analysis_candidates) ? data.all_analysis_candidates : [];
  const target = document.getElementById('analysis-groups');

  if (!candidates.length) {
    target.innerHTML = `<div class="empty-state">No analysis candidates were found.</div>`;
    return;
  }

  const grouped = groupByAnalysisType(candidates);

  const preferredOrder = [
    'trend',
    'category',
    'distribution',
    'correlation',
    'segmentation',
    'cohort',
    'other'
  ];

  const sortedTypes = Object.keys(grouped).sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a);
    const bIndex = preferredOrder.indexOf(b);
    const safeA = aIndex === -1 ? 999 : aIndex;
    const safeB = bIndex === -1 ? 999 : bIndex;
    return safeA - safeB || a.localeCompare(b);
  });

  target.innerHTML = sortedTypes.map(type => {
    const items = grouped[type];

    return `
      <section class="analysis-group">
        <div class="group-title-row">
          <h3 class="group-title">${escapeHtml(prettyTitle(type))}</h3>
          <div class="group-count">${items.length} analyses</div>
        </div>

        <div class="analysis-grid">
          ${items.map(renderAnalysisCard).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function renderAnalysisCard(card) {
  const confidence = formatMaybeNumber(card?.scoring?.confidence);
  const description = card?.copy?.description || 'No description available.';
  const explanation = card?.copy?.recommendation_explanation || 'No explanation available.';
  const nextStep = card?.copy?.next_step || 'No next step available.';
  const featured = Boolean(card?.included_in_overview);

  return `
    <article class="analysis-card">
      <div class="card-top">
        <div class="card-badges">
          <span class="badge badge-type">${escapeHtml(prettyTitle(card?.analysis_type || 'other'))}</span>
          ${
            featured
              ? '<span class="badge badge-featured">Featured in Overview</span>'
              : '<span class="badge badge-secondary">Library Only</span>'
          }
        </div>

        <div class="card-confidence">Confidence: ${escapeHtml(confidence)}</div>
      </div>

      <h4 class="card-title">${escapeHtml(card?.display?.title || card?.title || 'Untitled Analysis')}</h4>
      <p class="card-subtitle">${escapeHtml(card?.display?.subtitle || '')}</p>

      <div class="card-body">
        <div class="info-block">
          <span class="info-label">Description</span>
          <p class="info-value">${escapeHtml(description)}</p>
        </div>

        <div class="info-block">
          <span class="info-label">Why this analysis exists</span>
          <p class="info-value">${escapeHtml(explanation)}</p>
        </div>

        <div class="info-block">
          <span class="info-label">Next step</span>
          <p class="info-value">${escapeHtml(nextStep)}</p>
        </div>
      </div>
    </article>
  `;
}

function groupByAnalysisType(items) {
  return items.reduce((acc, item) => {
    const type = item?.analysis_type || 'other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});
}

function renderErrorState(error) {
  document.getElementById('page-title').textContent = 'Unable to load Analysis Library';
  document.getElementById('page-subtitle').textContent = error.message;
  document.getElementById('analysis-groups').innerHTML = `
    <div class="empty-state">The JSON file could not be loaded. Check the path in analysis-library.js.</div>
  `;
}

function prettyTitle(text) {
  if (!text) return 'Untitled';
  return String(text)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function formatMaybeNumber(value) {
  if (value === null || value === undefined || value === '') return '--';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
