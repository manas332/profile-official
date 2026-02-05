import { getProducts } from "@/app/actions";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const { success, data, error } = await getProducts();

    if (!success || !data) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Error Loading Products
                    </h2>
                    <p className="text-slate-600">
                        {error || "Something went wrong while fetching our products collection."}
                    </p>
                </div>
            </div>
        );
    }

    const products = data as Product[];

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl uppercase border-b-8 border-blue-600 inline-block pb-2 mb-4">
                        Sacred Collection
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-600 font-medium">
                        Authentic gemstones, rudraksha, and spiritual items crafted for your well-being.
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-xl text-slate-500 font-medium italic">
                            No sacred items found in the collection at this time.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
