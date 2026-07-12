import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function collectFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async (entry) => {
        const fullPath = path.join(directory, entry.name);
        return entry.isDirectory() ? collectFiles(fullPath) : [fullPath];
    }));
    return nested.flat();
}

test('R10: ningún archivo JavaScript de producción supera 350 líneas', async () => {
    const files = (await collectFiles(path.join(root, 'src')))
        .filter((file) => file.endsWith('.js'));
    const violations = [];

    for (const file of files) {
        const content = await readFile(file, 'utf8');
        const lines = content.split(/\r?\n/).length;
        if (lines > 350) violations.push({ file: path.relative(root, file), lines });
    }

    assert.ok(files.length > 0, 'la auditoría debe encontrar archivos de producción');
    assert.deepEqual(violations, []);
});

test('los archivos protegidos permanecen presentes', async () => {
    const protectedFiles = [
        'src/ui/App.js',
        'index.html',
        'docs/AI_RIGOR_SHIELD.md',
        'docs/AUDIT_DOUBT_MANIFEST.md'
    ];

    for (const relativePath of protectedFiles) {
        const content = await readFile(path.join(root, relativePath), 'utf8');
        assert.ok(content.length > 0, `${relativePath} debe existir y no estar vacío`);
    }
});
