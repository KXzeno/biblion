'use server';

// import { z } from "zod";
import { redirect } from "next/navigation";

export async function queryWord(prevState: { msg: string }, formData: FormData) {
  const word = formData.get('word');

  let success = true;

  const wordData = await fetch('http://localhost:3000/api/v1', {
    method: 'POST',
    body: JSON.stringify(word),
  }).then(res => res.json()).catch(() => success = false);

  if (!success || !word || wordData.length === 0 || typeof wordData[0] === 'string') {
    if (!word) { return { msg: '', similar: [] }; }

    return { 
      msg: `${word.toString().toLowerCase()}`,
      similar: wordData.filter((word: string) => typeof word === 'string'),
    };
  }

  redirect(`/dictionary/${word.toString().toLowerCase()}`);
}
