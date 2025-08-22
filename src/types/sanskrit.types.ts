
export const SANSKRIT_TEXT_TYPE_GROUPS = {
    prose: [
        { id: 'gadya', label: 'Gadya (Prose)', sanskrit: 'गद्य' },
        { id: 'vakya', label: 'Vakya (Sentence)', sanskrit: 'वाक्य' },
        { id: 'churnika', label: 'Churnika (Short Prose)', sanskrit: 'चूर्णिका' },
    ],
    poetic: [
        { id: 'shloka', label: 'Shloka (Verse)', sanskrit: 'श्लोक' },
        { id: 'sutra', label: 'Sutra (Aphorism)', sanskrit: 'सूत्र' },
        { id: 'padya', label: 'Padya (Poetry)', sanskrit: 'पद्य' },
        { id: 'richa', label: 'Richa (Vedic Verse)', sanskrit: 'ऋचा' },
        { id: 'mantra', label: 'Mantra', sanskrit: 'मन्त्र' },
        { id: 'upanishad', label: 'Upanishad', sanskrit: 'उपनिषद्' },
    ]
};

export const COMMENTARY_TYPE_GROUPS = {
    primary: [
        { id: 'bhashya', label: 'Bhashya (Commentary)', sanskrit: 'भाष्य' },
        { id: 'tika', label: 'Tika (Sub-commentary)', sanskrit: 'टीका' },
        { id: 'vyakhya', label: 'Vyakhya (Explanation)', sanskrit: 'व्याख्या' },
    ],
    secondary: [
        { id: 'varttika', label: 'Varttika (Explanatory notes)', sanskrit: 'वार्त्तिक' },
        { id: 'tippani', label: 'Tippani (Gloss)', sanskrit: 'टिप्पणी' },
        { id: 'karika', label: 'Karika (Mnemonic verse)', sanskrit: 'कारिका' },
        { id: 'sara', label: 'Sara (Essence/Summary)', sanskrit: 'सार' },
    ]
};

export const SOURCE_TYPE_GROUPS = SANSKRIT_TEXT_TYPE_GROUPS;

export const ALL_SOURCE_TYPES = [...SANSKRIT_TEXT_TYPE_GROUPS.prose.map(t => t.id), ...SANSKRIT_TEXT_TYPE_GROUPS.poetic.map(t => t.id)];
export const ALL_COMMENTARY_TYPES = [...COMMENTARY_TYPE_GROUPS.primary.map(t => t.id), ...COMMENTARY_TYPE_GROUPS.secondary.map(t => t.id)];
const ALL_TYPES = [
    ...Object.values(SANSKRIT_TEXT_TYPE_GROUPS).flat(),
    ...Object.values(COMMENTARY_TYPE_GROUPS).flat()
];

const typeLabelMap = new Map(ALL_TYPES.map(t => [t.id, t.label]));
const sanskritLabelMap = new Map(ALL_TYPES.map(t => [t.id, t.sanskrit]));
const iastLabelMap = new Map(ALL_TYPES.map(t => [t.id, t.label])); // Assuming label is IAST

export const getTypeLabelById = (id: string): string => typeLabelMap.get(id) || id;
export const getSanskritLabelById = (id: string): string => sanskritLabelMap.get(id) || id;
export const getIastLabelById = (id: string): string => iastLabelMap.get(id) || id;
