const yomiBrackets = ['\\textbf{\\textcolor{kanjiColor!80!black}{', '}}'];
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
      //TODO: Apply combinated logic here
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

exports.convertKunyomi = convertKunyomi;
exports.convertOnyomi = convertOnyomi;
exports.convertMeaning = convertMeaning;