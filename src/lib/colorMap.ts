export const COLOR_MAP: Record<string, string> = {
  // Primary Colors
  black: '#000000',
  white: '#ffffff',
  
  // Neutrals
  gray: '#6b7280',
  beige: '#f5f5dc',
  cream: '#fffdd0',
  tan: '#d2b48c',
  taupe: '#b38b6d',
  
  // Warm Tones
  ivory: '#fffff0',
  khaki: '#f0e68c',
  sand: '#c2b280',
  gold: '#ffd700',
  bronze: '#cd7f32',
  copper: '#b87333',
  rust: '#b7410e',
  
  // Reds & Pinks
  red: '#dc2626',
  pink: '#ec4899',
  rose: '#f43f5e',
  burgundy: '#800020',
  coral: '#ff7f50',
  salmon: '#fa8072',
  
  // Blues
  blue: '#2563eb',
  navy: '#001f3f',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  indigo: '#4f46e5',
  
  // Greens
  green: '#16a34a',
  olive: '#808000',
  sage: '#9dc183',
  mint: '#98ff98',
  forest: '#228b22',
  
  // Purples
  purple: '#a855f7',
  lavender: '#e6e6fa',
  plum: '#dda0dd',
  
  // Browns
  brown: '#8b4513',
  chocolate: '#7b3f00',
  maroon: '#800000',
};

export const getColorHex = (colorName: string): string => {
  return COLOR_MAP[colorName.toLowerCase()] || '#9ca3af'; // Default gray if not found
};
