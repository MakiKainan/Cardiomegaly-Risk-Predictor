/// <reference types="vite/client" />
// URLs for the local sample chest X-rays, pulled straight from /samples by Vite.
const modules = import.meta.glob('../samples/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const keys = Object.keys(modules).sort();

export const sampleImages = keys.map((k) => modules[k] as string);

// Same images, but keep the original filename so the demo page can join each
// sample to its precomputed row in samples/metadata.json.
export const sampleEntries = keys.map((k) => ({
  name: k.split('/').pop() as string, // e.g. "sample_000.png"
  url: modules[k] as string,
}));
