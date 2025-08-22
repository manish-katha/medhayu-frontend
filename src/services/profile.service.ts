
'use server';

import type { Circle } from '@/types/book';
import { readJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import path from 'path';

const circlesFilePath = path.join(corpusPath, 'circles.json');


export async function getCirclesForUser(userId: string): Promise<Circle[]> {
    const circles = await readJsonFile<Circle[]>(circlesFilePath, []);
    return circles.filter(c => c.members.some(m => m.userId === userId));
}
