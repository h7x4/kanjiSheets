function kanjiTable(kanjiArray) {
  const xLength = 15;
  const yLength = Math.ceil(kanjiArray.length/xLength);
  const sideLength = Math.ceil(Math.sqrt(kanjiArray.length));

  let tableString = '';
  for (let y_index = 0; y_index < yLength; y_index++) {

    const lineArray = new Array;

    for (let x_index = 0; x_index < xLength; x_index++) {
      const indexNumber = y_index * xLength + x_index;
      lineArray.push(kanjiArray[indexNumber] ? kanjiArray[indexNumber] : '');
    }

    tableString += `${lineArray.join(' & ')} \\\\\n`
  }

  return `\\begin{tabular}{ ${'c '.repeat(xLength)}}
${tableString}\\end{tabular}`
}

exports.kanjiTable = kanjiTable;