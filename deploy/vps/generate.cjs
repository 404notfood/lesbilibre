// Rebuild the bundle from a previously downloaded copy of the linked generator.
// Its modules run in an isolated VM without filesystem or network APIs.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function main() {
    const source = path.resolve(process.argv[2]);
    const context = vm.createContext({ TextEncoder, TextDecoder, structuredClone, atob });
    const modules = new Map();
    function moduleAt(filename) {
        filename = path.resolve(filename);
        if (!filename.startsWith(source + path.sep)) throw new Error('Import outside generator');
        if (!modules.has(filename)) {
            modules.set(filename, new vm.SourceTextModule(fs.readFileSync(filename, 'utf8'), {
                context, identifier: filename,
            }));
        }
        return modules.get(filename);
    }
    const root = new vm.SourceTextModule(`
        import { defaults } from './state.js';
        import { generate } from './generator.js';
        export { defaults, generate };
    `, { context, identifier: path.join(source, 'entry.js') });
    await root.link((specifier, parent) => {
        if (!specifier.startsWith('.')) throw new Error('External import forbidden');
        return moduleAt(path.resolve(path.dirname(parent.identifier), specifier));
    });
    await root.evaluate({ timeout: 10000 });
    const overrides = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8'));
    const result = root.namespace.generate({ ...root.namespace.defaults(), ...overrides });
    for (const [name, contents] of Object.entries(result.files)) {
        fs.writeFileSync(path.join(__dirname, name), contents.replaceAll('\r\n', '\n'));
    }
    fs.writeFileSync(path.join(__dirname, 'lesbilibre-config.json'), JSON.stringify({
        schemaVersion: 1, generatorVersion: '1.3.0', configuration: result.config,
    }, null, 2) + '\n');
    console.log(JSON.stringify({ audit: result.audit, files: Object.keys(result.files) }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
