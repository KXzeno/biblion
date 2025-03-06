'use server';

// import { z } from "zod";
// import { redirect } from "next/navigation";

export async function queryWord(prevState: { msg: string, similar: string[], rawData: object[] }, formData: FormData) {
  const word = formData.get('word');
  if (word === null) {
    throw new Error('Null input.');
  }

  let success = true;

  const isValid = validateWord(word.toString());

  if (isValid === false) {
    return {
      msg: '',
      similar: [],
      rawData: [
        { 
          target: word ? word.toString() : '',
          error: word ? `"${word.toString()}" has invalid characters` : 'Invalid input.'
        }
      ]
    };
  }

  const wordData = await fetch('https://biblion.karnovah.com/api/v1', {
    method: 'POST',
    body: JSON.stringify(word),
  }).then(res => { 
    return res.json();
  }).catch(() => success = false);

  if (Object.keys(wordData).includes('rawData')) {
    return wordData;
  }

  if (!success || !word || wordData.length === 0 || typeof wordData[0] === 'string') {
    if (!word) { return { msg: '', similar: [], rawData: [{}] }; }

    return { 
      msg: `${word.toString().toLowerCase()}`,
      similar: wordData.filter((word: string) => typeof word === 'string'),
      rawData: [{ target: word }, ...wordData],
    };
  }

  return { 
    msg: ``,
    similar: wordData.filter((word: string) => typeof word === 'string'),
    rawData: [{ target: word }, ...wordData],
  };
  // redirect(`/dictionary/${word.toString().toLowerCase()}`);
}

function validateWord(word: string): boolean {
  let onlyHiphensHaveMatched = true;

  const matchIterator = word.matchAll(/[\W]/g);

  for (const matchArr of matchIterator) {
    const matched = matchArr[0];

    if (matched === '-') {
      onlyHiphensHaveMatched = true; 
    } else if (onlyHiphensHaveMatched) {
      onlyHiphensHaveMatched = false;
    }
  }
  return onlyHiphensHaveMatched;
}
