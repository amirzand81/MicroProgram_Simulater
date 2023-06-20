let bool = false;
let addrss_symble_table = new Array();

let F1_instructoin = [
  'ADD',
  'CLRAC',
  'INCAC',
  'DRTAC',
  'DRTAR',
  'PCTAR',
  'WRITE',
];
let F2_instructoin = ['SUB', 'OR', 'AND', 'READ', 'ACTDR', 'INCDR', 'PCTDR'];
let F3_instructoin = ['XOR', 'COM', 'SHL', 'SHR', 'INCPC', 'ARTPC'];

let conflict1 = [
  'ADD',
  'CLRAC',
  'INCAC',
  'SUB',
  'OR',
  'AND',
  'XOR',
  'COM',
  'SHL',
  'SHR',
];
let conflict2 = ['READ', 'WRITE'];

let micropro = document.getElementById('micropro');
micropro.onclick = function () {
  for (let index = 0; index < 128; index++) {
    update_microprogram_table(index, '', '', '');
  }

  bool = true;
  let pointer;
  let micropro_code = document
    .getElementsByTagName('textarea')[0]
    .value.split('\n')
    .filter(str => str.trim() !== '');

  // check microprogram code be not empty
  if (micropro_code.length == 0) {
    alert('Microprogramming code is empty.');
    return;
  }

  // check microprogram code finished with END
  if (micropro_code[micropro_code.length - 1].trim() !== 'END') {
    alert('Microprogramming code must end with END.');
    return;
  }

  micropro_code.pop();
  let len = micropro_code.length;
  addrss_symble_table = [];

  for (let i = 0; i < len; i++) {
    let lineNumber;
    let label = '';

    let line = micropro_code[i].split(' ').filter(str => str.trim() !== '');

    // check microprogram code started with ORG
    if (i == 0 && line[0] != 'ORG') {
      alert('Microprogramming code must start with ORG.');
      return;
    }

    if (line[0] === 'ORG') {
      if (line.length == 2) {
        pointer = parseInt(line[1]);
        continue;
      } else {
        alert('ORG must have a parameter');
        return;
      }
    } else {
      if (line[1].includes(':')) {
        if (line[1] === ':') line.splice(1, 1);

        label = line[0];
        line.shift();
        lineNumber = pointer + i;
      }

      if (line[0].includes(':')) {
        label = line[0].slice(0, -1);
        line.shift();
        lineNumber = pointer + i;
      }

      if (label !== '') {
        addrss_symble_table.push([label, lineNumber - 1]);
      }
    }
  }

  for (let i = 0; i < len; i++) {
    let f1 = '000';
    let f2 = '000';
    let f3 = '000';
    let address = '0000000';
    let cd;
    let br;

    let label = '';
    let line = micropro_code
      .shift()
      .split(' ')
      .filter(str => str.trim() !== '');

    if (line[0] === 'ORG') {
      if (line.length == 2) {
        pointer = parseInt(line[1]);
        continue;
      }
    } else {
      if (line[1].includes(':')) {
        if (line[1] === ':') line.splice(1, 1);
        label = line[0];
        line.shift();
      }

      if (line[0].includes(':')) {
        label = line[0].slice(0, -1);
        line.shift();
      }

      let instruction_string = line.join(' ');

      if (line[line.length - 1] == 'RET') {
        br = '10';
        line.pop();
      }
      if (line[line.length - 1] == 'MAP') {
        br = '11';
        line.pop();
      }

      if (line[line.length - 2] == 'CALL' || line[line.length - 2] == 'JMP') {
        if (line[line.length - 2] == 'CALL') br = '01';
        if (line[line.length - 2] == 'JMP') br = '00';

        if (line[line.length - 1] == 'NEXT') {
          address = (pointer + 1).toString(2).padStart(7, '0');
        } else {
          let flag = true;
          for (let i = 0; i < addrss_symble_table.length; i++) {
            if (addrss_symble_table[i][0] == line[line.length - 1]) {
              flag = false;
              address = addrss_symble_table[i][1].toString(2).padStart(7, '0');
            }
          }

          if (flag) {
            alert(`${line[line.length - 1]} is not decleared`);
            for (let index = 0; index < 128; index++) {
              update_microprogram_table(index, '', '', '');
            }
            return;
          }
        }

        line.pop();
        line.pop();
      }

      let lastItem = line.pop();

      switch (lastItem) {
        case 'U':
          cd = '00';
          break;
        case 'I':
          cd = '01';
          break;
        case 'S':
          cd = '10';
          break;
        case 'Z':
          cd = '11';
          break;
      }

      if (line.length == 0 || cd == undefined || br == undefined) {
        alert(`Error in line ${pointer}`);
        for (let index = 0; index < 128; index++) {
          update_microprogram_table(index, '', '', '');
        }
        return;
      }

      line = line
        .filter(str => str.trim() !== '')
        .join('')
        .split(',');

      let first;
      let second;
      let third;
      let counter = 0;
      let conflict = [];

      for (let i = 0; i < line.length; i++) {
        if (line[i] == 'NOP') break;
        if (
          !F1_instructoin.includes(line[i]) &&
          !F2_instructoin.includes(line[i]) &&
          !F3_instructoin.includes(line[i])
        ) {
          alert(`"${line[i]}" is not a instruction.\nError in line ${pointer}`);
          for (let index = 0; index < 128; index++) {
            update_microprogram_table(index, '', '', '');
          }
          return;
        }

        if (i == 0) {
          if (F1_instructoin.includes(line[i])) first = 1;
          if (F2_instructoin.includes(line[i])) first = 2;
          if (F3_instructoin.includes(line[i])) first = 3;
        }

        if (i == 1) {
          if (F1_instructoin.includes(line[i])) second = 1;
          if (F2_instructoin.includes(line[i])) second = 2;
          if (F3_instructoin.includes(line[i])) second = 3;

          if (second == first) {
            alert(
              `"${line[0]}" and "${line[1]}" are in F${first} set.\nError in line ${pointer}`
            );
            for (let index = 0; index < 128; index++) {
              update_microprogram_table(index, '', '', '');
            }
            return;
          }
        }

        if (i == 2) {
          if (F1_instructoin.includes(line[i])) third = 1;
          if (F2_instructoin.includes(line[i])) third = 2;
          if (F3_instructoin.includes(line[i])) third = 3;

          if (third == first) {
            alert(
              `"${line[0]}" and "${line[2]}" are in F${first} set.\nError in line ${pointer}`
            );
            for (let index = 0; index < 128; index++) {
              update_microprogram_table(index, '', '', '');
            }
            return;
          }
          if (third == second) {
            alert(
              `"${line[1]}" and "${line[2]}" are in F${second} set.\nError in line ${pointer}`
            );
            for (let index = 0; index < 128; index++) {
              update_microprogram_table(index, '', '', '');
            }
            return;
          }
        }
      }

      for (let i = 0; i < line.length; i++) {
        if (conflict1.includes(line[i])) {
          counter++;
          conflict.push(line[i]);
        }
      }

      if (conflict.length > 1) {
        alert(
          `${conflict.join(
            ' and '
          )} can not use simulately.\nError in line ${pointer}`
        );
        for (let index = 0; index < 128; index++) {
          update_microprogram_table(index, '', '', '');
        }
        return;
      }

      for (let i = 0; i < line.length; i++) {
        if (conflict2.includes(line[i])) {
          counter++;
          conflict.push(line[i]);
        }
      }

      if (conflict.length > 1) {
        alert(
          `${conflict.join(
            ' and '
          )} can not use simulately.\nError in line ${pointer}`
        );
        for (let index = 0; index < 128; index++) {
          update_microprogram_table(index, '', '', '');
        }
        return;
      }

      for (let i = 0; i < line.length; i++) {
        if (F1_instructoin.indexOf(line[i]) >= 0)
          f1 = (F1_instructoin.indexOf(line[i]) + 1)
            .toString(2)
            .padStart(3, '0');
        if (F2_instructoin.indexOf(line[i]) >= 0)
          f2 = (F2_instructoin.indexOf(line[i]) + 1)
            .toString(2)
            .padStart(3, '0');
        if (F3_instructoin.indexOf(line[i]) >= 0)
          f3 = (F3_instructoin.indexOf(line[i]) + 1)
            .toString(2)
            .padStart(3, '0');
      }

      let instruction_code = f1 + f2 + f3 + cd + br + address;
      instruction_code =
        '0x' + parseInt(instruction_code, 2).toString(16).toUpperCase();

      update_microprogram_table(
        pointer++,
        label,
        instruction_string,
        instruction_code
      );
    }
  }
};

let assembler = document.getElementById('assembler');
assembler.onclick = function () {
  console.log(bool);
};
