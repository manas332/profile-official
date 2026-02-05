import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Button from "@/components/ui/Button";
import { Product } from "@/types/product";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-semibold line-clamp-1 text-gray-900 dark:text-gray-100" title={product.name}>
                    {product.name}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    ₹{product.price.toLocaleString("en-IN")}
                </p>
            </CardContent>
        </Card>
    );
}
