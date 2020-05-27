const fs = require('fs');
const util = require('util');
const jishoApi = require('unofficial-jisho-api');
const jisho = new jishoApi();

/**
 * Reads a txt file and splits the characters into an array
 * @param {string} file Path to file
 * @returns {string[]} A list of Kanji
 */
async function fetchKanjiFromTxt(file) {
  const read = util.promisify(fs.readFile);
  const data = await read(file, 'utf8');
  return data.split('');
}

/**
 * Reads a json file and returns the data as an object
 * @param {string} file Path to file
 * @returns {object} Jisho results
 */
async function fetchJishoBufferData(file) {
  const read = util.promisify(fs.readFile);
  const data = await read(file, 'utf8');
  return JSON.parse(data);
}

/**
 * Makes a delayed kanji search request in order not to overload the server.
 * @param {string} kanji A character to search for
 * @param {number} delay A number of milliseconds delay to the request
 * @return {promise} A promise that's going to run a request after the specified delay
 */
async function delayedJishoCall(kanji, delay) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(jisho.searchForKanji(kanji));
    }, delay);
  })
}

/* Sort list of result array */
const sortKanji = (kanjiData) => kanjiData.sort((a, b) => (a.strokeCount > b.strokeCount) ? 1 : -1);

/**
 * Searches for kanji with a 50ms interval between each request.
 * @param {string[]} kanjiArray A list of kanji to search for.
 * @returns {object} JSON data containing a sorted list of search responses.
 */
async function fetchKanjiFromJisho(kanjiArray) {
  const promises = kanjiArray.map(async (kanji, i) => await delayedJishoCall(kanji, i*50));
  const data = await Promise.all(promises);
  return sortKanji(data);
}

exports.fetchKanjiFromTxt = fetchKanjiFromTxt;
exports.fetchJishoBufferData = fetchJishoBufferData;
exports.fetchKanjiFromJisho = fetchKanjiFromJisho;