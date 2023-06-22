let isMicroprogramm = false;
let isProgram = false;

let ACTag = document.getElementsByClassName('AC')[0];
let DRTag = document.getElementsByClassName('DR')[0];
let ARTag = document.getElementsByClassName('AR')[0];
let PCTag = document.getElementsByClassName('PC')[0];
let ETag = document.getElementsByClassName('E')[0];
let SBRTag = document.getElementsByClassName('SBR')[0];
let CARTag = document.getElementsByClassName('CAR')[0];
let ITag = document.getElementsByClassName('I')[0];
let OPCODETag = document.getElementsByClassName('OPCODE')[0];
let ADDRTag = document.getElementsByClassName('ADDR')[0];
let F1Tag = document.getElementsByClassName('F1')[0];
let F2Tag = document.getElementsByClassName('F2')[0];
let F3Tag = document.getElementsByClassName('F3')[0];
let CDTag = document.getElementsByClassName('CD')[0];
let BRTag = document.getElementsByClassName('BR')[0];
let ADTag = document.getElementsByClassName('AD')[0];

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

let micro_label = document.getElementsByClassName('micro_label')[0];
let program_label = document.getElementsByClassName('program_label')[0];

let start = document.getElementById('start');
start.onclick = function () {
  if (!isProgram) {
    alert('First, you should assemble your program code');
    return;
  }
};

let stepby = document.getElementById('stepby');
stepby.onclick = function () {
  if (!isProgram) {
    alert('First, you should assemble your program code');
    return;
  }

  let line = 2;

  while (true) {
    let AC = ACTag.textContent;
    let DR = DRTag.textContent;
    let AR = ARTag.textContent;
    let PC = PCTag.textContent;
    let E = ETag.textContent;
    let SBR = SBRTag.textContent;
    let CAR = CARTag.textContent;

    let instrcution = parseInt(getMicroprogramLine(line), 16)
      .toString(2)
      .padStart(20, '0');
    F1Tag.innerHTML = instrcution.slice(0, 3).padStart(3, '0');
    F2Tag.innerHTML = instrcution.slice(3, 6).padStart(3, '0');
    F3Tag.innerHTML = instrcution.slice(6, 9).padStart(3, '0');
    CDTag.innerHTML = instrcution.slice(9, 10).padStart(2, '0');
    BRTag.innerHTML = instrcution.slice(10, 12).padStart(2, '0');
    ADTag.innerHTML = instrcution.slice(12, 20).padStart(7, '0');

    // here stop for debuging

    switch (F1Tag.textContent) {
      // F1 -> ADD
      case '001':
        ADD(AC, DR);
        break;

      // F1 -> CLRAC
      case '010':
        ACTag.innerHTML = '0x0000';
        break;

      // F1 -> INCAC
      case '011':
        INCAC(AC);
        break;

      // F1 -> DRTAC
      case '100':
        ACTag.innerHTML = DR;
        break;

      // F1 -> DRTAR
      case '101':
        ARTag.innerHTML = parseInt(DR, 16)
          .toString(2)
          .padStart(16, '0')
          .slice(5);
        break;

      // F1 -> PCTAR
      case '110':
        ARTag.innerHTML = PC;
        break;

      // F1 -> WRITE
      case '111':
        WRITE(DR, AR);
        break;
    }

    break;
  }
};

document.getElementsByTagName('textarea')[1].onchange = function () {
  isProgram = false;
  program_label.innerHTML = 'Program(*)';
};

let assembler = document.getElementById('assembler');
assembler.onclick = function () {
  if (!isMicroprogramm) {
    alert('First, you should add microprogram code');
    return;
  }

  if (isProgram) {
    alert('without change');
    return;
  }

  clear_memory_table();
  let pointer;
  let program_code = document
    .getElementsByTagName('textarea')[1]
    .value.split('\n')
    .map(item => item.trim())
    .filter(Boolean);

  // check microprogram code be not empty
  if (program_code.length == 0) {
    return;
  }

  let len = program_code.length;
  let addrss_symble_table = new Array();
  // first level of translation (complete symble table addresses)
  for (let i = 0; i < len; i++) {
    let label = '';
    let line = program_code[i].split(' ').filter(str => str.trim() !== '');

    // check microprogram code started with ORG
    if (i == 0 && line[0] != 'ORG') {
      alert('Program code must start with ORG.');
      return;
    }

    // check microprogram code finished with END
    if (i == len - 1) {
      if (line[0] !== 'END' || line.length > 1) {
        alert('Program code must end with END.');
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
      if (line.join(' ').includes(',')) {
        let temp = line
          .join(' ')
          .split(',')
          .filter(str => str.trim() !== '');

        label = temp[0].trim();
        line = temp[1].split(' ');

        if (line[0] == '') line.shift();
      }
      for (let i = 0; i < addrss_symble_table.length; i++) {
        if (addrss_symble_table[i][0] === label) {
          clear_memory_table();
          alert(`${label} is previuosly defined.`);
          return;
        }
      }

      program_code[i] = label + ', ' + line.join(' ');
      if (label !== '') addrss_symble_table.push([label, pointer++]);
    }
  }

  // second level of translation (translation instructions)
  for (let i = 0; i < len - 1; i++) {
    let I = '0';
    let address = '00000000000';
    let opcode;

    let label = '';

    let line = program_code
      .shift()
      .split(' ')
      .filter(str => str.trim() !== '');

    if (line[0] === 'ORG') {
      pointer = parseInt(line[1]);
      continue;
    }

    // translation of each instruction
    else {
      if (line[0].includes(',')) {
        label = line[0].slice(0, -1);
        line.shift();
      }

      let instruction_string = line.join(' ');

      if (line[0] == 'HEX') {
        let instruction_code = '0x' + line[1].padStart(4, '0');

        update_memory_table(
          pointer++,
          label,
          instruction_string,
          instruction_code
        );
        continue;
      }

      if (line[0] == 'DEC') {
        let instruction_code =
          '0x' + parseInt(line[1]).toString(16).toUpperCase().padStart(4, '0');

        update_memory_table(
          pointer++,
          label,
          instruction_string,
          instruction_code
        );
        continue;
      }

      if (lookup(line[0]) === -1) {
        clear_memory_table();
        alert(line[0] + ' is not a instruction');
        return;
      }

      opcode = (lookup(line[0]) / 4).toString(2).padStart(4, '0');

      if (line.length == 3) {
        if (line[2] == 'I') I = '1';
        else {
          clear_memory_table();
          alert('Error in line ' + pointer);
          return;
        }
        line.pop();
      }

      if (line.length == 2) {
        let flag = true;
        for (let i = 0; i < addrss_symble_table.length; i++) {
          if (addrss_symble_table[i][0] == line[1]) {
            flag = false;
            address = addrss_symble_table[i][1].toString(2).padStart(11, '0');
          }
        }

        if (flag) {
          clear_memory_table();
          alert(`${line[1]} is not decleared`);
          return;
        }
      }

      let instruction_code =
        '0x' +
        parseInt(I + opcode + address, 2)
          .toString(16)
          .toUpperCase()
          .padStart(4, '0');

      update_memory_table(
        pointer++,
        label,
        instruction_string,
        instruction_code
      );
    }
  }
  isProgram = true;
  program_label.innerHTML = 'Program';
  alert('Program assembled succesfully.');
};

document.getElementsByTagName('textarea')[0].onchange = function () {
  isMicroprogramm = false;
  micro_label.innerHTML = 'MicroProgram(*)';
};

let micropro = document.getElementById('micropro');
micropro.onclick = function () {
  if (isMicroprogramm) {
    alert('without change');
    return;
  }
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
    if (i == 0 && line[0] != 'ORG') {
      alert('Microprogram must start with ORG');
      return;
    }

    // check microprogram code finished with END
    if (i == len - 1) {
      if (line[0] !== 'END' || line.length > 1) {
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
      if (line.length == 1) {
        clear_microprogram_table();
        alert(`Syntax error in line ${pointer}`);
        return;
      }

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

      for (let i = 0; i < addrss_symble_table.length; i++) {
        if (addrss_symble_table[i][0] === label) {
          clear_microprogram_table();
          alert(`${label} is previuosly defined.`);
          return;
        }
      }

      micropro_code[i] = label + ': ' + line.join(' ');
      if (label !== '') addrss_symble_table.push([label, pointer++]);
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

      // determine type of branch and address of branching
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

      // determine condition
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

      // check syntax error
      if (line.length == 0 || cd == undefined || br == undefined) {
        clear_microprogram_table();
        alert(`Syntax error in line ${pointer}`);
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

        // check that all instrcutino are from different set (F1, F2, F3)
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

      // check all instructoin are compatible
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

      // determine instruction code
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
          .toUpperCase()
          .padStart(5, '0');

      update_microprogram_table(
        pointer++,
        label,
        instruction_string,
        instruction_code
      );
    }
  }
  isMicroprogramm = true;
  micro_label.innerHTML = 'MicroProgram';
  alert('Microprogram added succesfully.');
};

function twosComplementToDecimal(binary) {
  // Check if the input is a valid binary string
  if (!/^[01]+$/.test(binary)) {
    return null;
  }

  // Check if the binary string represents a negative number
  const isNegative = binary.charAt(0) === '1';

  // Calculate the magnitude of the number by taking the one's complement and adding 1
  const magnitude = isNegative
    ? parseInt(twosComplementOnes(binary), 2) + 1
    : parseInt(binary, 2);

  // Return the positive or negative value based on the leftmost bit
  return isNegative ? -magnitude : magnitude;
}

function twosComplementOnes(binary) {
  return binary
    .split('')
    .map(bit => (bit === '0' ? '1' : '0'))
    .join('');
}

function DecimaltotwosComplement(num) {
  let isNeg = num < 0;
  let bin;

  if (isNeg) {
    bin = (num * -1).toString(2).padStart(16, '0');
    let flag = true;

    for (let i = 15; i >= 0; i--) {
      if (flag) {
        if (bin[i] == '1') {
          flag = false;
        }
        continue;
      }

      let newChar = bin[i] == '0' ? '1' : '0';
      let arr = bin.split('');
      arr[i] = newChar;
      bin = arr.join('');
    }
  } else {
    bin = num.toString(2).padStart(16, '0');
  }

  return bin;
}

function INCAC(str) {
  let base2 = parseInt(str, 16).toString(2).padStart(16, '0');
  let decimal = twosComplementToDecimal(base2);
  ACTag.innerHTML =
    '0x' +
    parseInt(DecimaltotwosComplement(decimal + 1), 2)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
}

const ADD = (str1, str2) => {
  str1 = parseInt(str1, 16).toString(2);
  str2 = parseInt(str2, 16).toString(2);

  let carry = 0;
  const res = [];
  let l1 = str1.length;
  let l2 = str2.length;
  for (let i = l1 - 1, j = l2 - 1; 0 <= i || 0 <= j; --i, --j) {
    let a = 0 <= i ? Number(str1[i]) : 0,
      b = 0 <= j ? Number(str2[j]) : 0;
    res.push((a + b + carry) % 2);
    carry = 1 < a + b + carry;
  }

  ETag.innerHTML = (+carry).toString();
  ACTag.innerHTML =
    '0x' + parseInt(res.reverse().join(''), 2).toString(16).padStart(4, '0');
};

function WRITE(str, ad) {
  const table = document.querySelector('.memory-table table');
  const columns = table.getElementsByTagName('td');

  let label = columns[(parseInt(ad, 2) + 1) * 5 + 2].textContent;
  let instrcution = columns[(parseInt(ad, 2) + 1) * 5 + 3].textContent;
  update_memory_table(parseInt(ad, 2), label, instrcution, str);
}
