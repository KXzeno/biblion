'use server';

// import { z } from "zod";
// import { redirect } from "next/navigation";

export async function queryWord(prevState: { msg: string, similar: string[], rawData: object[] }, formData: FormData) {
  const word = formData.get('word');

  let success = true;

  const wordData = await fetch('http://biblion.karnovah.com/api/v1', {
    method: 'POST',
    body: JSON.stringify(word),
  }).then(res => res.json()).catch(() => success = false);

  if (!success || !word || wordData.length === 0 || typeof wordData[0] === 'string') {
    if (!word) { console.log(3); return { msg: '', similar: [], rawData: [{}] }; }

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
