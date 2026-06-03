const headers = () => ({
  'Content-Type': 'application/json',
  'x-admin-key': import.meta.env.VITE_ADMIN_KEY ?? '',
});

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, { ...options, headers: headers() });
    if (!res.ok) {
      const text = await res.text();
      return { data: null, error: text || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Network error' };
  }
}

export async function getSites() {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_SITES);
}

export async function createSite(payload) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_CREATE_SITE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getSiteDetail(siteId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_SITE_DETAIL, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId }),
  });
}

export async function updateBrand(siteId, brandData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_UPDATE_BRAND, {
    method: 'POST',
    body: JSON.stringify({
      site_id: siteId,
      primary_color: brandData.primaryColor,
      secondary_color: brandData.secondaryColor,
      accent_color: brandData.accentColor,
      background_color: brandData.backgroundColor,
      text_color: brandData.textColor,
      logo_url: brandData.logoUrl,
      favicon_url: brandData.faviconUrl,
      font_heading: brandData.fontHeading,
      font_body: brandData.fontBody,
      tagline: brandData.tagline,
      description: brandData.description,
      twitter_url: brandData.twitterUrl,
      instagram_url: brandData.instagramUrl,
      youtube_url: brandData.youtubeUrl,
    }),
  });
}

export async function savePost(siteId, postData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_POST, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, post: postData }),
  });
}

export async function getSubscribers(siteId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_SUBSCRIBERS, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId }),
  });
}

export async function triggerDeploy(siteId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_TRIGGER_DEPLOY, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId }),
  });
}
