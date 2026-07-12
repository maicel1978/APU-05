/**
 * Normaliza formatos portables de glosario sin acceder a IndexedDB.
 * Soporta el formato actual y la plantilla histórica incluida en test_data.
 */
export function normalizeGlossaryImport(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('El archivo de glosario no contiene un objeto JSON válido.');
    }

    let entries;
    if (Array.isArray(data.custom_glossary)) {
        entries = data.custom_glossary;
    } else if (data.appName === 'APU-05' && Array.isArray(data.terms)) {
        entries = data.terms;
    } else {
        throw new Error('Formato de glosario no compatible.');
    }

    return entries.map((item, index) => normalizeEntry(item, index));
}

function normalizeEntry(item, index) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
        throw new Error(`Término ${index + 1}: formato inválido.`);
    }

    const term = typeof item.term === 'string' ? item.term.trim() : '';
    const category = typeof item.category === 'string' ? item.category.trim() : '';
    if (!term || !category) {
        throw new Error(`Término ${index + 1}: se requieren "term" y "category".`);
    }

    return { term, category };
}
