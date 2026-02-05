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

import { ScanCommand } from '@aws-sdk/lib-dynamodb';

export async function getProducts() {
    try {
        // Warning: Scan is expensive for large tables. Use Query if possible in production.
        const command = new ScanCommand({
            TableName: TABLE_NAME,
        });
        const result = await docClient.send(command);
        return { success: true, data: result.Items || [] };
    } catch (error) {
        console.error('DynamoDB Scan Error:', error);
        return { success: false, error: 'Failed to fetch products.' };
    }
}

export async function getProductById(id: string) {
    try {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                pk: `PRODUCT#${id}`,
                sk: 'METADATA',
            },
        };

        const result = await docClient.send(new GetCommand(params));
        return { success: true, data: result.Item };
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

    // We need to fetch the existing item to preserve createdAt field or we can just accept it's a replacement
    // For simplicity, we'll do a PutCommand which overwrites. 
    // Ideally we should use UpdateCommand but that requires constructing update expression dynamically.
    // To preserve createdAt, we really should fetch first or use UpdateExpression.
    // Let's use PutCommand but try to preserve what we can if we had the original data, 
    // but since we don't pass original createdAt, let's just update updatedAt.

    // Better approach: Use UpdateCommand to only update changed fields? 
    // Or just overwrite everything but keep the PK/SK/ID. 

    // Let's use a simpler approach for now: Overwrite but we need to know the original createdAt?
    // Actually, let's just use the current time for updatedAt and if we lose original createdAt it's not the end of the world for this app,
    // BUT checking CreateProductInput, it doesn't have createdAt.
    // Let's try to do it right with UpdateCommand.

    const params = {
        TableName: TABLE_NAME,
        Key: {
            pk: `PRODUCT#${product.id}`,
            sk: 'METADATA',
        },
        UpdateExpression: 'set #name = :name, price = :price, description = :description, category = :category, imageUrl = :imageUrl, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
            '#name': 'name',
        },
        ExpressionAttributeValues: {
            ':name': product.name,
            ':price': product.price,
            ':description': product.description,
            ':category': product.category,
            ':imageUrl': product.imageUrl,
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
