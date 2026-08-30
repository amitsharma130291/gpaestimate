// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Old redirect targets and still-unbuilt "coming soon" placeholders — kept out
// of the sitemap so Google isn't pointed at pages that are noindex or 8-word
// redirect notices.
const EXCLUDED_FROM_SITEMAP = [
  '/predictor/',
  '/weighted-gpa/',
  '/cumulative-gpa/',
  '/high-school-gpa/',
  '/final-grade/',
  '/grading-scales/',
  '/gpa-requirements/',
  '/how-to-raise-your-gpa/',
  '/resources/',
  '/university-calculators/',
  '/grade-to-gpa/',
  '/percentage-to-gpa/',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://gpaestimate.com',
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return !EXCLUDED_FROM_SITEMAP.includes(path);
      },
    }),
  ],

  redirects: {
    '/predictor': '/gpa-predictor/',
    '/weighted-gpa': '/weighted-gpa-calculator/',
    '/cumulative-gpa': '/cumulative-gpa-calculator/',
    '/high-school-gpa': '/high-school-gpa-calculator/',
    '/final-grade': '/final-grade-calculator/',
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
