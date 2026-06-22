/// <reference types="vite/client" />
// URLs for the local sample chest X-rays, pulled straight from /samples by Vite.
const modules = import.meta.glob('../samples/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const sampleImages = Object.keys(modules)
  .sort()
  .map((k) => modules[k] as string);
