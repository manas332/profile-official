'use server';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Initialize DynamoDB Client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'Products'; // Ensure this matches your actual table name

type CreateProductInput = {
    name: string;
    price: number;
    description: string;
    category: string;
    imageUrl: string;
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
