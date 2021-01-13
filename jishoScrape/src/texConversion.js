const stylingBrackets = {
  "start": '\\textbf{\\textcolor{kanjiColor!80!black}{',
  "end": '}}'
};
const yomiConnector = '、 ';
const yomiDash = '—';

const regexes = [
  [/"|\[|\]/g, ''], // Remove all []
  [/\\/g, '\\\\'], // Escape \
  [/%/g, '\\%'], //Escape %
  [/&/g, '\\&'], // Escape &
  [/,/g, yomiConnector] // convert all , to yomiConnector
]

const styleText = string => `\\emphasize{${string}}`;

// ab.c -> \emph{ab}.c
const styleCharactersBeforeDot = string => {
  const words = string.split('.');
  words[0] = styleText(words[0]);
  return words.join('');
}

// abc- -> \emph{abc}-
const styleEverythingExceptDash = string => {
  const parts = string.split(/(?<=\-)/);
  if (parts[0] === '-') { // ['-', 'abc']
    parts[0] = yomiDash;
    parts[1] = styleText(parts[1]);
  } else {               // ['abc-', '']
    parts[1] = yomiDash;
    parts[0] = parts[0].slice(0, -1);
    parts[0] = styleText(parts[0]);
  }
  return parts.join('');
}

const convertKunyomi = jishoResult =>
  jishoResult.kunyomi.length === 0
    ? ''
    : JSON.stringify(jishoResult.kunyomi)
      .replace(/"|\[|\]/g, '')
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/&/g, '\\&')
      .split(',')
      .map(reading => {
        if (reading.includes('.') && reading.includes('-'))
						return `${yomiDash}${styleCharactersBeforeDot(reading.slice(1))}`
        else if (reading.includes('.'))
          return styleCharactersBeforeDot(reading);
        else if (reading.includes('-'))
          return styleEverythingExceptDash(reading);
        else
          return styleText(reading);
      })
      .join(yomiConnector);

const convertOnyomi = jishoResult =>
  JSON.stringify(jishoResult.onyomi)
    .replace(/"|\[|\]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&')
    .split(',')
    .map(styleText)
    .join(yomiConnector);

    //TODO: Style only the words, and not the yomiConnector inbetween

const convertMeaning = jishoResult => 
  jishoResult.meaning
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&');

const makeFirstLetterUppercase = string => string.charAt(0).toUpperCase() + string.slice(1);

/**
 * Generate TeX strings from Jisho data
 * @param {object[]} jishoResults Array of results fetched from Jisho
 * @param {string} grade 
 * @returns {object} An object containg TeX strings
 */
const getKanjiTexData = (jishoResults, grade) => {

  grade = grade.slice(0,5) + ' ' + grade.slice(5); // graden -> grade n
  grade = makeFirstLetterUppercase(grade);
  if (grade === 'Grade 7') grade = 'Junior High';

   return jishoResults.map(jishoResult => {

    const meaning = convertMeaning(jishoResult);
    const kunyomi = convertKunyomi(jishoResult);
    const onyomi = convertOnyomi(jishoResult);

    return {
      kanjiPageHeader: `\\kanjiPageHeader{${jishoResult.query}}{${grade}}{${jishoResult.jlptLevel}}{${jishoResult.strokeCount}}{${jishoResult.radical.symbol}}`,
      label: `\\label{${jishoResult.query}}`,
      kanjiMeaning: meaning ? `\\kanjiMeaning{${meaning}}` : '',
      kunyomi: kunyomi ? `\\kunyomi{${kunyomi}}` : '',
      onyomi: onyomi ? `\\onyomi{${onyomi}}` : '',
      kanjiRow: `\\kanjiRow{${jishoResult.query}}`
    }
  });
}

exports.getKanjiTexData = getKanjiTexData;
