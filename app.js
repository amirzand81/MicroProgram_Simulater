let bool = false;

let micropro = document.getElementById('micropro');
micropro.onclick = function () {
  bool = true;
  let startPointer;
  let micropro_code = document
    .getElementsByTagName('textarea')[0]
    .value.split('\n')
    .filter(str => str.trim() !== '');

  // check microprogram code be not empty
  if (micropro_code.length == 0) {
    alert('Microprogramming code is empty.');
    return;
  }

  let firstLine = micropro_code[0].split(' ').filter(str => str.trim());

  // check microprogram code started with ORG
  if (firstLine[0] != 'ORG') {
    alert('Microprogramming code must start with ORG.');
    return;
  }

  // check microprogram code finished with END
  if (micropro_code[micropro_code.length - 1].trim() !== 'END') {
    alert('Microprogramming code must end with END.');
    return;
  }

  micropro_code.pop();
  startPointer = parseInt(firstLine[1]);
  micropro_code.shift();
  let len = micropro_code.length;

  for (let i = 0; i < len; i++) {
    let line = micropro_code
      .shift()
      .split(' ')
      .filter(str => str.trim() !== '');

    if (line.length == 2 && line[0] === 'ORG') {
      startPointer = parseInt(line[1]);
      continue;
    } else {
      // here write code of translation of instructions
    }

    update_memory_table(startPointer++, line[0], line[1], line[2]);
  }
};

let assembler = document.getElementById('assembler');
assembler.onclick = function () {
  console.log(bool);
};
