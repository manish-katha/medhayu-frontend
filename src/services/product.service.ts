
'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { Product } from '@/types/product';
import path from 'path';

const productsFilePath = path.join(corpusPath, 'products.json');

export async function getProducts(): Promise<Product[]> {
    return readJsonFile<Product[]>(productsFilePath, []);
}

export async function getProductsByBrand(brandName: string): Promise<Product[]> {
    const allProducts = await getProducts();
    return allProducts.filter(p => p.brand === brandName);
}


export async function getProductById(id: number): Promise<Product | undefined> {
    const products = await getProducts();
    return products.find(p => p.id === id);
}

export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const products = await getProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
        id: newId,
        ...productData,
    };
    products.push(newProduct);
    await writeJsonFile(productsFilePath, products);
    return newProduct;
}
