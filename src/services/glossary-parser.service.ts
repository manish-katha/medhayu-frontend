
'use server';

interface Term {
    id: string;
    term: string;
    transliteration: string;
    definition: string;
}

interface ParsedData {
    terms: Term[];
    errors: string[];
}

/**
 * Parses raw text content into a structured glossary format.
 * This is a simplified placeholder for a more complex parsing logic.
 * @param rawContent The raw string data from a textarea or file.
 * @param sourceType The type of source ('paste', 'ai', 'upload').
 * @returns A structured object with parsed terms and any errors.
 */
export async function runParser(rawContent: string, sourceType: 'paste' | 'ai' | 'upload'): Promise<ParsedData> {
    const terms: Term[] = [];
    const errors: string[] = [];
    const lines = rawContent.split('\\n').filter(line => line.trim() !== '');

    lines.forEach((line, index) => {
        try {
            // Simple CSV-like parsing: term,transliteration,definition
            const parts = line.split(',');
            if (parts.length >= 2) {
                terms.push({
                    id: `term-${Date.now()}-${index}`,
                    term: parts[0].trim(),
                    transliteration: parts.length > 2 ? parts[1].trim() : '',
                    definition: parts.slice(parts.length > 2 ? 2: 1).join(',').trim(),
                });
            } else if (line.includes(':')) {
                 // Simple key: value parsing
                 const [term, ...definitionParts] = line.split(':');
                 if(term && definitionParts.length > 0) {
                     terms.push({
                        id: `term-${Date.now()}-${index}`,
                        term: term.trim(),
                        transliteration: '',
                        definition: definitionParts.join(':').trim(),
                    });
                 } else {
                     errors.push(`Line ${index + 1}: Invalid format. Expected 'term: definition'.`);
                 }
            }
            else {
                errors.push(`Line ${index + 1}: Invalid format. Expected at least two comma-separated values.`);
            }
        } catch (e) {
            errors.push(`Line ${index + 1}: Failed to parse. Error: ${(e as Error).message}`);
        }
    });

    return { terms, errors };
}
