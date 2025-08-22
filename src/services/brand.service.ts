
'use server';

import { readJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { Brand } from '@/types/brand';
import path from 'path';

const brandsFilePath = path.join(corpusPath, 'brands.json');

export async function getBrands(): Promise<Brand[]> {
    return readJsonFile<Brand[]>(brandsFilePath, []);
}

export async function getBrandBySlug(slug: string): Promise<Brand | undefined> {
    const brands = await getBrands();
    return brands.find(brand => brand.slug === slug);
}
