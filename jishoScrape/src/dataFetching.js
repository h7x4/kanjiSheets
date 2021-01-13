const fs = require('fs');
const util = require('util');
const jishoApi = require('unofficial-jisho-api');

const jisho = new jishoApi();

const txtFolder = './data/jouyou/';
const jishoBufferFolder = './data/jisho/';

const fetchCharactersFromTxt = file => [...fs.readFileSync(file, 'utf8')];
const fetchBufferedJishoResults = file => JSON.parse(fs.readFileSync(file, 'utf8'));

const makeDelayedJishoRequest = (kanji, delay) =>
  new Promise(
    (res, rej) => setTimeout(() => res(jisho.searchForKanji(kanji)), delay)
  );

/* Sort array of jisho results based on stroke count */
const sortJishoResults = jishoResult => jishoResult.sort((a, b) => a.strokeCount > b.strokeCount);

/* Fetches Jisho results with a delay of 50ms between each request */
const fetchKanjiFromJisho = async (kanjiArray) => {
  const delayedRequests = kanjiArray.map((kanji, i) => makeDelayedJishoRequest(kanji, i*50));
  const data = await Promise.all(delayedRequests);
  return sortJishoResults(data);
}

async function fetchJishoDataAndWriteToBuffer(grade) {
  const kanjiArray = fetchCharactersFromTxt(`${txtFolder}${grade}.txt`);
  const jishoResults = await fetchKanjiFromJisho(kanjiArray);

  fs.writeFileSync(
    `${jishoBufferFolder}${grade}.json`,
    JSON.stringify(jishoResults, null, " "),
    (err) => { if (err) console.error(err) }
  );

  return jishoResults;
}

  /** 
   * Handles fetching and storing the data from Jisho
   * @param {string} grade The grade of the kanji set
   * @param {function} log A custom log function
   * @returns {object} Jisho results 
  */
async function fetchJishoResults(grade, log) {

  const bufferFileExists = fs.existsSync(`${jishoBufferFolder}${grade}.json`);

  if(bufferFileExists) {
    log('Fetching Jisho data from buffer', grade);
    return fetchBufferedJishoResults(`${jishoBufferFolder}${grade}.json`);
  } else {
    log('Fetching data from Jisho and writing to buffer', grade);
    return await fetchJishoDataAndWriteToBuffer(grade);
  }
}

exports.fetchJishoResults = fetchJishoResults;
