export function normalizeSite(raw) {
  const status =
    raw.status ??
    raw.build_status ??
    raw.deploy_status ??
    (raw.is_active === true ? 'active' : raw.is_active === false ? 'inactive' : 'inactive');

  const created_at = raw.created_at ?? raw.createdAt ?? raw.date_created ?? null;

  return {
    id: raw.id ?? raw.site_id,
    name: raw.name ?? raw.site_name ?? '',
    status,
    created_at,
    domain: raw.domain ?? raw.custom_domain ?? null,
    slug: raw.slug ?? raw.site_slug ?? null,
    tagline: raw.tagline ?? null,
    github_repo: raw.github_repo ?? raw.repo_url ?? null,
    template_id: raw.template_id ?? 'default',
  };
}

export function normalizePost(raw) {
  const status =
    raw.status ??
    (raw.is_published === true ? 'published' : raw.is_published === false ? 'draft' : 'draft');

  return {
    id: raw.id ?? raw.post_id,
    title: raw.title ?? '',
    status,
    published_at: raw.published_at ?? raw.publishedAt ?? null,
    created_at: raw.created_at ?? raw.createdAt ?? null,
    slug: raw.slug ?? null,
    content: raw.content ?? null,
    excerpt: raw.excerpt ?? null,
  };
}
