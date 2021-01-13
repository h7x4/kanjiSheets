
const makeNumberRow = (length) => {
	const numberRow = [ ' ',
										  ...[...Array(length).keys()]
										    .map(num => `{\\large ${num+1}}`),
  									  ' ' ].join(' & ');
  return `
  ${numberRow} \\\\
  \\hline
  \\endhead\n`;
}

const lastNonEmptyChar = (chars) => {
	let index = chars.length - 1;
	while (chars[index] == '') index--;
	return chars[index]
}

const makeKanjiRow = (index, chars) => 
			[ `{\\large ${index}}`,
				...chars.map(chara => `\\hyperref[${chara}]{${chara}}`),
				`p.\\pageref{${lastNonEmptyChar(chars)}}` ].join(' & ');

const splitBy = (array, num) => {
	let results = [];
  while (array.length) {
  	results.push(array.splice(0, num));
  }
	results[results.length-1].length = num;
	results[results.length-1] = Array.from(results[results.length-1], chara => chara || '');
	return results;
}

const makeRows = (length, kanjiArray) =>
	[ ...splitBy(kanjiArray, length)
		  .map((row, i) => makeKanjiRow(i*length,row)),
		'' ].join(' \\\\\n');

/**
 * Turns an array of kanji into a tabular for a chapter overview
 * @param {string[]} kanjiArray An array of kanji characters to put into the tabular
 * @param {number} rowLength The length of each row
 * @returns {string} A tex tabular
 */
function chapterTabular(kanjiArray, length) {
  // const height = Math.ceil(kanjiArray.length/length);

  let tabularString = '';
  
  tabularString += makeNumberRow(length);
  tabularString += makeRows(length, kanjiArray);

  return `\\begin{chapterTabular}{ ${' l | ' + 'l '.repeat(length + 1)}}
${tabularString}\\end{chapterTabular}`
}

exports.chapterTabular = chapterTabular;
