const DATA_PATH = '/app/sample_02_supply_chain_profile.json';

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
  const candidates = Array.isArray(data?.executed_library_analysis_cards)
  ? data.executed_library_analysis_cards
  : [];
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
  const candidates = Array.isArray(data?.executed_library_analysis_cards)
  ? data.executed_library_analysis_cards
  : [];
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
  const nextStep = card?.key_insight?.next_step || 'No next step available.';
  const featured = card?.analysis_tier === 'overview';

  const title = card?.display?.title || card?.internal_title || 'Untitled Analysis';
  const subtitle = card?.display?.subtitle || '';
  const chartType = card?.chart?.type || null;
  const keyInsight = card?.key_insight?.short_summary || 'No key insight available.';

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

      <h4 class="card-title">${escapeHtml(title)}</h4>
      <p class="card-subtitle">${escapeHtml(subtitle)}</p>

      <div class="chart-preview">
        ${renderChartPreview(card)}
      </div>

      <div class="key-insight">
        <span class="info-label">Key Insight</span>
        <p class="info-value">${escapeHtml(keyInsight)}</p>
      </div>

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

function renderChartPreview(card) {
  const chart = card?.chart;

  if (!chart || !Array.isArray(chart.data) || !chart.data.length) {
    return `<div class="chart-placeholder">No chart available</div>`;
  }

  switch (chart.type) {
    case 'bar_chart':
      return renderBarChartPreview(chart);

    case 'histogram':
      return renderHistogramPreview(chart);

    case 'line_chart':
      return renderLineChartPreview(chart);

    case 'scatter_plot':
      return renderScatterPlotPreview(chart);

    default:
      return `
        <div class="chart-placeholder">
          ${escapeHtml(prettyTitle(chart.type || 'chart'))}
        </div>
      `;
  }
}

function renderBarChartPreview(chart) {
  const data = chart.data || [];
  const yField = chart.y_field;
  const xField = chart.x_field;

  const numericValues = data
    .map(row => Number(row?.[yField]))
    .filter(value => !Number.isNaN(value));

  const maxValue = Math.max(...numericValues, 1);

  const barsHtml = data.map(row => {
    const rawValue = Number(row?.[yField] ?? 0);
    const safeValue = Number.isNaN(rawValue) ? 0 : rawValue;
    const heightPct = Math.max((safeValue / maxValue) * 100, 6);

    return `
      <div class="mini-bar-item">
        <div class="mini-bar-value">${escapeHtml(formatCompactNumber(safeValue))}</div>
        <div class="mini-bar-wrap">
          <div class="mini-bar" style="height: ${heightPct}%"></div>
        </div>
        <div class="mini-bar-label">${escapeHtml(String(row?.[xField] ?? ''))}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="chart-card">
      <div class="chart-card-title">${escapeHtml(chart.title || 'Bar Chart')}</div>
      <div class="mini-bar-chart">
        ${barsHtml}
      </div>
    </div>
  `;
}

function renderHistogramPreview(chart) {
  const data = chart.data || [];

  const numericValues = data
    .map(row => Number(row?.count))
    .filter(value => !Number.isNaN(value));

  const maxValue = Math.max(...numericValues, 1);

  const barsHtml = data.map(row => {
    const count = Number(row?.count ?? 0);
    const safeValue = Number.isNaN(count) ? 0 : count;
    const heightPct = Math.max((safeValue / maxValue) * 100, 6);

    return `
      <div class="mini-hist-item">
        <div class="mini-bar-value">${escapeHtml(String(safeValue))}</div>
        <div class="mini-bar-wrap">
          <div class="mini-bar mini-bar-hist" style="height: ${heightPct}%"></div>
        </div>
        <div class="mini-bar-label">${escapeHtml(String(row?.bin ?? ''))}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="chart-card">
      <div class="chart-card-title">${escapeHtml(chart.title || 'Histogram')}</div>
      <div class="mini-hist-chart">
        ${barsHtml}
      </div>
    </div>
  `;
}

function renderLineChartPreview(chart) {
  const data = chart.data || [];
  const xField = chart.x_field;
  const yField = chart.y_field;

  const points = data.map((row, index) => {
    const value = Number(row?.[yField] ?? 0);
    return {
      label: String(row?.[xField] ?? index),
      value: Number.isNaN(value) ? 0 : value
    };
  });

  const maxValue = Math.max(...points.map(p => p.value), 1);
  const minValue = Math.min(...points.map(p => p.value), 0);
  const range = Math.max(maxValue - minValue, 1);

  const width = 100;
  const height = 44;

  const coords = points.map((point, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * width;
    const y = height - ((point.value - minValue) / range) * height;
    return { ...point, x, y };
  });

  const polylinePoints = coords.map(p => `${p.x},${p.y}`).join(' ');

  const labelsHtml = coords.map(point => `
    <div class="mini-line-label">${escapeHtml(point.label)}</div>
  `).join('');

  return `
    <div class="chart-card">
      <div class="chart-card-title">${escapeHtml(chart.title || 'Line Chart')}</div>
      <div class="mini-line-chart">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" class="mini-line-svg">
          <polyline
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            points="${polylinePoints}"
          ></polyline>
          ${coords.map(p => `
            <circle cx="${p.x}" cy="${p.y}" r="2.2" fill="currentColor"></circle>
          `).join('')}
        </svg>
      </div>
      <div class="mini-line-label-row">
        ${labelsHtml}
      </div>
    </div>
  `;
}

function renderScatterPlotPreview(chart) {
  const data = chart.data || [];
  const xField = chart.x_field;
  const yField = chart.y_field;

  const points = data
    .map(row => {
      const x = Number(row?.[xField]);
      const y = Number(row?.[yField]);
      return { x, y };
    })
    .filter(point => !Number.isNaN(point.x) && !Number.isNaN(point.y));

  if (!points.length) {
    return `<div class="chart-placeholder">No scatter data available</div>`;
  }

  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));

  const xRange = Math.max(maxX - minX, 1);
  const yRange = Math.max(maxY - minY, 1);

  const svgPoints = points.map(point => {
    const cx = ((point.x - minX) / xRange) * 100;
    const cy = 50 - ((point.y - minY) / yRange) * 50;
    return `<circle cx="${cx}" cy="${cy}" r="2.3" fill="currentColor"></circle>`;
  }).join('');

  return `
    <div class="chart-card">
      <div class="chart-card-title">${escapeHtml(chart.title || 'Scatter Plot')}</div>
      <div class="mini-scatter-chart">
        <svg viewBox="0 0 100 55" preserveAspectRatio="none" class="mini-scatter-svg">
          ${svgPoints}
        </svg>
      </div>
      <div class="mini-axis-caption">
        <span>${escapeHtml(String(xField || 'x'))}</span>
        <span>${escapeHtml(String(yField || 'y'))}</span>
      </div>
    </div>
  `;
}

function formatCompactNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  if (Math.abs(num) >= 1000) {
    return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }

  return num.toFixed(num % 1 === 0 ? 0 : 1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
