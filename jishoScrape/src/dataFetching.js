const fs = require('fs');
const util = require('util');
const jishoApi = require('unofficial-jisho-api');
const jisho = new jishoApi();

async function fetchKanjiFromTxt(file) {
  const read = util.promisify(fs.readFile);
  const data = await read(file, 'utf8');
  return data.split('');
}

async function delayedJishoCall(kanji, delay) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(jisho.searchForKanji(kanji));
    }, delay);
  })
}

/* Sort list of result array */
const sortKanji = (kanjiData) => kanjiData.sort((a, b) => (a.strokeCount > b.strokeCount) ? 1 : -1);

/* Function to fetch jisho data for all kanjis in an array */
async function fetchKanjiFromJisho(kanjiArray) {
  const promises = kanjiArray.map(async (kanji, i) => await delayedJishoCall(kanji, i*50));
  const data = await Promise.all(promises);
  return sortKanji(data);
}

exports.fetchKanjiFromTxt = fetchKanjiFromTxt;
exports.fetchKanjiFromJisho = fetchKanjiFromJisho;