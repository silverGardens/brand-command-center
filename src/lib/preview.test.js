import { describe, it, expect } from 'vitest';
import { generatePreviewHTML } from './preview';

const schema = [
  {
    id: 'hero',
    label: 'Hero Section',
    fields: [
      { id: 'hero_headline', type: 'text', label: 'Headline' },
      { id: 'hero_cta_url', type: 'link_url', label: 'CTA Destination' },
      { id: 'hero_image', type: 'image_url', label: 'Hero Image' },
    ],
  },
];

describe('generatePreviewHTML', () => {
  it('returns a string starting with <!DOCTYPE html>', () => {
    const html = generatePreviewHTML(schema, {}, {});
    expect(html).toMatch(/^<!DOCTYPE html>/);
  });

  it('renders the section label', () => {
    const html = generatePreviewHTML(schema, {}, {});
    expect(html).toContain('Hero Section');
  });

  it('renders field values when provided', () => {
    const html = generatePreviewHTML(schema, { hero_headline: 'Master the Dink' }, {});
    expect(html).toContain('Master the Dink');
  });

  it('renders placeholder when field value is missing', () => {
    const html = generatePreviewHTML(schema, {}, {});
    expect(html).toContain('[Headline]');
  });

  it('renders link_url as an anchor tag', () => {
    const html = generatePreviewHTML(schema, { hero_cta_url: '/blog' }, {});
    expect(html).toContain('href="/blog"');
  });

  it('renders image_url as an img tag', () => {
    const html = generatePreviewHTML(schema, { hero_image: 'https://example.com/img.jpg' }, {});
    expect(html).toContain('<img');
    expect(html).toContain('https://example.com/img.jpg');
  });

  it('applies brand background_color to body style', () => {
    const html = generatePreviewHTML(schema, {}, { background_color: '#FF0000' });
    expect(html).toContain('#FF0000');
  });
});
