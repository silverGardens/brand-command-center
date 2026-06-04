export const TEMPLATES = [
  {
    id: 'default',
    name: 'Default',
    description: 'Standard niche content site — hero, blog feed, newsletter signup.',
  },
];

export function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];
}
