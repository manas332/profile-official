'use server';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB Client
const client = new DynamoDBClient({
    region: process.env.APP_AWS_REGION,
    credentials: {
        accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || '',
    },
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'Products'; // Ensure this matches your actual table name

type CreateProductInput = {
    name: string;
    price: number;
    description: string;
    category: string;
    imageUrl: string;
    // New Fields
    benefits?: string[];
    zodiac?: string[];
    rashi?: string[];
    chakra?: string;
    planet?: string;
    element?: string;
    ritual?: string;
    isEnergized?: boolean;
    certification?: string;
};

export async function createProduct(input: CreateProductInput): Promise<{ success: boolean; error?: string }> {
    const productId = uuidv4();
    const timestamp = new Date().toISOString();

    const params = {
        TableName: TABLE_NAME,
        Item: {
            pk: `PRODUCT#${productId}`,
            sk: 'METADATA',
            id: productId,
            name: input.name,
            price: input.price,
            description: input.description,
            category: input.category,
            imageUrl: input.imageUrl,

            // New Fields
            benefits: input.benefits || [],
            zodiac: input.zodiac || [],
            rashi: input.rashi || [],
            chakra: input.chakra || null,
            planet: input.planet || null,
            element: input.element || null,
            ritual: input.ritual || null,
            isEnergized: input.isEnergized || false,
            certification: input.certification || null,

            createdAt: timestamp,
            updatedAt: timestamp,
        },
    };

    try {
        await docClient.send(new PutCommand(params));
        return { success: true };
    } catch (error) {
        console.error('DynamoDB Write Error:', error);
        return { success: false, error: 'Failed to save product metadata.' };
    }
}

import { ScanCommand } from '@aws-sdk/lib-dynamodb';

import { Product } from '@/types/product';

export async function getProducts(): Promise<{ success: boolean; data?: Product[]; error?: string }> {
    try {
        // Warning: Scan is expensive for large tables. Use Query if possible in production.
        const command = new ScanCommand({
            TableName: TABLE_NAME,
        });
        const result = await docClient.send(command);
        return { success: true, data: (result.Items as Product[]) || [] };
    } catch (error) {
        console.error('DynamoDB Scan Error:', error);
        return { success: false, error: 'Failed to fetch products.' };
    }
}

export async function getProductById(id: string): Promise<{ success: boolean; data?: Product; error?: string }> {
    try {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                pk: `PRODUCT#${id}`,
                sk: 'METADATA',
            },
        };

        const result = await docClient.send(new GetCommand(params));
        return { success: true, data: result.Item as Product };
    } catch (error) {
        console.error('DynamoDB Get Error:', error);
        return { success: false, error: 'Failed to fetch product details.' };
    }
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            pk: `PRODUCT#${productId}`,
            sk: 'METADATA',
        },
    };

    try {
        await docClient.send(new DeleteCommand(params));
        return { success: true };
    } catch (error) {
        console.error('DynamoDB Delete Error:', error);
        return { success: false, error: 'Failed to delete product.' };
    }
}

export async function updateProduct(product: CreateProductInput & { id: string }): Promise<{ success: boolean; error?: string }> {
    const timestamp = new Date().toISOString();

    const params = {
        TableName: TABLE_NAME,
        Key: {
            pk: `PRODUCT#${product.id}`,
            sk: 'METADATA',
        },
        UpdateExpression: 'set #name = :name, price = :price, description = :description, category = :category, imageUrl = :imageUrl, benefits = :benefits, zodiac = :zodiac, rashi = :rashi, chakra = :chakra, planet = :planet, element = :element, ritual = :ritual, isEnergized = :isEnergized, certification = :certification, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
            '#name': 'name',
        },
        ExpressionAttributeValues: {
            ':name': product.name,
            ':price': product.price,
            ':description': product.description,
            ':category': product.category,
            ':imageUrl': product.imageUrl,
            ':benefits': product.benefits || [],
            ':zodiac': product.zodiac || [],
            ':rashi': product.rashi || [],
            ':chakra': product.chakra || null,
            ':planet': product.planet || null,
            ':element': product.element || null,
            ':ritual': product.ritual || null,
            ':isEnergized': product.isEnergized || false,
            ':certification': product.certification || null,
            ':updatedAt': timestamp,
        },
    };

    try {
        await docClient.send(new UpdateCommand(params));
        return { success: true };
    } catch (error) {
        console.error('DynamoDB Update Error:', error);
        return { success: false, error: 'Failed to update product.' };
    }
}
