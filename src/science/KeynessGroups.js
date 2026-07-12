import { speakerKey } from '../core/SpeakerIdentity.js';
import { compareKeyness } from './Keyness.js';

export function getCovariateValues(speakers, covariateKey) {
    const values = new Set();
    for (const speaker of speakers || []) {
        const value = speaker?.covariates?.[covariateKey];
        if (value !== null && value !== undefined && String(value).trim()) {
            values.add(String(value));
        }
    }
    return [...values].sort((a, b) => a.localeCompare(b, 'es'));
}

export function prepareKeynessComparison(config, options = {}) {
    const { segments, speakers, covariateKey, groupA, groupB } = config;
    if (!covariateKey) throw new Error('Seleccione una covariable para comparar.');
    if (!groupA || !groupB) throw new Error('Seleccione Grupo A y Grupo B.');
    if (groupA === groupB) throw new Error('Grupo A y Grupo B deben ser diferentes.');

    const speakerGroups = new Map();
    for (const speaker of speakers || []) {
        const value = speaker?.covariates?.[covariateKey];
        if (value !== null && value !== undefined && String(value).trim()) {
            speakerGroups.set(speakerKey(speaker.sessionId, speaker.id), String(value));
        }
    }

    const textsA = [];
    const textsB = [];
    const participantsA = new Set();
    const participantsB = new Set();
    let excludedSegments = 0;
    for (const segment of segments || []) {
        const participant = speakerKey(segment.sessionId, segment.speakerId);
        const value = speakerGroups.get(participant);
        if (value === groupA) {
            textsA.push(segment.cleanedText);
            participantsA.add(participant);
        } else if (value === groupB) {
            textsB.push(segment.cleanedText);
            participantsB.add(participant);
        } else {
            excludedSegments++;
        }
    }

    if (participantsA.size === 0) throw new Error(`No hay participantes para Grupo A: ${groupA}.`);
    if (participantsB.size === 0) throw new Error(`No hay participantes para Grupo B: ${groupB}.`);

    const result = compareKeyness(
        { label: groupA, texts: textsA, participantCount: participantsA.size },
        { label: groupB, texts: textsB, participantCount: participantsB.size },
        options
    );
    return {
        ...result,
        covariateKey,
        excludedSegments,
        includedSegments: textsA.length + textsB.length
    };
}
