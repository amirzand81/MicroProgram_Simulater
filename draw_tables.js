function DecToHex_address(decimal) {
  let hex = DecToHex(decimal);
  let result;
  if (hex.length < 5) {
    let addedArr = [];
    for (let i = 0; i < 5 - hex.length; i++) {
      addedArr.push('0');
    }
    let arr = hex.split('');
    arr.splice(2, 0, ...addedArr);
    result = arr.join('');
    hex = result;
  }
  if (hex.length > 5) {
    hex = hex.split('').slice(-4).join('');
  }
  return hex;
}

function DecToHex(decimal) {
  // Data (decimal)

  length = -1; // Base string length
  string = ''; // Source 'string'

  characters = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ]; // character array

  do {
    // Grab each nibble in reverse order because JavaScript has no unsigned left shift

    string += characters[decimal & 0xf]; // Mask byte, get that character
    ++length; // Increment to length of string
  } while ((decimal >>>= 4)); // For next character shift right 4 bits, or break on 0

  decimal += 'x'; // Convert that 0 into a hex prefix string -> '0x'

  do decimal += string[length];
  while (length--); // Flip string forwards, with the prefixed '0x'

  return decimal; // return (hexadecimal);
}

function DecToHex_contents(number) {
  let hex = DecToHex(number);
  if (hex.length > 4) {
    hex = hex.split('').slice(-4).join('');
  } else if (hex.slice(2).length <= 4) {
    let number_of_zero = '';
    for (let i = 0; i < 4 - hex.slice(2).length; i++) {
      number_of_zero += '0';
    }
    hex = hex.split('').slice(-hex.slice(2).length).join('');
    hex = number_of_zero + hex;
  }
  return hex;
}

function writeHexNum(hex_number) {
  if (hex_number.length <= 4) {
    let number_of_zero = '';
    for (let i = 0; i < 4 - hex_number.length; i++) {
      number_of_zero += '0';
    }
    hex_number = number_of_zero + hex_number;
    return hex_number;
  }
}

function print(str) {
  console.log(str);
}

const memoryTable = document.createElement('table');
const memoryTable__container = document.querySelector('.memory-table');
for (let i = -1; i < 2048; i++) {
  let row = document.createElement('tr');
  row.style.fontSize = '10px';
  for (let j = 0; j < 5; j++) {
    let column = document.createElement('td');
    column.style.fontSize = '10px';

    if (i == -1) {
      if (j == 0) {
        column.textContent = 'Dec Addrress';
      } else if (j == 1) {
        column.innerText = 'Hex Addrress';
      } else if (j == 2) {
        column.innerText = 'Label';
        column.style.width = '70px';
      } else if (j == 3) {
        column.innerText = 'instruction';
        column.style.width = '180px';
      } else if (j == 4) {
        column.innerText = 'Contents';
        column.style.width = '60px';
      }
      column.classList.add('bold-text');
      row.classList.add('sticky-header');
    } else if (j == 0) {
      let link = document.createElement('a');
      link.textContent = i;
      link.onclick = function () {
        console.log(i);
        column.style.backgroundColor = 'red';
      };
      link.href = '#';
      link.classList.add('bold-text');
      column.appendChild(link);
    } else if (j == 1) {
      column.innerText = DecToHex_address(i);
      column.classList.add('bold-text');
    }
    column.classList.add('text-center');
    row.appendChild(column);
  }
  memoryTable.appendChild(row);
}
memoryTable__container.appendChild(memoryTable);

const micromemory = document.createElement('table');
const micromemory__container = document.querySelector('.micromemory-table');
for (let i = -1; i < 128; i++) {
  let row = document.createElement('tr');
  row.style.fontSize = '10px';

  for (let j = 0; j < 5; j++) {
    let column = document.createElement('td');
    column.style.fontSize = '10px';

    if (i == -1) {
      if (j == 0) {
        column.innerText = 'Dec Addrress';
      } else if (j == 1) {
        column.innerText = 'Hex Addrress';
      } else if (j == 2) {
        column.innerText = 'Label';
        column.style.width = '200px';
      } else if (j == 3) {
        column.style.width = '400px';
        column.innerText = 'instruction';
      } else if (j == 4) {
        column.innerText = 'Contents';
        column.style.width = '80px';
      }
      column.classList.add('bold-text');
      row.classList.add('sticky-header');
    } else if (j == 0) {
      column.innerText = i;
      column.classList.add('bold-text');
    } else if (j == 1) {
      column.innerText = '0x' + DecToHex_address(i).substring(3);
      column.classList.add('bold-text');
    }
    column.classList.add('text-center');
    row.appendChild(column);
  }
  micromemory.appendChild(row);
}
micromemory__container.appendChild(micromemory);

function update_microprogram_table(address, label, line, instruction_code) {
  const table = document.querySelector('.micromemory-table table');
  const rows = table.getElementsByTagName('tr');
  const columns = table.getElementsByTagName('td');
  let index = (address + 1) * 5;

  columns[index + 2].innerText = label;
  columns[index + 3].innerText = line;
  columns[index + 4].innerText = instruction_code;

  columns[index + 2].classList.add('appear-content');
  columns[index + 3].classList.add('appear-content');
  columns[index + 4].classList.add('appear-content');
}

function update_memory_table(address, label, line, instruction_code) {
  const table = document.querySelector('.memory-table table');
  const rows = table.getElementsByTagName('tr');
  const columns = table.getElementsByTagName('td');
  let index = (address + 1) * 5;

  columns[index + 2].innerText = label;
  columns[index + 3].innerText = line;
  columns[index + 4].innerText = instruction_code;

  columns[index + 2].classList.add('appear-content');
  columns[index + 3].classList.add('appear-content');
  columns[index + 4].classList.add('appear-content');
}

function lookup(str) {
  const table = document.querySelector('.micromemory-table table');
  const rows = table.getElementsByTagName('tr');
  const columns = table.getElementsByTagName('td');
  let index = (address + 1) * 5;

  columns[index + 2].innerText = label;
  columns[index + 3].innerText = line;
  columns[index + 4].innerText = instruction_code;

  columns[index + 2].classList.add('appear-content');
  columns[index + 3].classList.add('appear-content');
  columns[index + 4].classList.add('appear-content');
}

function scrollToRow(number) {
  const table = document.querySelector('.memory-table table');
  const rows = table.getElementsByTagName('tr');
  table.scrollTop = rows[number - 2].offsetTop;
}
