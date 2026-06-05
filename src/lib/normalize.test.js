import { describe, it, expect } from 'vitest';
import { normalizeSite, normalizePost } from './normalize';

describe('normalizeSite', () => {
  it('passes through a standard-shaped site unchanged', () => {
    const raw = {
      id: 'abc', name: 'Dink Daily', status: 'active',
      created_at: '2026-01-01T00:00:00Z', domain: 'dinkdaily.com',
      slug: 'dink-daily', tagline: 'Tips', github_repo: 'https://github.com/x/y',
      template_id: 'default',
    };
    const r = normalizeSite(raw);
    expect(r.id).toBe('abc');
    expect(r.status).toBe('active');
    expect(r.created_at).toBe('2026-01-01T00:00:00Z');
    expect(r.domain).toBe('dinkdaily.com');
  });

  it('maps build_status to status when status is absent', () => {
    expect(normalizeSite({ id: '1', name: 'T', build_status: 'building' }).status).toBe('building');
  });

  it('maps deploy_status to status when status and build_status are absent', () => {
    expect(normalizeSite({ id: '1', name: 'T', deploy_status: 'active' }).status).toBe('active');
  });

  it('maps is_active true to "active"', () => {
    expect(normalizeSite({ id: '1', name: 'T', is_active: true }).status).toBe('active');
  });

  it('maps is_active false to "inactive"', () => {
    expect(normalizeSite({ id: '1', name: 'T', is_active: false }).status).toBe('inactive');
  });

  it('defaults status to "inactive" when no status field exists', () => {
    expect(normalizeSite({ id: '1', name: 'T' }).status).toBe('inactive');
  });

  it('maps createdAt (camelCase) to created_at', () => {
    expect(normalizeSite({ id: '1', name: 'T', createdAt: '2026-01-01' }).created_at).toBe('2026-01-01');
  });

  it('maps date_created to created_at', () => {
    expect(normalizeSite({ id: '1', name: 'T', date_created: '2026-01-01' }).created_at).toBe('2026-01-01');
  });

  it('returns null for created_at when no date field exists', () => {
    expect(normalizeSite({ id: '1', name: 'T' }).created_at).toBeNull();
  });

  it('maps repo_url to github_repo', () => {
    expect(normalizeSite({ id: '1', name: 'T', repo_url: 'https://github.com/x/y' }).github_repo)
      .toBe('https://github.com/x/y');
  });
});

describe('normalizePost', () => {
  it('maps is_published true to status "published"', () => {
    expect(normalizePost({ id: '1', title: 'T', is_published: true }).status).toBe('published');
  });

  it('maps is_published false to status "draft"', () => {
    expect(normalizePost({ id: '1', title: 'T', is_published: false }).status).toBe('draft');
  });

  it('passes through an existing status field without overriding', () => {
    expect(normalizePost({ id: '1', title: 'T', status: 'in_review' }).status).toBe('in_review');
  });

  it('defaults to "draft" when neither status nor is_published exists', () => {
    expect(normalizePost({ id: '1', title: 'T' }).status).toBe('draft');
  });

  it('maps publishedAt (camelCase) to published_at', () => {
    expect(normalizePost({ id: '1', title: 'T', publishedAt: '2026-01-01' }).published_at).toBe('2026-01-01');
  });

  it('passes through published_at when already snake_case', () => {
    expect(normalizePost({ id: '1', title: 'T', published_at: '2026-01-01' }).published_at).toBe('2026-01-01');
  });
});
