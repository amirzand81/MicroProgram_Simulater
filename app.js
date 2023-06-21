let bool = false;

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
  clear_microprogram_table();
  let pointer;
  let micropro_code = document
    .getElementsByTagName('textarea')[0]
    .value.split('\n')
    .map(item => item.trim())
    .filter(Boolean);

  // check microprogram code be not empty
  if (micropro_code.length == 0) {
    return;
  }

  let len = micropro_code.length;
  let addrss_symble_table = new Array();

  // first level of translation (complete symble table addresses)
  for (let i = 0; i < len; i++) {
    let label = '';
    let line = micropro_code[i].split(' ').filter(str => str.trim() !== '');

    // check microprogram code started with ORG
    if (i == 0 && line[0] != 'ORG') return;

    // check microprogram code finished with END
    if (i == len - 1) {
      if (line[0] !== 'END') {
        alert('Microprogramming code must end with END.');
        return;
      }
    }

    // ORG (set pointer)
    else if (line[0] === 'ORG') {
      if (line.length == 2) {
        pointer = parseInt(line[1]);
        continue;
      } else {
        alert('ORG must have a parameter');
        return;
      }
    }

    // check if instrcution has label, extract it
    else {
      if (line[0].includes(':')) {
        let temp = line[0].split(':');
        label = temp[0];
        if (temp[1] != '') line[1] = temp[1] + ' ' + line[1];
        line.shift();
      } else if (line[1].includes(':')) {
        if (line[1] === ':') line.splice(1, 1);
        if (line[1][0] === ':') line[1] = line[1].substring(1);
        label = line[0];
        line.shift();
      }
      micropro_code[i] = label + ': ' + line.join(' ');
      addrss_symble_table.push([label, pointer++]);
    }
  }

  // second level of translation (translation instructions)
  for (let i = 0; i < len - 1; i++) {
    let f1 = (f2 = f3 = '000');
    let address = '0000000';
    let cd, br;

    let label = '';
    let line = micropro_code
      .shift()
      .split(' ')
      .filter(str => str.trim() !== '');

    if (line[0] === 'ORG') {
      pointer = parseInt(line[1]);
      continue;
    }

    // translation of each instruction
    else {
      if (line[0].includes(':')) {
        label = line[0].slice(0, -1);
        line.shift();
      }

      let instruction_string = line.join(' ');

      switch (line[line.length - 1]) {
        case 'RET':
          br = '10';
        case 'MAP':
          br = '11';

          line.pop();
          break;

        default:
          let addr = line.pop();
          let branch = line.pop();

          br = branch == 'CALL' ? '01' : branch == 'JMP' ? '00' : undefined;

          if (addr == 'NEXT') {
            address = (pointer + 1).toString(2).padStart(7, '0');
          } else {
            let flag = true;
            for (let i = 0; i < addrss_symble_table.length; i++) {
              if (addrss_symble_table[i][0] == addr) {
                flag = false;
                address = addrss_symble_table[i][1]
                  .toString(2)
                  .padStart(7, '0');
              }
            }

            if (flag) {
              clear_microprogram_table();
              alert(`${addr} is not decleared`);
              return;
            }
          }
      }

      switch (line.pop()) {
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
        clear_microprogram_table();
        alert(`Error in line ${pointer}`);
        return;
      }

      line = line
        .filter(str => str.trim() !== '')
        .join('')
        .split(',');

      let first;
      let second;
      let third;

      for (let i = 0; i < line.length; i++) {
        if (line[i] == 'NOP') break;

        // check that all instrcutino are validate
        if (
          !F1_instructoin.includes(line[i]) &&
          !F2_instructoin.includes(line[i]) &&
          !F3_instructoin.includes(line[i])
        ) {
          alert(`"${line[i]}" is not a instruction.\nError in line ${pointer}`);
          clear_microprogram_table();
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
            clear_microprogram_table();
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
            clear_microprogram_table();

            return;
          }
          if (third == second) {
            alert(
              `"${line[1]}" and "${line[2]}" are in F${second} set.\nError in line ${pointer}`
            );
            clear_microprogram_table();

            return;
          }
        }
      }

      let counter = 0;
      let conflict = [];

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
        clear_microprogram_table();
        return;
      }

      counter = 0;
      conflict = [];

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
        clear_microprogram_table();
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

      let instruction_code =
        '0x' +
        parseInt(f1 + f2 + f3 + cd + br + address, 2)
          .toString(16)
          .toUpperCase();

      update_microprogram_table(
        pointer++,
        label,
        instruction_string,
        instruction_code
      );
    }
  }
  bool = true;
};

function clear_microprogram_table() {
  for (let index = 0; index < 128; index++) {
    update_microprogram_table(index, '', '', '');
  }
}
