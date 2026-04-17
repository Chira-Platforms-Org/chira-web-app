const DATA_PATH = 'sample_02_global_fuel_prices_profile.json';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
    }

    const data = await response.json();
    renderPage(data);
  } catch (error) {
    console.error(error);
    renderErrorState(error);
  }
});

function renderPage(data) {
  renderHero(data);
  renderSummaryStrip(data);
  renderOverview(data);
  renderAnalysisCards(data);
}

function renderHero(data) {
  const datasetName = data?.meta?.dataset_name || 'Unknown Dataset';
  const rows = data?.meta?.rows ?? '--';
  const columns = data?.meta?.columns ?? '--';
  const readiness = data?.dataset_overview?.readiness_label || 'Unknown';
  const recommendationMessage = data?.analysis_recommendation_summary?.message || 'Analysis summary unavailable.';
  const qualityScore = data?.quality_overview?.dataset_score ?? '--';
  const qualityGrade = data?.quality_overview?.grade || '--';

  document.getElementById('dataset-title').textContent = prettyTitle(datasetName);
  document.getElementById('context-dataset-name').textContent = prettyTitle(datasetName);
  document.getElementById('dataset-subtitle').textContent = recommendationMessage;
  document.getElementById('quality-score').textContent = formatMaybeNumber(qualityScore);
  document.getElementById('quality-grade').textContent = `Grade ${qualityGrade}`;

  const stats = [
    `${rows} rows`,
    `${columns} columns`,
    readiness,
    data?.meta?.analysis_status ? `Status: ${capitalizeWords(data.meta.analysis_status)}` : null
  ].filter(Boolean);

  document.getElementById('hero-stats').innerHTML = stats
    .map(item => `<span class="stat-chip">${escapeHtml(item)}</span>`)
    .join('');
}

function renderSummaryStrip(data) {
  const executive = data?.executive_summary || {};
  const recommendationSummary = data?.analysis_recommendation_summary || {};
  const summaryItems = [
    {
      label: 'Final Status',
      value: executive.final_status || 'No status available'
    },
    {
      label: 'Recommendations',
      value: recommendationSummary.message || 'No recommendation summary'
    },
    {
      label: 'Reliability',
      value: data?.quality_overview?.reliability?.level || 'Unknown'
    },
    {
      label: 'Top Issue Summary',
      value: executive.top_issues?.[0] || 'No major issues detected'
    }
  ];

  document.getElementById('summary-strip').innerHTML = summaryItems.map(item => `
    <div class="summary-card">
      <div class="summary-card-label">${escapeHtml(item.label)}</div>
      <div class="summary-card-value">${escapeHtml(item.value)}</div>
    </div>
  `).join('');
}

function renderOverview(data) {
  const qualityTarget = document.getElementById('quality-snapshot');
  const cleaningTarget = document.getElementById('cleaning-summary');

  const qualityRows = [
    ['Dataset score', formatMaybeNumber(data?.quality_overview?.dataset_score)],
    ['Grade', data?.quality_overview?.grade || '--'],
    ['Readiness', data?.dataset_overview?.readiness_label || '--'],
    ['Rows / Columns', `${data?.meta?.rows ?? '--'} / ${data?.meta?.columns ?? '--'}`],
    ['Recommendation', data?.quality_overview?.reliability?.recommendation || 'No recommendation available']
  ];

  qualityTarget.innerHTML = qualityRows.map(([label, value]) => infoRow(label, value)).join('');

  const cleaningActions = data?.cleaning_summary?.actions_taken?.length
    ? data.cleaning_summary.actions_taken.join('; ')
    : 'No cleaning actions were applied.';

  const cleaningRows = [
    ['Cleaned dataset ready', data?.cleaning_summary?.cleaned_dataset_ready ? 'Yes' : 'No'],
    ['Actions taken', cleaningActions],
    ['Score improvement', formatMaybeSignedNumber(data?.executive_summary?.score_improvement)],
    ['Primary concern count', String(data?.dataset_overview?.primary_concerns?.length || 0)]
  ];

  cleaningTarget.innerHTML = cleaningRows.map(([label, value]) => infoRow(label, value)).join('');
}

function renderAnalysisCards(data) {
  const cards = Array.isArray(data?.executed_analysis_cards) ? data.executed_analysis_cards : [];
  const target = document.getElementById('analysis-grid');

  if (!cards.length) {
    target.innerHTML = `<div class="empty-state">No executed analysis cards were found in the JSON output.</div>`;
    return;
  }

  const analysisLibraryCard = renderAnalysisLibraryGatewayCard(data);

  target.innerHTML = cards.map((card, index) => {
    const detailId = `details-${index}`;
    const chartMarkup = renderChart(card);
    const keyInsight = card?.key_insight || {};

    return `
      <article class="analysis-card">
        <div class="analysis-card-top">
          <div class="analysis-meta-row">
            <span class="analysis-badge">${escapeHtml(card.analysis_tier || card.analysis_type || 'analysis')}</span>
            <span class="analysis-score">Confidence: ${escapeHtml(formatMaybeNumber(card?.scoring?.confidence))}</span>
          </div>

          <h3 class="analysis-title">${escapeHtml(card?.display?.title || card?.internal_title || 'Untitled Analysis')}</h3>
          <p class="analysis-subtitle">${escapeHtml(card?.display?.subtitle || '')}</p>
        </div>

        <div class="chart-wrap">
          <div class="chart-card">
            <p class="chart-title">${escapeHtml(card?.chart?.title || 'Chart')}</p>
            ${chartMarkup}
          </div>
        </div>

        <div class="analysis-body">
          ${insightBlock('Summary', keyInsight.short_summary)}
          ${insightBlock('Why it matters', keyInsight.why_it_matters)}
          ${insightBlock('Next step', keyInsight.next_step)}
        </div>

        <div class="card-actions">
          <button class="toggle-button" onclick="toggleDetails('${detailId}', this)">View details</button>
        </div>

        <div id="${detailId}" class="card-details">
          <div class="details-panel">
            <h4>Detailed explanation</h4>
            <p>${escapeHtml(keyInsight.detailed_explanation || 'No additional explanation available.')}</p>

            ${renderSupportingInsights(card?.supporting_insights || [])}
            ${renderSummaryTable(card?.table)}
          </div>
        </div>
      </article>
    `;
  }).join('') + analysisLibraryCard;
}

function renderAnalysisLibraryGatewayCard(data) {
  const allCandidates = Array.isArray(data?.all_analysis_candidates) ? data.all_analysis_candidates : [];
  const featuredCount = Array.isArray(data?.next_best_analyses) ? data.next_best_analyses.length : 0;

  const groupedCounts = countAnalysisTypes(allCandidates);

  const chips = Object.entries(groupedCounts)
    .map(([type, count]) => `<span class="library-chip">${escapeHtml(prettyLabel(type))} · ${count}</span>`)
    .join('');

  return `
    <article class="analysis-card analysis-library-card">
      <div class="analysis-card-top">
        <div class="analysis-meta-row">
          <span class="analysis-badge analysis-library-badge">explore</span>
          <span class="analysis-score">${allCandidates.length} valid analyses</span>
        </div>

        <h3 class="analysis-title">Open Analysis Library</h3>
        <p class="analysis-subtitle">Browse every viable analysis generated for this dataset.</p>
      </div>

      <div class="chart-wrap">
        <div class="chart-card analysis-library-preview">
          <p class="chart-title">Analysis types</p>
          <div class="library-chip-wrap">
            ${chips || '<span class="library-chip">No grouped analyses available</span>'}
          </div>
        </div>
      </div>

      <div class="analysis-body">
        ${insightBlock('Summary', `${allCandidates.length} valid analyses found. ${featuredCount} are currently featured in Overview.`)}
        ${insightBlock('Why it matters', 'Some useful analyses are not shown in the overview because stronger candidates competed for limited featured space.')}
        ${insightBlock('Next step', 'Open the Analysis Library to browse all valid analyses by type and explore beyond the featured recommendations.')}
      </div>

      <div class="card-actions">
        <a class="toggle-button library-link-button" href="/analysis-library/">Open Analysis Library</a>
      </div>
    </article>
  `;
}

function countAnalysisTypes(items) {
  const counts = {};

  for (const item of items) {
    const type = item?.analysis_type || 'other';
    counts[type] = (counts[type] || 0) + 1;
  }

  return counts;
}

function prettyLabel(text) {
  if (!text) return 'Other';
  return String(text)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function insightBlock(label, text) {
  return `
    <div class="insight-block">
      <span class="insight-label">${escapeHtml(label)}</span>
      <p class="insight-text">${escapeHtml(text || 'Not available')}</p>
    </div>
  `;
}

function renderSupportingInsights(insights) {
  if (!insights.length) {
    return '';
  }

  const items = insights.map(item => `
    <li>
      <strong>${escapeHtml(item.title || 'Insight')}:</strong>
      ${escapeHtml(item.short_summary || 'No summary available')}
    </li>
  `).join('');

  return `
    <h4>Supporting insights</h4>
    <ul class="supporting-list">
      ${items}
    </ul>
  `;
}

function renderSummaryTable(table) {
  if (!table || !Array.isArray(table.columns) || !Array.isArray(table.rows)) {
    return '';
  }

  const columns = table.columns;
  const rows = table.rows.slice(0, 8);

  return `
    <div class="summary-table-wrap">
      <h4>Summary table</h4>
      <table class="summary-table">
        <thead>
          <tr>
            ${columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${columns.map(col => `<td>${escapeHtml(formatCellValue(row[col]))}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderChart(card) {
  const chartType = card?.chart?.type;
  const chartData = Array.isArray(card?.chart?.data) ? card.chart.data : [];

  if (!chartData.length) {
    return `<div class="empty-state">No chart data available.</div>`;
  }

  if (chartType === 'bar_chart') {
    return renderBarChart(card);
  }

  if (chartType === 'histogram') {
    return renderHistogram(card);
  }

  if (chartType === 'line_chart') {
    return renderLineChart(card);
  }

  if (chartType === 'scatter_plot' || chartType === 'hexbin') {
    return renderScatterPlot(card);
  }

  return `<div class="empty-state">Chart type "${escapeHtml(chartType || 'unknown')}" is not yet supported in V1.</div>`;
}
function renderBarChart(card) {
  const xField = card?.chart?.x_field;
  const yField = card?.chart?.y_field;
  const data = card.chart.data;

  const width = 640;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 70, left: 52 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => Number(d[yField]) || 0), 1);
  const barGap = 16;
  const barWidth = Math.max(18, (innerWidth - (data.length - 1) * barGap) / data.length);

  const bars = data.map((d, i) => {
    const value = Number(d[yField]) || 0;
    const x = padding.left + i * (barWidth + barGap);
    const barHeight = (value / maxValue) * innerHeight;
    const y = padding.top + innerHeight - barHeight;
    const labelX = x + barWidth / 2;
    const category = String(d[xField]);

    return `
      <g>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="8" fill="#6d46b2"></rect>
        <text x="${labelX}" y="${y - 6}" text-anchor="middle" class="chart-value-label">${escapeHtml(shortNumber(value))}</text>
        <text x="${labelX}" y="${padding.top + innerHeight + 18}" text-anchor="end" transform="rotate(-35 ${labelX} ${padding.top + innerHeight + 18})" class="chart-axis-label">${escapeHtml(category)}</text>
      </g>
    `;
  }).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" role="img" aria-label="Bar chart">
      <line x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${width - padding.right}" y2="${padding.top + innerHeight}" stroke="#d8d2e3" stroke-width="1" />
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + innerHeight}" stroke="#d8d2e3" stroke-width="1" />
      ${bars}
    </svg>
  `;
}

function renderHistogram(card) {
  const data = card.chart.data;
  const width = 640;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 78, left: 52 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxCount = Math.max(...data.map(d => Number(d.count) || 0), 1);
  const barGap = 8;
  const barWidth = Math.max(18, (innerWidth - (data.length - 1) * barGap) / data.length);

  const bars = data.map((d, i) => {
    const value = Number(d.count) || 0;
    const x = padding.left + i * (barWidth + barGap);
    const barHeight = (value / maxCount) * innerHeight;
    const y = padding.top + innerHeight - barHeight;
    const labelX = x + barWidth / 2;
    const binLabel = String(d.bin);

    const isOutlier = binLabel.toLowerCase().includes('outlier');
    const fill = isOutlier ? '#d94a57' : '#4f7cff';

    return `
      <g>
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="6" fill="${fill}"></rect>
        <text x="${labelX}" y="${y - 6}" text-anchor="middle" class="chart-value-label">${value}</text>
        <text x="${labelX}" y="${padding.top + innerHeight + 18}" text-anchor="end" transform="rotate(-35 ${labelX} ${padding.top + innerHeight + 18})" class="chart-axis-label">${escapeHtml(binLabel)}</text>
      </g>
    `;
  }).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" role="img" aria-label="Histogram">
      <line x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${width - padding.right}" y2="${padding.top + innerHeight}" stroke="#d8d2e3" stroke-width="1" />
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + innerHeight}" stroke="#d8d2e3" stroke-width="1" />
      ${bars}
    </svg>
  `;
}

function renderLineChart(card) {
  const xField = card?.chart?.x_field;
  const yField = card?.chart?.y_field;
  const data = card.chart.data;

  const points = data.map((d, i) => {
    const rawValue = Number(d?.[yField]);
    return {
      xLabel: String(d?.[xField] ?? i),
      value: Number.isNaN(rawValue) ? 0 : rawValue
    };
  });

  const width = 640;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 70, left: 52 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const values = points.map(p => p.value);
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 1);
  const range = Math.max(maxValue - minValue, 1);

  const coords = points.map((point, i) => {
    const x = points.length === 1
      ? padding.left + innerWidth / 2
      : padding.left + (i / (points.length - 1)) * innerWidth;

    const y = padding.top + innerHeight - ((point.value - minValue) / range) * innerHeight;

    return { ...point, x, y };
  });

  const polylinePoints = coords.map(p => `${p.x},${p.y}`).join(' ');

  const labels = coords.map(point => `
    <text
      x="${point.x}"
      y="${padding.top + innerHeight + 18}"
      text-anchor="end"
      transform="rotate(-35 ${point.x} ${padding.top + innerHeight + 18})"
      class="chart-axis-label"
    >${escapeHtml(point.xLabel)}</text>
  `).join('');

  const dots = coords.map(point => `
    <circle cx="${point.x}" cy="${point.y}" r="4" fill="#6d46b2"></circle>
  `).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" role="img" aria-label="Line chart">
      <line x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${width - padding.right}" y2="${padding.top + innerHeight}" stroke="#d8d2e3" stroke-width="1" />
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + innerHeight}" stroke="#d8d2e3" stroke-width="1" />

      <polyline
        fill="none"
        stroke="#6d46b2"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${polylinePoints}"
      ></polyline>

      ${dots}
      ${labels}
    </svg>
  `;
}

function renderScatterPlot(card) {
  const xField = card?.chart?.x_field;
  const yField = card?.chart?.y_field;
  const data = card.chart.data;

  const points = data
    .map(d => {
      const x = Number(d?.[xField]);
      const y = Number(d?.[yField]);
      return { x, y };
    })
    .filter(point => !Number.isNaN(point.x) && !Number.isNaN(point.y));

  if (!points.length) {
    return `<div class="empty-state">No scatter data available.</div>`;
  }

  const width = 640;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 50, left: 52 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));

  const xRange = Math.max(maxX - minX, 1);
  const yRange = Math.max(maxY - minY, 1);

  const circles = points.map(point => {
    const cx = padding.left + ((point.x - minX) / xRange) * innerWidth;
    const cy = padding.top + innerHeight - ((point.y - minY) / yRange) * innerHeight;

    return `<circle cx="${cx}" cy="${cy}" r="3.2" fill="#6d46b2" fill-opacity="0.45"></circle>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" role="img" aria-label="Scatter plot">
      <line x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${width - padding.right}" y2="${padding.top + innerHeight}" stroke="#d8d2e3" stroke-width="1" />
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + innerHeight}" stroke="#d8d2e3" stroke-width="1" />

      ${circles}

      <text x="${width / 2}" y="${height - 8}" text-anchor="middle" class="chart-axis-label">
        ${escapeHtml(String(xField || 'X'))}
      </text>

      <text
        x="16"
        y="${height / 2}"
        text-anchor="middle"
        transform="rotate(-90 16 ${height / 2})"
        class="chart-axis-label"
      >
        ${escapeHtml(String(yField || 'Y'))}
      </text>
    </svg>
  `;
}

function toggleDetails(id, button) {
  const panel = document.getElementById(id);
  if (!panel) return;

  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open');
  button.textContent = isOpen ? 'View details' : 'Hide details';
}

function infoRow(label, value) {
  return `
    <div class="info-row">
      <div class="info-label">${escapeHtml(label)}</div>
      <div class="info-value">${escapeHtml(value || '--')}</div>
    </div>
  `;
}

function renderErrorState(error) {
  document.getElementById('dataset-title').textContent = 'Unable to load dataset';
  document.getElementById('dataset-subtitle').textContent = error.message;

  document.getElementById('summary-strip').innerHTML = `
    <div class="empty-state">The JSON file could not be loaded. Check the file name and path in app.js.</div>
  `;

  document.getElementById('quality-snapshot').innerHTML = '';
  document.getElementById('cleaning-summary').innerHTML = '';
  document.getElementById('analysis-grid').innerHTML = `
    <div class="empty-state">No analysis cards can be rendered until the data file loads correctly.</div>
  `;
}

function prettyTitle(text) {
  if (!text) return 'Untitled Dataset';
  return String(text)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function capitalizeWords(text) {
  if (!text) return '';
  return String(text).replace(/\b\w/g, char => char.toUpperCase());
}

function formatMaybeNumber(value) {
  if (value === null || value === undefined || value === '') return '--';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}

function formatMaybeSignedNumber(value) {
  if (value === null || value === undefined || value === '') return '--';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}`;
}

function shortNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  if (Math.abs(num) >= 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return num.toFixed(num % 1 === 0 ? 0 : 1);
}

function formatCellValue(value) {
  if (value === null || value === undefined) return '--';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2);
  }
  return String(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
