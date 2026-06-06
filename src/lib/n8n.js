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

export async function getBrands() {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_SITES);
}

export async function createBrand(payload) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_CREATE_SITE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBrandDetail(brandId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_SITE_DETAIL, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId }),
  });
}

export async function updateBrandProfile(brandId, brandData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_UPDATE_BRAND, {
    method: 'POST',
    body: JSON.stringify({
      brand_id: brandId,
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
      target_audience: brandData.targetAudience,
      voice_and_tone: brandData.voiceAndTone,
      mission: brandData.mission,
    }),
  });
}

export async function savePost(brandId, postData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_POST, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, post: postData }),
  });
}

export async function getSubscribers(brandId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_SUBSCRIBERS, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId }),
  });
}

export async function triggerDeploy(brandId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_TRIGGER_DEPLOY, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId }),
  });
}

export async function getAnalytics() {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_ANALYTICS);
}

export async function generateIdeas(brandId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GENERATE_IDEAS, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId }),
  });
}

export async function researchPost(brandId, postId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_RESEARCH_POST, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, post_id: postId }),
  });
}

export async function writeDraft(brandId, postId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_WRITE_DRAFT, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, post_id: postId }),
  });
}

export async function agentReviewPost(brandId, postId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_AGENT_REVIEW, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, post_id: postId }),
  });
}

export async function planEdit(brandId, postId, instruction) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_PLAN_EDIT, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, post_id: postId, instruction }),
  });
}

export async function executeEdit(brandId, postId, plan, currentContent) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_EXECUTE_EDIT, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, post_id: postId, plan, current_content: currentContent }),
  });
}

export async function approvePost(brandId, postId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_APPROVE_POST, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, post_id: postId }),
  });
}

export async function setTemplatePref(brandId, templateId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SET_TEMPLATE, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, template_id: templateId }),
  });
}

export async function analyzeSEO(brandId, postId, focusKeyword, content) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_ANALYZE_SEO, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, post_id: postId, focus_keyword: focusKeyword, content }),
  });
}

export async function getSocialPosts(brandId, platform) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_SOCIAL_POSTS, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, platform }),
  });
}

export async function generateSocialContent(brandId, platform, postId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GENERATE_SOCIAL, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, platform, post_id: postId }),
  });
}

export async function saveSocialPost(brandId, platform, postData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_SOCIAL_POST, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, platform, ...postData }),
  });
}

export async function deleteSocialPost(brandId, socialPostId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_DELETE_SOCIAL_POST, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, id: socialPostId }),
  });
}

export async function publishSocialPostNow(brandId, socialPostId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_PUBLISH_SOCIAL_POST, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, id: socialPostId }),
  });
}

export async function getConnectedAccounts(brandId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_CONNECTED_ACCOUNTS, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId }),
  });
}

export async function connectPlatformAccount(brandId, platform) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_CONNECT_PLATFORM, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, platform }),
  });
}

export async function disconnectPlatformAccount(brandId, platform) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_DISCONNECT_PLATFORM, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, platform }),
  });
}

export async function getEmailSequences(brandId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_EMAIL_SEQUENCES, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId }),
  });
}

export async function saveEmailSequence(brandId, sequenceData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_EMAIL_SEQUENCE, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, ...sequenceData }),
  });
}

export async function getNewsletterIssues(brandId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_NEWSLETTER_ISSUES, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId }),
  });
}

export async function saveNewsletterIssue(brandId, issueData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_NEWSLETTER_ISSUE, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, ...issueData }),
  });
}

export async function generateNewsletterIssue(brandId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GENERATE_NEWSLETTER, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId }),
  });
}

export async function getTemplateRegistry() {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_TEMPLATE_REGISTRY);
}

export async function getPages(brandId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_PAGES, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId }),
  });
}

export async function savePage(brandId, pageData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_PAGE, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, ...pageData }),
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

export async function extractTemplate(brandId, pageSlug) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_EXTRACT_TEMPLATE, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, page_slug: pageSlug }),
  });
}

export async function getProducts(brandId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_PRODUCTS, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId }),
  });
}

export async function saveProduct(brandId, productData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_PRODUCT, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, ...productData }),
  });
}

export async function getPurchases(brandId, period = 'all') {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_PURCHASES, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, period }),
  });
}

export async function savePurchase(brandId, purchaseData) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_SAVE_PURCHASE, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, ...purchaseData }),
  });
}

export async function getRevenueSummary(brandId, period = 'month') {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_REVENUE_SUMMARY, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId, period }),
  });
}

export async function getAudienceMetrics(brandId) {
  return safeFetch(import.meta.env.VITE_WEBHOOK_GET_AUDIENCE_METRICS, {
    method: 'POST',
    body: JSON.stringify({ brand_id: brandId }),
  });
}
