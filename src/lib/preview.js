export function generatePreviewHTML(schema, fieldValues, brand) {
  const bg = brand?.background_color ?? '#0D1117';
  const fg = brand?.text_color ?? '#E6EDF3';
  const primary = brand?.primary_color ?? brand?.accent_color ?? '#2563EB';
  const surface = brand?.surface_color ?? '#161B22';
  const font = brand?.font_body ?? 'Inter';

  const sectionsHtml = (schema ?? []).map(section => {
    const fieldsHtml = (section.fields ?? []).map(field => {
      const val = fieldValues?.[field.id];
      let valueHtml;
      if (field.type === 'image_url') {
        const src = val || '';
        valueHtml = src
          ? `<img src="${escapeAttr(src)}" class="preview-img" alt="${escapeHtml(field.label)}" />`
          : `<div class="placeholder-img">[${escapeHtml(field.label)}]</div>`;
      } else if (field.type === 'link_url') {
        const href = val || '#';
        valueHtml = `<a href="${escapeAttr(href)}" class="preview-link">${escapeHtml(val || `[${field.label}]`)}</a>`;
      } else {
        valueHtml = `<p class="field-value">${escapeHtml(val || `[${field.label}]`)}</p>`;
      }
      return `<div class="field-group">
        <span class="field-label">${escapeHtml(field.label)}</span>
        ${valueHtml}
      </div>`;
    }).join('');

    return `<section class="preview-section">
      <div class="section-header">${escapeHtml(section.label)}</div>
      ${fieldsHtml}
    </section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: '${font}', sans-serif; background: ${bg}; color: ${fg}; padding: 1.25rem; min-height: 100vh; }
  .preview-section { border: 1px solid #30363D; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; background: ${surface}; }
  .section-header { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #8B949E; padding-bottom: 0.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid #30363D; }
  .field-group { margin-bottom: 0.75rem; }
  .field-group:last-child { margin-bottom: 0; }
  .field-label { display: block; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6E7681; margin-bottom: 0.25rem; }
  .field-value { font-size: 0.875rem; color: ${fg}; line-height: 1.5; }
  .preview-link { font-size: 0.875rem; color: ${primary}; text-decoration: underline; }
  .preview-img { max-width: 100%; border-radius: 4px; max-height: 140px; object-fit: cover; display: block; }
  .placeholder-img { height: 80px; background: #21262D; border: 1px dashed #30363D; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: #6E7681; }
</style>
</head>
<body>${sectionsHtml}</body>
</html>`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return String(str ?? '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
