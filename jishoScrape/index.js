const fs = require('fs');

/* Local files */
const {fetchKanjiFromTxt, fetchKanjiFromJisho} = require('./src/dataFetching.js');
const {getKanjiTexData} = require('./src/texConversion.js');
const {kanjiTable} = require('./src/kanjiTables.js');

/* Encapsulate main process in async function */
async function main(jlptLevel) {

  const kanjiArray = await fetchKanjiFromTxt(`./data/txt/${jlptLevel}.txt`);
  console.log(`Fetched txt for ${jlptLevel}`);

  const results = await fetchKanjiFromJisho(kanjiArray);
  console.log(`Fetched data from Jisho for ${jlptLevel}`);

  const sortedResults = sortKanji(results);
  const sortedKanji = sortedResults.map(result => result.query);
  const texData = getKanjiTexData(sortedResults);
  console.log(`Processed pages for ${jlptLevel}`);

  const resultTable = kanjiTable(sortedKanji);
  console.log(`Processed table for ${jlptLevel}`);

  let resultPage = '';
  for (kanji of texData) {
    resultPage+=`${kanji.kanjiPageHeader}
      ${kanji.kanjiMeaning ? kanji.kanjiMeaning : ''}
      ${kanji.kunyomi ? kanji.kunyomi : ''}
      ${kanji.onyomi ? kanji.onyomi : ''}
      ${kanji.kanjiRow}
      \\newpage\n`;
  }

  fs.writeFile(`../data/tables/${jlptLevel}.tex`, resultTable, (err) => {if (err) console.error(err)});
  fs.writeFile(`../data/pages/${jlptLevel}.tex`, resultPage, (err) => {if (err) console.error(err)});
}

async function mainWrapper() {

  try {
    if (!/n\d/.test(process.argv[2])) throw 'Input not valid';
    await main(process.argv[2]);
  } catch (error) {
    console.error(error);
  }
}

mainWrapper();