const fs = require('fs');

const file = fs.readFileSync('example.txt');
const lines = file.toString().split('\n');

const result = {};

for (const line of lines) {
    let counter = 0;
    for (let i = line.length - 1 ; i > -1; --i) {
        if (!result[counter]) {
            result[counter] = `${line[i]} `;
        } else {
            result[counter] += `${line[i]} `;
        }
        
        counter++;
    }
    counter = 0;
    
}

const chart = Object.values(result).map(line => line.split(' ').map(l => l.repeat(2)).join(' ')).join('\n')
console.log(chart)
