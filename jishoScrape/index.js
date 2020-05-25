const fs = require('fs');

/* Local files */
const {fetchKanjiFromTxt, fetchKanjiFromJisho} = require('./src/dataFetching.js');
const {getKanjiTexData} = require('./src/texConversion.js');
const {kanjiTable} = require('./src/kanjiTables.js');

/* Encapsulate main process in async function */
async function main(jlptLevel) {

  const jlptLevelCaps = jlptLevel.toUpperCase();

  const kanjiArray = await fetchKanjiFromTxt(`./data/txt/${jlptLevel}.txt`);
  console.log(`${jlptLevelCaps}: Fetched txt`);

  const results = await fetchKanjiFromJisho(kanjiArray);
  console.log(`${jlptLevelCaps}: Fetched Jisho data`);

  const sortedKanjiArray = results.map(result => result.query);
  const texData = getKanjiTexData(results);
  console.log(`${jlptLevelCaps}: Processed pages`);

  const resultTable = kanjiTable(sortedKanjiArray);
  console.log(`${jlptLevelCaps}: Processed table`);

  let resultPage = '';
  for (kanji of texData) {
    resultPage+=`${kanji.kanjiPageHeader}
      ${kanji.kanjiMeaning ? kanji.kanjiMeaning : ''}
      ${kanji.kunyomi ? kanji.kunyomi : ''}
      ${kanji.onyomi ? kanji.onyomi : ''}
      ${kanji.kanjiRow}
      \\newpage\n`;
  }

  fs.writeFile(`./data/tables/${jlptLevel}.tex`, resultTable, (err) => {if (err) console.error(err)});
  fs.writeFile(`./data/pages/${jlptLevel}.tex`, resultPage, (err) => {if (err) console.error(err)});
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