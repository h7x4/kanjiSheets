const fs = require('fs');
const util = require('util');
const jishoApi = require('unofficial-jisho-api');
const jisho = new jishoApi();

const txtFolder = './data/jouyou/';
const jishoBufferFolder = './data/jisho/';

/* Async version of fs.readFile */
const readFile = util.promisify(fs.readFile);

async function fetchCharactersFromTxt(file) {
  const data = await readFile(file, 'utf8');
  return [...data];
}

async function fetchBufferedJishoResults(file) {
  const data = await readFile(file, 'utf8');
  return JSON.parse(data);
}

async function makeDelayedJishoRequest(kanji, delay) {
  return new Promise((res, rej) => {
    setTimeout(() => { res(jisho.searchForKanji(kanji)); }, delay);
  });
}

/* Sort array of jisho results based on stroke count */
const sortJishoResults = (jishoResult) => jishoResult.sort((a, b) => (a.strokeCount > b.strokeCount) ? 1 : -1);

/* Fetches Jisho results with a delay of 50ms between each request */
async function fetchKanjiFromJisho(kanjiArray) {
  const delayedRequests = kanjiArray.map(async (kanji, i) => await makeDelayedJishoRequest(kanji, i*50));
  const data = await Promise.all(delayedRequests);
  return sortJishoResults(data);
}


async function fetchJishoDataAndWriteToBuffer(grade) {
  const kanjiArray = await fetchCharactersFromTxt(`${txtFolder}${grade}.txt`);
  const jishoResults = await fetchKanjiFromJisho(kanjiArray);
  fs.writeFile(
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
    log('Fetching Jisho data from buffer', grade)
    return await fetchBufferedJishoResults(`${jishoBufferFolder}${grade}.json`);
  } else {
    log('Fetching data from Jisho and writing to buffer', grade)
    return await fetchJishoDataAndWriteToBuffer(grade);
  }
}

exports.fetchJishoResults = fetchJishoResults;