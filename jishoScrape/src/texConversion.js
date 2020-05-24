const textFiltration = require('./textFiltration.js')

/* Process result array into object with LaTeX strings */
function getKanjiTexData(kanjiArray) {
  return kanjiArray.map(kanji => {

    const meaning = textFiltration.convertMeaning(kanji);
    const kunyomi = textFiltration.convertKunyomi(kanji);
    const onyomi = textFiltration.convertOnyomi(kanji);

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

exports.getKanjiTexData = getKanjiTexData;