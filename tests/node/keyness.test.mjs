import assert from 'node:assert/strict';
import test from 'node:test';

import {
    compareKeyness,
    logLikelihood2x2,
    tokenizeKeyness
} from '../../src/science/Keyness.js';

const group = (label, texts, participantCount = 2) => ({ label, texts, participantCount });

test('calcula un G² 2x2 conocido', () => {
    const result = logLikelihood2x2(10, 90, 20, 80);
    assert.ok(Math.abs(result - 3.9865557364691195) < 1e-12);
});

test('maneja celdas cero sin infinito ni NaN', () => {
    assert.equal(Number.isFinite(logLikelihood2x2(5, 0, 0, 5)), true);
    assert.equal(logLikelihood2x2(0, 0, 0, 0), 0);
});

test('rechaza tablas con conteos negativos', () => {
    assert.throws(() => logLikelihood2x2(-1, 2, 3, 4), /valores inválidos/);
});

test('dos distribuciones proporcionales no producen falsos hallazgos', () => {
    const result = compareKeyness(
        group('A', ['dolor dolor apoyo']),
        group('B', ['dolor dolor dolor dolor apoyo apoyo']),
        { minTotal: 2 }
    );

    assert.deepEqual(result.terms, []);
    assert.deepEqual(result.keywordsA, []);
    assert.deepEqual(result.keywordsB, []);
});

test('detecta la dirección del enriquecimiento y conserva PMW', () => {
    const result = compareKeyness(
        group('Intervención', ['apoyo apoyo orientación llamada']),
        group('Control', ['error error conexión contraseña']),
        { minTotal: 2 }
    );
    const apoyo = result.terms.find((term) => term.word === 'apoyo');
    const error = result.terms.find((term) => term.word === 'error');

    assert.equal(apoyo.direction, 'Intervención');
    assert.equal(apoyo.groupACount, 2);
    assert.equal(apoyo.groupBCount, 0);
    assert.ok(apoyo.groupAPmw > apoyo.groupBPmw);
    assert.ok(apoyo.logRatio > 0);
    assert.equal(error.direction, 'Control');
    assert.ok(error.logRatio < 0);
});

test('intercambiar grupos conserva G² e invierte dirección', () => {
    const a = group('A', ['apoyo apoyo acceso']);
    const b = group('B', ['error error barrera']);
    const forward = compareKeyness(a, b, { minTotal: 2 });
    const reverse = compareKeyness(b, a, { minTotal: 2 });
    const first = forward.terms.find((term) => term.word === 'apoyo');
    const second = reverse.terms.find((term) => term.word === 'apoyo');

    assert.ok(Math.abs(first.g2 - second.g2) < 1e-12);
    assert.equal(first.direction, 'A');
    assert.equal(second.direction, 'A');
    assert.equal(first.groupACount, second.groupBCount);
});

test('tokeniza español Unicode y excluye stopwords', () => {
    assert.deepEqual(
        tokenizeKeyness('La orientación y la conexión facilitaron el acceso.'),
        ['orientación', 'conexión', 'facilitaron', 'acceso']
    );
});

test('respeta frecuencia mínima y límite', () => {
    const result = compareKeyness(
        group('A', ['apoyo apoyo acceso acceso llamada llamada']),
        group('B', ['error error barrera barrera clave clave']),
        { minTotal: 2, limit: 2 }
    );

    assert.equal(result.terms.length, 2);
    assert.equal(result.keywordsA.length <= 2, true);
    assert.equal(result.keywordsB.length <= 2, true);
});

test('advierte grupos con menos de dos participantes', () => {
    const result = compareKeyness(
        group('A', ['apoyo apoyo'], 1),
        group('B', ['error error'], 2),
        { minTotal: 2 }
    );

    assert.match(result.warnings.join('\n'), /A: menos de 2 participantes/);
});

test('rechaza un grupo sin palabras analizables', () => {
    assert.throws(
        () => compareKeyness(group('A', ['la y de']), group('B', ['error error'])),
        /Ambos grupos necesitan palabras/
    );
});
