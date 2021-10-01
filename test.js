const shellfie = require('shellfie');
const gradient = require('gradient-string');

const banner = `
║╔═╗ ╦ ╦ ╔═╗ ╦═╗ ╔╦╗ ╔═╗ ╔═╗ ╦ ╦
║║   ╠═╣ ╠═╣ ╠╦╝  ║  ╚═╗ ║   ║ ║ 
║╚═╝ ╩ ╩ ╩ ╩ ╩╚═  ╩  ╚═╝ ╚═╝ ╩ ╩ 
║███████████████████████████████
║██████████████████████
║████████████
╚═══════════════════════════════
    awesome ascii charts
`

const formatted = gradient('#ffff', '#e684ae')(banner);
async function run (logo, name) {
    await shellfie(logo, {viewport: {height: 250, width: 370}, name, rendererType: 'dom',
    style: {
        'text-align': 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
});
}
run(formatted, 'logo');