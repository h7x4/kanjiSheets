const jishoApi = require('unofficial-jisho-api');
jisho = new jishoApi();
fs = require('fs');
const util = require('util');

/************************************************************************
***************************** Data fetching *****************************
************************************************************************/

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

/* Function to fetch jisho data for all kanjis in an array */
async function fetchKanjiFromJisho(kanjiArray) {
  const promises = kanjiArray.map(async (kanji, i) => await delayedJishoCall(kanji, i*50));
  return await Promise.all(promises);
}

/************************************************************************
***************************** Kanji tables ******************************
************************************************************************/

function kanjiTable(kanjiArray) {
  const xLength = 20;
  const yLength = Math.ceil(kanjiArray.length/xLength);
  const sideLength = Math.ceil(Math.sqrt(kanjiArray.length));

  let tableString = '';
  for (let y_index = 0; y_index < yLength; y_index++) {

    const lineArray = new Array;

    for (let x_index = 0; x_index < xLength; x_index++) {
      const indexNumber = y_index * yLength + x_index;
      lineArray.push(kanjiArray[indexNumber] ? kanjiArray[indexNumber] : '');
    }

    tableString += `${lineArray.join(' & ')} \\\\\n`
  }

  return `\\begin{tabular}{ ${'c '.repeat(xLength)}}
${tableString}\\end{tabular}`
}

/************************************************************************
**************************** Page Processing ****************************
************************************************************************/

const yomiBrackets = ['\\textbf{\\textcolor{myGreen!80!black}{', '}}'];
const yomiConnector = '、 ';
const yomiDash = '—';

function convertKunyomi(res) {

  if (res.kunyomi.length === 0) return '';

  const kunyomi = JSON.stringify(res.kunyomi)
    .replace(/"|\[|\]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&')
    .split(',');

  for (const i in kunyomi) {
    instance = kunyomi[i];

    if (instance.includes('.') && instance.includes('-')) {

    }
    else if (instance.includes('.')) {
      const words = instance.split('.');
      words[0] = yomiBrackets[0] + words[0] + yomiBrackets[1];
      kunyomi[i] = words.join('');
    }
    else if (instance.includes('-')) {
      const words = instance.split(/(?<=\-)/);
      if (words[0] == '-') { // ['-', 'word']
        words[0] = yomiDash;
        words[1] = yomiBrackets[0] + words[1] + yomiBrackets[1];
      } else {               // ['Word-', '']
        words[1] = yomiDash;
        words[0] = words[0].slice(0, words[0].length-1);
        words[0] = yomiBrackets[0] + words[0] + yomiBrackets[1];
      }
      kunyomi[i] = words.join('');
    }
    else {
      kunyomi[i] = yomiBrackets[0] + instance + yomiBrackets[1];
    }
  }

  return kunyomi.join(yomiConnector);
}

function convertOnyomi(res) {
  return JSON.stringify(res.onyomi)
    .replace(/"|\[|\]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/,/g, yomiConnector)
    .replace(/&/g, '\\&');
}

function convertMeaning(res) {
  return res.meaning
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&');
}

/************************************************************************
**************************** Main Functions *****************************
************************************************************************/

/* Sort list of result array */
const sortKanji = (kanjiData) => kanjiData.sort((a, b) => (a.strokeCount > b.strokeCount) ? 1 : -1);

/* Process result array into object with LaTeX strings */
function getKanjiTexData(kanjiArray) {
  return kanjiArray.map(kanji => {

    const meaning = convertMeaning(kanji);
    const kunyomi = convertKunyomi(kanji);
    const onyomi = convertOnyomi(kanji);

    return {
      kanji: kanji.query,
      kanjiPageHeader: `\\kanjiPageHeader{${kanji.query}}{${kanji.taughtIn}}{${kanji.jlptLevel}}{${kanji.strokeCount}}{${kanji.radical.symbol}}`,
      kanjiMeaning: meaning ? `\\kanjiMeaning{${meaning}}` : '',
      kunyomi: kunyomi ? `\\kunyomi{${kunyomi}}` : '',
      onyomi: onyomi ? `\\onyomi{${onyomi}}` : '',
      kanjiRow: `\\kanjiRow{${kanji.query}}`
    }

  });
}

/* Encapsulating main process in async function */
async function main(jlptLevel) {

  const kanjiArray = await fetchKanjiFromTxt(`../data/txt/${jlptLevel}.txt`);
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

async function loopMain() {
  await main('n5');
  await main('n4');
  await main('n3');
  await main('n2');
  await main('n1');
}

loopMain();