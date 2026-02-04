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
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
            </div>
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl line-clamp-1" title={product.name}>
                        {product.name}
                    </CardTitle>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        ₹{product.price.toLocaleString("en-IN")}
                    </span>
                </div>
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                    {product.category}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                    {product.description}
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant="primary" size="md">
                    View Details
                </Button>
            </CardFooter>
        </Card>
    );
}
