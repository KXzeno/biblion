/**
 * Well-forms string inputs for blob constructions
 *
 * @param parts - an array of strings to well-form
 * @returns the parts well-formed
 */
export function makeWellFormed(parts: Array<string>): Array<string> {
  const newParts = parts.map(part => part.toWellFormed());
  return newParts;
}

/**
 * Uses Merriam-Webster's dictionary API 
 * to fetch word data from a given input
 *
 * @param word - the word for endpoint
 * @returns an object conforming to Merriam's
 * data models, else null if response is 400-500
 */
export default async function getWordData(word: string): Promise<unknown[] | null> {
  // Reference env vars
  const apiKey = process.env.API_KEY;
  const dictionaryEndpoint = process.env.ENDPOINT;

  // Use string interpolation to construct full API URL
  const req = `${dictionaryEndpoint}${word}?key=${apiKey}`;

  // Retrieve response
  const res = await fetch(req).then(res => res.json());

  return res
}

