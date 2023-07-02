let isMicroprogramm = false;
let isProgram = false;
let firstClickStep = true;

let stopBtn = document.getElementById('stop');
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
start.onclick = async function () {
  if (!isMicroprogramm) {
    alert('First, you should translation your Microprogram code');
    return;
  }

  if (!isProgram) {
    alert('First, you should assemble your program code');
    return;
  }

  reset();
  assembling();
  firstClickStep = false;

  while (ARTag.textContent != '11111111111' && !firstClickStep) {
    doMicroprogamLine(false);
    await sleep(200);
  }
};

let aboutme = document.getElementById('aboutme');
aboutme.onclick = function () {
  alert('This project is created by Amirhossein Zendevani:)');
};

stopBtn.onclick = function () {
  for (let i = 0; i < 128; i++) {
    changeColor(i, 'white');
  }

  for (let i = 0; i < 2048; i++) {
    changeColorMemory(i, 'white');
  }

  stopBtn.hidden = true;
  firstClickStep = true;
};

let stepby = document.getElementById('stepby');
stepby.onclick = function () {
  if (!isMicroprogramm) {
    alert('First, you should translation your Microprogram code');
    return;
  }

  if (!isProgram) {
    alert('First, you should assemble your program code');
    return;
  }

  stopBtn.hidden = false;

  if (firstClickStep) {
    reset();
    assembling();
    changeColorMemory(0, 'yellow');
    scrollToRow(0);
    changeColor(64, 'yellow');
    scrollToRowMicroprogram(64);
    firstClickStep = false;
    return;
  }

  doMicroprogamLine(true);
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

  let temp = assembling();

  if (temp != false) {
    isProgram = true;
    program_label.innerHTML = 'Program';
    alert('Program assembled succesfully.');
  }
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
    pointer++;
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

      if (label !== '') {
        addrss_symble_table.push([label, pointer - 1]);
        micropro_code[i] = label + ': ' + line.join(' ');
      } else micropro_code[i] = line.join(' ');
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
          line.pop();
          break;

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

function INC(str) {
  let base2 = parseInt(str, 16).toString(2).padStart(16, '0');
  let decimal = twosComplementToDecimal(base2);

  return (
    '0x' +
    parseInt(DecimaltotwosComplement(decimal + 1), 2)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0')
  );
}

const ADD = (str1, str2) => {
  str1 = parseInt(str1, 16).toString(2);
  str2 = parseInt(str2, 16).toString(2);

  let answer = addition(str1, str2);

  ETag.innerHTML = answer[0];
  ACTag.innerHTML = answer[1];
};

function WRITE(str, ad) {
  const table = document.querySelector('.memory-table table');
  const columns = table.getElementsByTagName('td');

  let label = columns[(parseInt(ad, 2) + 1) * 5 + 2].textContent;
  let instrcution = columns[(parseInt(ad, 2) + 1) * 5 + 3].textContent;
  update_memory_table(parseInt(ad, 2), label, instrcution, str);
}

function addition(str1, str2) {
  str1 = str1.padStart(16, '0');
  str2 = str2.padStart(16, '0');

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
  let result =
    '0x' +
    parseInt(res.reverse().join(''), 2)
      .toString(16)
      .padStart(4, '0')
      .toUpperCase();
  return [(+carry).toString(), result];
}

function SUB(str1, str2) {
  str1 = parseInt(str1, 16).toString(2).padStart(16, '0');
  str2 = parseInt(str2, 16).toString(2).padStart(16, '0');
  str2 = COM(str2);

  str2 = parseInt(addition(str2, '0000000000000001')[1], 16)
    .toString(2)
    .padStart(16, '0');

  let answer = addition(str1, str2);
  ETag.innerHTML = answer[0];
  ACTag.innerHTML = answer[1].toUpperCase();
}

function COM(binaryString) {
  let result = '';

  for (let i = 0; i < binaryString.length; i++) {
    result += binaryString[i] === '0' ? '1' : '0';
  }

  return result;
}

function OR(str1, str2) {
  // Convert binary strings to numbers using parseInt with base 2
  const num1 = parseInt(str1, 16);
  const num2 = parseInt(str2, 16);

  // Use the | operator to perform bitwise OR on the numbers
  const result = num1 | num2;

  // Convert result back to binary string using toString with base 2
  const binaryResult =
    '0x' + result.toString(16).padStart(4, '0').toUpperCase();
  ACTag.innerHTML = binaryResult;
}

function AND(str1, str2) {
  const num1 = parseInt(str1, 16);
  const num2 = parseInt(str2, 16);

  const result = num1 & num2;

  const binaryResult =
    '0x' + result.toString(16).padStart(4, '0').toUpperCase();
  ACTag.innerHTML = binaryResult;
}

function READ(ad) {
  const table = document.querySelector('.memory-table table');
  const columns = table.getElementsByTagName('td');

  DRTag.innerHTML = columns[(parseInt(ad, 2) + 1) * 5 + 4].textContent;
}

function PCTDR(str1, str2) {
  let DR_binary = parseInt(str2, 16).toString(2).padStart(16, '0');
  DRTag.innerHTML =
    '0x' +
    parseInt(DR_binary.slice(0, 5) + str1, 2)
      .toString(16)
      .padStart(4, '0')
      .toUpperCase();
}

function XOR(a, b) {
  a = parseInt(a, 16).toString(2).padStart(16, '0');
  b = parseInt(b, 16).toString(2).padStart(16, '0');

  let result = '';
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      result += '0';
    } else {
      result += '1';
    }
  }

  const binaryResult =
    '0x' + parseInt(result, 2).toString(16).padStart(4, '0').toUpperCase();
  ACTag.innerHTML = binaryResult;
}

function INCPC(PC) {
  let value = parseInt(PC, 2);
  value++;

  value = value.toString(2);

  if (value.length > 11) PCTag.innerHTML = '00000000000';
  else PCTag.innerHTML = value.padStart(11, '0');
}

function SHR(binaryString, carry) {
  binaryNumber = parseInt(binaryString, 16);

  if (binaryNumber % 2 == 1) ETag.innerHTML = '1';
  else ETag.innerHTML = '0';

  binaryNumber >>= 1;

  if (carry === '1') {
    binaryNumber += 32768;
  }

  ACTag.innerHTML =
    '0x' + binaryNumber.toString(16).padStart(4, '0').toUpperCase();
}

function SHL(binaryString, carry) {
  let bin = parseInt(binaryString, 16).toString(2).padStart(16, '0');

  ETag.innerHTML = bin[0];

  let shifted = '';
  for (let i = 0; i < 16; i++) {
    if (i === 15) {
      if (carry == '1') shifted += '1';
      else shifted += '0';
    } else {
      shifted += bin[i + 1];
    }
  }

  ACTag.innerHTML =
    '0x' + parseInt(shifted, 2).toString(16).padStart(4, '0').toUpperCase();
}

function doMicroprogamLine(bool) {
  let AC = ACTag.textContent;
  let DR = DRTag.textContent;
  let AR = ARTag.textContent;
  let PC = PCTag.textContent;

  if (bool) {
    changeColor(parseInt(CARTag.textContent, 2), 'white');
    scrollToRowMicroprogram(parseInt(CARTag.textContent, 2) + 1);
  }

  // run F1 operation
  switch (F1Tag.textContent) {
    // F1 -> ADD
    case '001':
      ADD(AC, DR);
      break;

    // F1 -> CLRAC
    case '010':
      ACTag.innerHTML = '0x0000';
      AC = '0x0000';
      break;

    // F1 -> INCAC
    case '011':
      ACTag.innerHTML = INC(AC);
      break;

    // F1 -> DRTAC
    case '100':
      ACTag.innerHTML = DR;
      break;

    // F1 -> DRTAR
    case '101':
      ARTag.innerHTML = parseInt(DR, 16).toString(2).padStart(16, '0').slice(5);
      if (ARTag.textContent == '11111111111') {
        stopBtn.hidden = true;
        firstClickStep = true;

        for (let i = 0; i < 2048; i++) {
          changeColorMemory(i, 'white');
        }
        return;
      }
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

  // run F2 operation
  switch (F2Tag.textContent) {
    // F2 -> SUB
    case '001':
      SUB(AC, DR);
      break;

    // F2 -> OR
    case '010':
      OR(AC, DR);
      break;

    // F2 -> AND
    case '011':
      AND(AC, DR);
      break;

    // F2 -> READ
    case '100':
      READ(AR);
      if (DRTag.textContent === '') {
        for (let i = 0; i < 128; i++) {
          changeColor(i, 'white');
        }

        for (let i = 0; i < 2048; i++) {
          changeColorMemory(i, 'white');
        }

        stopBtn.hidden = true;
        firstClickStep = true;
        alert('Error');
        return;
      }

      break;

    // F2 -> ACTDR
    case '101':
      DRTag.innerHTML = AC;
      break;

    // F2 -> INCDR
    case '110':
      DRTag.innerHTML = INC(DR);
      break;

    // F2 -> PCTDR
    case '111':
      PCTDR(PC, DR);
      break;
  }

  // run F3 operation
  switch (F3Tag.textContent) {
    // F3 -> XOR
    case '001':
      XOR(AC, DR);
      break;

    // F3 -> COM
    case '010':
      let complementone = COM(parseInt(AC, 16).toString(2).padStart(16, '0'));
      ACTag.innerHTML =
        '0x' +
        parseInt(complementone, 2).toString(16).padStart(4, '0').toUpperCase();
      break;

    // F3 -> SHL
    case '011':
      SHL(AC, E);
      break;

    // F3 -> SHR
    case '100':
      SHR(AC, E);
      break;

    // F3 -> INCPC
    case '101':
      INCPC(PC);
      break;

    // F3 -> ARTPC
    case '110':
      PCTag.innerHTML = AR;
      break;
  }

  let condition;

  // check condtion
  switch (CDTag.textContent) {
    case '00':
      condition = true;
      break;
    case '01':
      condition = ITag.textContent.trim() == '1';
      break;
    case '10':
      condition =
        parseInt(ACTag.textContent, 16).toString(2).padStart(16, '0')[0] == '1';
      break;
    case '11':
      condition = ACTag.textContent.trim() == '0x0000';
      break;
  }

  let returnAdd;

  // branching
  switch (BRTag.textContent) {
    case '00':
      if (condition) {
        returnAdd = ADTag.textContent;
        if (bool && returnAdd == '1000000') {
          for (let i = 0; i < 2048; i++) {
            changeColorMemory(i, 'white');
          }

          changeColorMemory(parseInt(PC, 2), 'yellow');
          scrollToRow(parseInt(PC, 2));
        }
      } else
        returnAdd = (parseInt(CARTag.textContent, 2) + 1)
          .toString(2)
          .padStart(7, '0');
      break;
    case '01':
      if (condition) {
        SBRTag.innerHTML = (parseInt(CARTag.textContent, 2) + 1)
          .toString(2)
          .padStart(7, '0');
        returnAdd = ADTag.textContent;
      } else {
        returnAdd = (parseInt(CARTag.textContent, 2) + 1)
          .toString(2)
          .padStart(7, '0');
      }
      break;
    case '10':
      returnAdd = SBRTag.textContent;
      break;
    case '11':
      returnAdd =
        '0' + parseInt(DR, 16).toString(2).padStart(16, '0').slice(1, 5) + '00';

      let line = parseInt(DR, 16).toString(2).padStart(16, '0');
      ITag.innerHTML = line[0];
      OPCODETag.innerHTML = line.slice(1, 5);
      ADDRTag.innerHTML = line.slice(5, 16);
      break;
  }

  if (bool) {
    changeColor(parseInt(returnAdd, 2), 'yellow');
    scrollToRowMicroprogram(parseInt(returnAdd, 2) + 1);
  }

  CARTag.innerHTML = returnAdd;

  let instrcution = parseInt(
    getMicroprogramLine(parseInt(CARTag.textContent, 2)),
    16
  )
    .toString(2)
    .padStart(20, '0');

  F1Tag.innerHTML = instrcution.slice(0, 3).padStart(3, '0');
  F2Tag.innerHTML = instrcution.slice(3, 6).padStart(3, '0');
  F3Tag.innerHTML = instrcution.slice(6, 9).padStart(3, '0');
  CDTag.innerHTML = instrcution.slice(9, 11).padStart(2, '0');
  BRTag.innerHTML = instrcution.slice(11, 13).padStart(2, '0');
  ADTag.innerHTML = instrcution.slice(13, 20).padStart(7, '0');
}

function reset() {
  ACTag.innerHTML = '0x0000';
  DRTag.innerHTML = '0x0000';
  ARTag.innerHTML = '00000000000';
  PCTag.innerHTML = '00000000000';
  ETag.innerHTML = '0';
  SBRTag.innerHTML = '0000000';
  CARTag.innerHTML = '1000000';
  ITag.innerHTML = '0';
  OPCODETag.innerHTML = '0000';
  ADDRTag.innerHTML = '00000000000';
  F1Tag.innerHTML = '110';
  F2Tag.innerHTML = '000';
  F3Tag.innerHTML = '000';
  CDTag.innerHTML = '00';
  BRTag.innerHTML = '00';
  ADTag.innerHTML = '1000001';
}

function binaryToHex(str) {
  result = '';
  while (str != '') {
    temp = str.slice(0, 4);
    str = str.substring(4);

    switch (temp) {
      case '0000':
        result += '0';
        break;

      case '0001':
        result += '1';
        break;

      case '0010':
        result += '2';
        break;

      case '0011':
        result += '3';
        break;

      case '0100':
        result += '4';
        break;

      case '0101':
        result += '5';
        break;

      case '0110':
        result += '6';
        break;

      case '0111':
        result += '7';
        break;

      case '1000':
        result += '8';
        break;

      case '1001':
        result += '9';
        break;

      case '1010':
        result += 'A';
        break;

      case '1011':
        result += 'B';
        break;

      case '1100':
        result += 'C';
        break;

      case '1101':
        result += 'D';
        break;

      case '1110':
        result += 'E';
        break;

      case '1111':
        result += 'F';
        break;
    }
  }

  return result;
}

function assembling() {
  clear_memory_table();
  let pointer;
  let program_code = document
    .getElementsByTagName('textarea')[1]
    .value.split('\n')
    .map(item => item.trim())
    .filter(Boolean);

  // check microprogram code be not empty
  if (program_code.length == 0) {
    return false;
  }

  let len = program_code.length;
  let addrss_symble_table = new Array();
  // first level of translation (complete symble table addresses)
  for (let i = 0; i < len; i++) {
    pointer++;
    let label = '';
    let line = program_code[i].split(' ').filter(str => str.trim() !== '');

    // check microprogram code started with ORG
    if (i == 0 && line[0] != 'ORG') {
      alert('Program code must start with ORG.');
      return false;
    }

    // check microprogram code finished with END
    if (i == len - 1) {
      if (line[0] !== 'END' || line.length > 1) {
        alert('Program code must end with END.');
        return false;
      }
    }

    // ORG (set pointer)
    else if (line[0] === 'ORG') {
      if (line.length == 2) {
        pointer = parseInt(line[1]);
        continue;
      } else {
        alert('ORG must have a parameter');
        return false;
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
          return false;
        }
      }

      if (label !== '') {
        addrss_symble_table.push([label, pointer - 1]);
        program_code[i] = label + ', ' + line.join(' ');
      } else program_code[i] = line.join(' ');
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
      pointer = parseInt(line[1], 16);
      continue;
    }

    // translation of each instruction
    else {
      if (line[0].includes(',')) {
        label = line[0].slice(0, -1);
        line.shift();
      }

      let instruction_string = line.join(' ');

      if (line.join() == 'HLT') {
        let instruction_code = '0xFFFF';

        update_memory_table(
          pointer++,
          label,
          instruction_string,
          instruction_code
        );
        continue;
      }

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
          '0x' +
          binaryToHex(DecimaltotwosComplement(parseInt(line[1]))).toUpperCase();

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
        return false;
      }

      opcode = (lookup(line[0]) / 4).toString(2).padStart(4, '0');

      if (line.length == 3) {
        if (line[2] == 'I') I = '1';
        else {
          clear_memory_table();
          alert('Error in line ' + pointer);
          return false;
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
          return false;
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
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
