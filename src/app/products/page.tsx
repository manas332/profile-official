import { getProducts } from "@/app/actions";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const { success, data, error } = await getProducts();

    if (!success || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-red-600">
                        Error Loading Products
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {error || "Something went wrong while fetching products."}
                    </p>
                </div>
            </div>
        );
    }

    const products = data as Product[];

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                        Our Products
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                        Explore our exclusive collection of premium spiritual products.
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-500 dark:text-gray-400">
                            No products found. Please check back later.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 align-top">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
