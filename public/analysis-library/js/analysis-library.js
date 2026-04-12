const DATA_PATH = '/app/sample_01_supply_chain_profile.json';

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
  renderHero(data);
  renderGroups(data);
}

function renderHero(data) {
  const datasetName = data?.meta?.dataset_name || 'Unknown Dataset';
  const allCandidates = Array.isArray(data?.all_analysis_candidates) ? data.all_analysis_candidates : [];
  const featured = allCandidates.filter(item => item?.included_in_overview).length;

  document.getElementById('context-dataset-name').textContent = prettyTitle(datasetName);
  document.getElementById('library-title').textContent = `${prettyTitle(datasetName)} Analysis Library`;
  document.getElementById('library-subtitle').textContent =
    'Browse every viable analysis generated for this dataset, including those not featured in the main overview.';
  document.getElementById('valid-analysis-count').textContent = String(allCandidates.length);
  document.getElementById('featured-count').textContent = `${featured} featured in Overview`;

  const groupedCounts = countAnalysisTypes(allCandidates);

  document.getElementById('hero-stats').innerHTML = Object.entries(groupedCounts)
    .map(([type, count]) => `<span class="stat-chip">${escapeHtml(prettyLabel(type))}: ${count}</span>`)
    .join('');
}

function renderGroups(data) {
  const candidates = Array.isArray(data?.all_analysis_candidates) ? data.all_analysis_candidates : [];
  const target = document.getElementById('analysis-library-groups');

  if (!candidates.length) {
    target.innerHTML = `<div class="empty-state">No analysis candidates were found.</div>`;
    return;
  }

  const grouped = groupByAnalysisType(candidates);

  const preferredOrder = ['trend', 'category', 'distribution', 'correlation', 'segmentation', 'cohort', 'other'];

  const sections = preferredOrder
    .filter(type => grouped[type]?.length)
    .map(type => renderGroupSection(type, grouped[type]))
    .join('');

  target.innerHTML = sections;
}

function renderGroupSection(type, items) {
  return `
    <section class="library-group">
      <div class="library-group-header">
        <h3>${escapeHtml(prettyLabel(type))}</h3>
        <span class="group-count">${items.length} analyses</span>
      </div>

      <div class="library-card-grid">
        ${items.map(renderLibraryCard).join('')}
      </div>
    </section>
  `;
}

function renderLibraryCard(card) {
  const isFeatured = !!card?.included_in_overview;
  const mode = card?.presentation?.mode || inferPresentationMode(card);
  const confidence = formatMaybeNumber(card?.scoring?.confidence);
  const title = card?.display?.title || card?.title || 'Untitled Analysis';
  const subtitle = card?.display?.subtitle || '';
  const summary = card?.copy?.description || card?.recommendation_explanation || 'No description available.';
  const nextStep = card?.copy?.next_step || 'No next step available.';
  const visual = renderLibraryVisual(card, mode);

  return `
    <article class="library-card">
      <div class="library-card-top">
        <div class="library-meta-row">
          <div class="library-badge-stack">
            <span class="analysis-badge">${escapeHtml(card?.analysis_type || 'analysis')}</span>
            ${isFeatured ? '<span class="featured-badge">Featured</span>' : ''}
          </div>
          <span class="analysis-score">Confidence: ${escapeHtml(confidence)}</span>
        </div>

        <h4 class="library-card-title">${escapeHtml(title)}</h4>
        <p class="library-card-subtitle">${escapeHtml(subtitle)}</p>
      </div>

      <div class="library-visual-wrap">
        <div class="library-visual-card">
          ${visual}
        </div>
      </div>

      <div class="library-card-body">
        <div class="insight-block">
          <span class="insight-label">Summary</span>
          <p class="insight-text">${escapeHtml(summary)}</p>
        </div>

        <div class="insight-block">
          <span class="insight-label">Next step</span>
          <p class="insight-text">${escapeHtml(nextStep)}</p>
        </div>
      </div>
    </article>
  `;
}

function renderLibraryVisual(card, mode) {
  if (mode === 'chart' && card?.chart?.type && isSupportedChartType(card.chart.type)) {
    return `
      <div class="library-visual-summary">
        <div class="visual-title">${escapeHtml(prettyLabel(card.chart.type))}</div>
        <div class="visual-subtext">Preview available in Overview-supported format</div>
      </div>
    `;
  }

  if (mode === 'table') {
    return `
      <div class="library-visual-summary">
        <div class="visual-title">Table-first analysis</div>
        <div class="visual-subtext">Best viewed as structured rows and columns</div>
      </div>
    `;
  }

  if (mode === 'text') {
    return `
      <div class="library-visual-summary">
        <div class="visual-title">Text-based output</div>
        <div class="visual-subtext">Best presented as narrative insights and recommendations</div>
      </div>
    `;
  }

  return `
    <div class="library-visual-summary">
      <div class="visual-title">Summary preview</div>
      <div class="visual-subtext">This analysis is available, but uses a non-standard preview format in V1</div>
    </div>
  `;
}

function inferPresentationMode(card) {
  const chartType = card?.chart?.type;

  if (isSupportedChartType(chartType)) return 'chart';
  if (chartType === 'retention_table') return 'table';
  return 'summary';
}

function isSupportedChartType(chartType) {
  return ['bar_chart', 'histogram'].includes(chartType);
}

function groupByAnalysisType(items) {
  const grouped = {};

  for (const item of items) {
    const type = item?.analysis_type || 'other';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(item);
  }

  return grouped;
}

function countAnalysisTypes(items) {
  const counts = {};

  for (const item of items) {
    const type = item?.analysis_type || 'other';
    counts[type] = (counts[type] || 0) + 1;
  }

  return counts;
}

function prettyTitle(text) {
  if (!text) return 'Untitled Dataset';
  return String(text)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function prettyLabel(text) {
  if (!text) return 'Other';
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

function renderErrorState(error) {
  const target = document.getElementById('analysis-library-groups');
  if (target) {
    target.innerHTML = `<div class="empty-state">Failed to load Analysis Library JSON: ${escapeHtml(error.message)}</div>`;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
