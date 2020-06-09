const textFiltration = require('./textFiltration.js')

const makeFirstLetterUppercase = (string) => string.charAt(0).toUpperCase() + string.slice(1);

/**
 * Generate TeX strings from Jisho data
 * @param {object[]} jishoResults Array of results fetched from Jisho
 * @returns {object} An object containg TeX strings
 */
function getKanjiTexData(jishoResults) {
  return jishoResults.map(jishoResult => {

    const meaning = textFiltration.convertMeaning(jishoResult);
    const kunyomi = textFiltration.convertKunyomi(jishoResult);
    const onyomi = textFiltration.convertOnyomi(jishoResult);

    jishoResult.taughtIn = jishoResult.taughtIn ? makeFirstLetterUppercase(jishoResult.taughtIn) : '';

    return {
      kanjiPageHeader: `\\kanjiPageHeader{${jishoResult.query}}{${jishoResult.taughtIn}}{${jishoResult.jlptLevel}}{${jishoResult.strokeCount}}{${jishoResult.radical.symbol}}`,
      kanjiMeaning: meaning ? `\\kanjiMeaning{${meaning}}` : '',
      kunyomi: kunyomi ? `\\kunyomi{${kunyomi}}` : '',
      onyomi: onyomi ? `\\onyomi{${onyomi}}` : '',
      kanjiRow: `\\kanjiRow{${jishoResult.query}}`
    }

  });
}

exports.getKanjiTexData = getKanjiTexData;