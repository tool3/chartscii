import Chartscii from '../chartscii';
import { InputData } from '../types/types';

// Status keys: 0 = down, 1 = ok, 2 = warning, 3 = maintenance.
// 36 hosts across web/api/db/cache/lb/queue/search/cdn tiers — mostly
// healthy with a few notable incidents.
const fleet: InputData[] = [
    { value: 1, label: 'web1' }, { value: 1, label: 'web2' }, { value: 1, label: 'web3' },
    { value: 2, label: 'web4' }, { value: 1, label: 'web5' }, { value: 1, label: 'web6' },
    { value: 1, label: 'api1' }, { value: 1, label: 'api2' }, { value: 2, label: 'api3' },
    { value: 1, label: 'api4' }, { value: 1, label: 'api5' }, { value: 1, label: 'api6' },
    { value: 1, label: 'db1' }, { value: 0, label: 'db2' }, { value: 1, label: 'db3' },
    { value: 1, label: 'cch1' }, { value: 1, label: 'cch2' }, { value: 3, label: 'cch3' },
    { value: 1, label: 'lb1' }, { value: 1, label: 'lb2' }, { value: 1, label: 'lb3' },
    { value: 1, label: 'q1' }, { value: 1, label: 'q2' }, { value: 1, label: 'q3' },
    { value: 1, label: 'es1' }, { value: 1, label: 'es2' }, { value: 2, label: 'es3' },
    { value: 1, label: 'cdn1' }, { value: 1, label: 'cdn2' }, { value: 1, label: 'cdn3' },
    { value: 1, label: 'mon1' }, { value: 1, label: 'mon2' }, { value: 1, label: 'log1' },
    { value: 1, label: 'log2' }, { value: 1, label: 'auth1' }, { value: 1, label: 'auth2' },
];

const chart = new Chartscii(fleet, {
    type: 'status',
    width: 50,
    color: {
        0: 'red',     // down
        1: 'green',   // ok
        2: 'yellow',  // warning
        3: '#888888', // maintenance
    },
    theme: 'nature',
    barSize: 5,
    padding: 1,
    title: { text: 'Production fleet — 36 hosts', align: 'center' },
    legend: {
        position: 'top',
        align: 'center',
        values: ['down', 'ok', 'warning', 'maintenance'],
    },
});

console.log(chart.create());
