export function normalizeBrand(raw) {
  const status =
    raw.status ??
    raw.build_status ??
    raw.deploy_status ??
    (raw.is_active === true ? 'active' : raw.is_active === false ? 'inactive' : 'inactive');

  const created_at = raw.created_at ?? raw.createdAt ?? raw.date_created ?? null;

  return {
    id: raw.id ?? raw.brand_id ?? raw.site_id,
    name: raw.name ?? raw.site_name ?? '',
    status,
    created_at,
    domain: raw.domain ?? raw.custom_domain ?? null,
    slug: raw.slug ?? raw.site_slug ?? null,
    tagline: raw.tagline ?? null,
    github_repo: raw.github_repo ?? raw.repo_url ?? null,
    template_id: raw.template_id ?? 'default',
    target_audience: raw.target_audience ?? null,
    voice_and_tone: raw.voice_and_tone ?? null,
    mission: raw.mission ?? null,
  };
}

// Backward compat alias
export const normalizeSite = normalizeBrand;

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

export function normalizeSubscriber(raw) {
  return {
    id: raw.id ?? raw.subscriber_id,
    email: raw.email ?? '',
    name: raw.name ?? raw.full_name ?? null,
    type: raw.type ?? 'lead',
    lead_source: raw.lead_source ?? null,
    total_spend: typeof raw.total_spend === 'number' ? raw.total_spend : parseFloat(raw.total_spend ?? '0') || 0,
    created_at: raw.created_at ?? null,
  };
}

export function normalizeProduct(raw) {
  return {
    id: raw.id ?? raw.product_id,
    brand_id: raw.brand_id,
    name: raw.name ?? '',
    type: raw.type ?? 'digital',
    price: typeof raw.price === 'number' ? raw.price : parseFloat(raw.price ?? '0') || 0,
    description: raw.description ?? null,
    stripe_product_id: raw.stripe_product_id ?? null,
    created_at: raw.created_at ?? null,
  };
}
