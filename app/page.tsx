import { DictionaryEntryParser } from "./utils/core/DictionaryEntryParser";

import 'dotenv/config';
import Landing from "./components/main/Landing";

export default async function Home() {
  // const test = await fetch('http://localhost:3000/api/v1');
  // console.log(await test.blob().then(res => res.text()));

  return (
    <>
      <Landing />
    </>
  );
}
