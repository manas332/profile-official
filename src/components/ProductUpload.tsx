'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { uploadData } from 'aws-amplify/storage';
import { createProduct, updateProduct } from '@/app/actions';
import { Product } from '@/lib/admin-store';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';

type ProductFormInputs = {
    name: string;
    price: number;
    category: string;
    description: string;
};

// Replace with your actual CloudFront domain
const CLOUDFRONT_DOMAIN = 'https://d1gim5ov894p9a.cloudfront.net';

interface ProductUploadProps {
    onSuccess?: (product?: Product) => void;
    initialData?: Product | null;
}

export default function ProductUpload({ onSuccess, initialData }: ProductUploadProps) {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormInputs>();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(initialData?.imageUrl || null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    }, []);

    React.useEffect(() => {
        if (initialData) {
            setValue('name', initialData.name);
            setValue('price', initialData.price);
            setValue('category', initialData.category);
            setValue('description', initialData.description);
            if (initialData.imageUrl) setPreview(initialData.imageUrl);
        }
    }, [initialData, setValue]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        multiple: false
    });

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
    };

    const onSubmit = async (data: ProductFormInputs) => {
        if (!file && !initialData?.imageUrl) {
            setStatus({ type: 'error', message: 'Please upload an image.' });
            return;
        }

        setUploading(true);
        setStatus(null);

        try {
            let imageUrl = initialData?.imageUrl || '';

            // 1. Upload to S3 if a new file is selected
            if (file) {
                const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                const filePath = `media/${fileName}`;

                await uploadData({
                    path: filePath,
                    data: file,
                }).result;

                // 2. Construct CloudFront URL
                imageUrl = `${CLOUDFRONT_DOMAIN}/${filePath}`;
            }

            // 3. Save metadata to DynamoDB via Server Action
            let result;
            if (initialData) {
                result = await updateProduct({
                    id: initialData.id,
                    name: data.name,
                    price: Number(data.price),
                    description: data.description,
                    category: data.category,
                    imageUrl: imageUrl,
                });
            } else {
                result = await createProduct({
                    name: data.name,
                    price: Number(data.price),
                    description: data.description,
                    category: data.category,
                    imageUrl: imageUrl,
                });
            }

            if (result.success) {
                setStatus({ type: 'success', message: initialData ? 'Product updated successfully!' : 'Product uploaded successfully!' });
                if (!initialData) {
                    reset();
                    setFile(null);
                    setPreview(null);
                } else {
                    // Refresh preview in case image changed
                    if (imageUrl) setPreview(imageUrl);
                }
                if (onSuccess) onSuccess();
            } else {
                setStatus({ type: 'error', message: `Error: ${result.error}` });
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setStatus({ type: 'error', message: 'Upload failed. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Image Upload Area */}
                <div className="space-y-2">
                    <Label className="text-amber-100">Product Image</Label>
                    <div
                        {...getRootProps()}
                        className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-amber-500 bg-amber-900/20' : 'border-amber-900/30 hover:border-amber-700/50 bg-neutral-900/50'}
              ${errors.name ? 'border-red-500' : ''}
            `}
                    >
                        <input {...getInputProps()} />

                        {preview ? (
                            <div className="relative inline-block group">
                                <img src={preview} alt="Preview" className="h-48 rounded-md object-contain" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-amber-200/60">
                                <UploadCloud className="w-12 h-12 mb-4 text-amber-500/50" />
                                <p className="text-sm font-medium">
                                    {isDragActive ? "Drop the image here" : "Drag & drop an image here, or click to select"}
                                </p>
                                <p className="text-xs mt-2 text-amber-200/40">Supports JPG, PNG (Max 5MB)</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-amber-100">Product Name</Label>
                        <Input
                            id="name"
                            {...register('name', { required: true })}
                            className="bg-neutral-900/50 border-amber-900/30 text-amber-100 focus:border-amber-500/50"
                            placeholder="e.g. Premium Rudraksha"
                        />
                        {errors.name && <span className="text-red-400 text-xs">Required</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price" className="text-amber-100">Price (₹)</Label>
                        <Input
                            id="price"
                            type="number"
                            {...register('price', { required: true, min: 0 })}
                            className="bg-neutral-900/50 border-amber-900/30 text-amber-100 focus:border-amber-500/50"
                            placeholder="0.00"
                        />
                        {errors.price && <span className="text-red-400 text-xs">Required</span>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category" className="text-amber-100">Category</Label>
                    <Input
                        id="category"
                        {...register('category', { required: true })}
                        className="bg-neutral-900/50 border-amber-900/30 text-amber-100 focus:border-amber-500/50"
                        placeholder="e.g. Gemstones, Pooja Items"
                    />
                    {errors.category && <span className="text-red-400 text-xs">Required</span>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-amber-100">Description</Label>
                    <Textarea
                        id="description"
                        {...register('description', { required: true })}
                        className="bg-neutral-900/50 border-amber-900/30 text-amber-100 min-h-[120px] focus:border-amber-500/50"
                        placeholder="Describe the product..."
                    />
                    {errors.description && <span className="text-red-400 text-xs">Required</span>}
                </div>

                {/* Action Buttons */}
                <Button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-6"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {initialData ? 'Updating...' : 'Uploading Product'}
                        </>
                    ) : (
                        initialData ? 'Update Product' : 'Upload Product'
                    )}
                </Button>

                {status && (
                    <div className={`p-4 rounded-md text-sm text-center ${status.type === 'error' ? 'bg-red-900/20 text-red-200' : 'bg-green-900/20 text-green-200'}`}>
                        {status.message}
                    </div>
                )}
            </form>
        </div>
    );
}
