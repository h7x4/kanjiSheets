const fs = require('fs');

/* Import local files */
const { fetchJishoResults } = require('./src/dataFetching.js');
const { getKanjiTexData } = require('./src/texConversion.js');
const { chapterTabular } = require('./src/kanjiTables.js');

/* Encapsulate main process in async function */
async function main(grade) {

  /* Custom log function */
  function log(message) {
    const gradeCaps = grade.toUpperCase();
    console.log(`${gradeCaps}: ${message}`);
  }

  const jishoResults = await fetchJishoResults(grade, log);
  const kanjiArray = jishoResults.map(result => result.query);

  log('Generating tex pages');
  const texData = getKanjiTexData(jishoResults);

  log('Generating chapter table page');
  const chapterTable = chapterTabular(kanjiArray, 16);

  let resultPage = '';
  for (kanji of texData) {
    resultPage+=`${kanji.kanjiPageHeader}
      ${kanji.kanjiMeaning ? kanji.kanjiMeaning : ''}
      ${kanji.kunyomi ? kanji.kunyomi : ''}
      ${kanji.onyomi ? kanji.onyomi : ''}
      ${kanji.kanjiRow}
      \\newpage\n`;
  }

  fs.writeFile(
    `./data/tables/${grade}.tex`,
    chapterTable,
    (err) => { if (err) console.error(err) }
    );
  fs.writeFile(
    `./data/pages/${grade}.tex`,
    resultPage,
    (err) => { if (err) console.error(err) }
  );
}

/* Handle args */
async function argWrapper() {

  try {
    if (!/grade\d/.test(process.argv[2])) throw 'Input not valid';
    await main(process.argv[2]);
  } catch (error) {
    console.error(error);
  }
}

argWrapper();