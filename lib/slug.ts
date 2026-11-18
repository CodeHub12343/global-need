export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const stem = slugify(base) || 'item';
  let candidate = stem;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await exists(candidate)) {
    candidate = `${stem}-${n++}`;
    if (n > 500) throw new Error('Unable to allocate unique slug');
  }
  return candidate;
}

const ADJ = ['hope', 'kind', 'warm', 'bright', 'steady', 'calm', 'strong', 'clear'];
const NOUN = ['haven', 'river', 'grove', 'field', 'horizon', 'summit', 'shore', 'orchard'];

export function sampleNameFragment(seed: number) {
  return `${ADJ[seed % ADJ.length]}-${NOUN[(seed * 7) % NOUN.length]}`;
}
