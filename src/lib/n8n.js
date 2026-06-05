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
    const json = await res.json();
    const data = (json && typeof json.data !== 'undefined') ? json.data : json;
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
      surface_color: brandData.surfaceColor,
      text_color: brandData.textColor,
      muted_color: brandData.mutedColor,
      logo_url: brandData.logoUrl,
      favicon_url: brandData.faviconUrl,
      font_heading: brandData.fontHeading,
      font_body: brandData.fontBody,
      tagline: brandData.tagline,
      description: brandData.description,
      contact_email: brandData.contactEmail,
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

export async function getAnalytics() {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_ANALYTICS);
}

// Editorial pipeline
export async function generateIdeas(siteId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GENERATE_IDEAS, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId }),
  });
}

export async function researchPost(siteId, postId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_RESEARCH_POST, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, post_id: postId }),
  });
}

export async function writeDraft(siteId, postId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_WRITE_DRAFT, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, post_id: postId }),
  });
}

export async function agentReviewPost(siteId, postId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_AGENT_REVIEW, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, post_id: postId }),
  });
}

export async function planEdit(siteId, postId, instruction) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_PLAN_EDIT, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, post_id: postId, instruction }),
  });
}

export async function executeEdit(siteId, postId, plan, currentContent) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_EXECUTE_EDIT, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, post_id: postId, plan, current_content: currentContent }),
  });
}

export async function approvePost(siteId, postId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_APPROVE_POST, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, post_id: postId }),
  });
}

export async function setTemplatePref(siteId, templateId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SET_TEMPLATE, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, template_id: templateId }),
  });
}

export async function analyzeSEO(siteId, postId, focusKeyword, content) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_ANALYZE_SEO, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, post_id: postId, focus_keyword: focusKeyword, content }),
  });
}

// Social pipeline
export async function getSocialPosts(siteId, platform) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_SOCIAL_POSTS, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, platform }),
  });
}

export async function generateSocialContent(siteId, platform, postId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GENERATE_SOCIAL, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, platform, post_id: postId }),
  });
}

export async function saveSocialPost(siteId, platform, postData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_SOCIAL_POST, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, platform, ...postData }),
  });
}

export async function deleteSocialPost(siteId, socialPostId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_DELETE_SOCIAL_POST, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, id: socialPostId }),
  });
}

// Email sequences & newsletter
export async function getEmailSequences(siteId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_EMAIL_SEQUENCES, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId }),
  });
}

export async function saveEmailSequence(siteId, sequenceData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_EMAIL_SEQUENCE, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, ...sequenceData }),
  });
}

export async function getNewsletterIssues(siteId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_NEWSLETTER_ISSUES, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId }),
  });
}

export async function saveNewsletterIssue(siteId, issueData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_NEWSLETTER_ISSUE, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, ...issueData }),
  });
}

export async function generateNewsletterIssue(siteId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GENERATE_NEWSLETTER, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId }),
  });
}

export async function publishSocialPostNow(siteId, socialPostId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_PUBLISH_SOCIAL_POST, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, id: socialPostId }),
  });
}

export async function getConnectedAccounts() {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_CONNECTED_ACCOUNTS);
}

export async function connectPlatformAccount(platform) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_CONNECT_PLATFORM, {
    method: 'POST',
    body: JSON.stringify({ platform }),
  });
}

export async function disconnectPlatformAccount(platform) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_DISCONNECT_PLATFORM, {
    method: 'POST',
    body: JSON.stringify({ platform }),
  });
}

// Page builder & template system
export async function getTemplateRegistry() {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_TEMPLATE_REGISTRY);
}

export async function getPages(siteId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_PAGES, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId }),
  });
}

export async function savePage(siteId, pageData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_PAGE, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, ...pageData }),
  });
}

export async function buildPageFromDescription(description) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_BUILD_PAGE_DESCRIPTION, {
    method: 'POST',
    body: JSON.stringify({ description }),
  });
}

export async function buildPageFromScreenshot(imageData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_BUILD_PAGE_SCREENSHOT, {
    method: 'POST',
    body: JSON.stringify({ image_data: imageData }),
  });
}

export async function extractTemplate(siteId, pageSlug) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_EXTRACT_TEMPLATE, {
    method: 'POST',
    body: JSON.stringify({ site_id: siteId, page_slug: pageSlug }),
  });
}
