const fs = require('fs');

/* Import local files */
const {fetchKanjiFromTxt, fetchJishoBufferData, fetchKanjiFromJisho} = require('./src/dataFetching.js');
const {getKanjiTexData} = require('./src/texConversion.js');
const {kanjiTable} = require('./src/kanjiTables.js');

function log(message, jlptLevel) {
  const jlptLevelCaps = jlptLevel.toUpperCase();
  console.log(`${jlptLevelCaps}: ${message}`);
}

/* Encapsulate main process in async function */
async function main(jlptLevel) {

  const jishoResults = await fetchJishoResults(jlptLevel);
  const kanjiArray = jishoResults.map(result => result.query);

  log('Generating tex pages', jlptLevel);
  const texData = getKanjiTexData(jishoResults);

  log('Generating chapter table page', jlptLevel);
  const resultTable = kanjiTable(kanjiArray);

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

  /** Fetch data from buffer if available.
  *  Else fetch data from txt and jisho requests,
  *  and make buffer files
  */
async function fetchJishoResults(jlptLevel) {

  const bufferFileExists = fs.existsSync(`./data/jisho/${jlptLevel}.json`);

  if(bufferFileExists) {
    log('Fetching Jisho data from buffer', jlptLevel)
    return await fetchJishoBufferData(`./data/jisho/${jlptLevel}.json`);
  } else {
    log('Fetching data from Jisho and writing to buffer', jlptLevel)
    return await fetchJishoDataAndWriteToBuffer(jlptLevel);
  }
}

async function fetchJishoDataAndWriteToBuffer(jlptLevel) {
  const kanjiArray = await fetchKanjiFromTxt(`./data/txt/${jlptLevel}.txt`);
  const jishoResults = await fetchKanjiFromJisho(kanjiArray);
  fs.writeFile(`./data/jisho/${jlptLevel}.json`, JSON.stringify(jishoResults, null, " "), (err) => {if (err) console.error(err)});
  return jishoResults;
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