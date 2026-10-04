'use strict';
// Profile der Kinder – serverseitig, damit der KI-Prompt nicht vom Browser manipuliert werden kann.
const KIDS = {
  emma: {
    name: 'Emma',
    desc: '4. Klasse Volksschule in Österreich, sehr gute Schülerin (Note 1), möchte gerne gefordert werden',
    levels: { mathe: 'Volksschule', deutsch: 'Volksschule', englisch: 'Volksschule' },
  },
  hannah: {
    name: 'Hannah',
    desc: '2. Klasse Mittelschule in Österreich',
    levels: { mathe: 'Standard AHS', deutsch: 'Standard', englisch: 'Standard' },
  },
};
const SUBJ = { mathe: 'Mathematik', deutsch: 'Deutsch', englisch: 'Englisch' };
const DEFAULT_BOOKS = {
  emma: { deutsch: 'Buntspecht Deutsch 4 (Buch + Arbeitsheft)', mathe: 'Denken und Rechnen 4 (Arbeitsbuch + Arbeitsheft)', englisch: '' },
  hannah: { deutsch: '', mathe: '', englisch: '' },
};
module.exports = { KIDS, SUBJ, DEFAULT_BOOKS };
