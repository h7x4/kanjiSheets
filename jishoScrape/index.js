const fs = require('fs');

/* Import local files */
const {fetchKanjiFromTxt, fetchJishoBufferData, fetchKanjiFromJisho} = require('./src/dataFetching.js');
const {getKanjiTexData} = require('./src/texConversion.js');
const {kanjiTable} = require('./src/kanjiTables.js');

/* Encapsulate main process in async function */
async function main(jlptLevel) {

  const jlptLevelCaps = jlptLevel.toUpperCase();

  /* Fetch data from buffer if available.
  *  Else fetch data from txt and jisho requests,
  *  and make buffer files
  */
  if(fs.existsSync(`./data/jisho/${jlptLevel}.json`)) {
    var jishoResults = await fetchJishoBufferData(`./data/jisho/${jlptLevel}.json`);
    console.log(`${jlptLevelCaps}: Fetched Jisho data from buffer`);

  } else {
    const kanjiArray = await fetchKanjiFromTxt(`./data/txt/${jlptLevel}.txt`);
    console.log(`${jlptLevelCaps}: Fetched txt`);
  
    var jishoResults = await fetchKanjiFromJisho(kanjiArray);
    console.log(`${jlptLevelCaps}: Fetched Jisho data`);

    fs.writeFile(`./data/jisho/${jlptLevel}.json`, JSON.stringify(jishoResults, null, " "), (err) => {if (err) console.error(err)});
    console.log(`${jlptLevelCaps}: Written Jisho data to buffer`);
  }

  const sortedKanjiArray = jishoResults.map(result => result.query);
  const texData = getKanjiTexData(jishoResults);
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

/* Handle args */
async function argWrapper() {

  try {
    if (!/n\d/.test(process.argv[2])) throw 'Input not valid';
    await main(process.argv[2]);
  } catch (error) {
    console.error(error);
  }
}

argWrapper();