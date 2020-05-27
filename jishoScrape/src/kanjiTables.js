/**
 * Turns an array of kanji into a tabular for a chapter overview
 * @param {string[]} kanjiArray A list of kanji to put into the table
 * @returns {string} A tex tabular. 
 */
function kanjiTable(kanjiArray) {
  const xLength = 16;
  const yLength = Math.ceil(kanjiArray.length/xLength);
  const sideLength = Math.ceil(Math.sqrt(kanjiArray.length));

  let tableString = '';
  for (let y_index = 0; y_index < yLength; y_index++) {

    const lineArray = new Array;

    lineArray.push(`{\\large ${y_index*16}}`);

    for (let x_index = 0; x_index < xLength; x_index++) {
      const indexNumber = y_index * xLength + x_index;
      lineArray.push(kanjiArray[indexNumber] ? kanjiArray[indexNumber] : '');
    }

    tableString += `${lineArray.join(' & ')} \\\\\n`
  }

  return `\\begin{longtable}{ ${'c '.repeat(xLength+1)}}
${tableString}\\end{longtable}`
}

exports.kanjiTable = kanjiTable;