import { getProducts } from "@/app/actions";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types/product";
import Link from "next/link";
import CartIcon from "@/components/CartIcon";
import Header from "@/components/astro/Header";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
    searchParams: Promise<{
        category?: string;
    }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const { success, data, error } = await getProducts();
    const { category } = await searchParams;

    if (!success || !data) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-amber-50/50 flex items-center justify-center p-4">
                    <div className="text-center space-y-4 max-w-md">
                        <h2 className="text-2xl font-serif text-amber-900">
                            The Stars are aligning...
                        </h2>
                        <p className="text-slate-600">
                            {error || "We're curating our sacred collection. Please check back in a moment."}
                        </p>
                    </div>
                </div>
            </>
        );
    }

    const allProducts = data as Product[];

    // Filter Products
    const products = category
        ? allProducts.filter(p => p.category === category)
        : allProducts;

    // Extract Categories
    const categories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            {/* Hero Section */}
            <div className="relative bg-amber-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern-mandala.png')] opacity-10 bg-repeat bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 opacity-90"></div>

                <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-amber-100 tracking-tight">
                        Sacred Collection
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-amber-200/80 font-light">
                        Authentic Rudraksha, Gemstones, and Spiritual Tools energized for your well-being.
                    </p>
                </div>
            </div>

            {/* Categories Strip */}
            <div className="sticky top-[80px] z-20 bg-white/80 backdrop-blur-md border-b border-amber-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-6 overflow-x-auto min-w-0 pb-1 flex-1 hide-scrollbar">
                            <Link
                                href="/astro/products"
                                className={`text-sm font-bold uppercase tracking-wide pb-1 whitespace-nowrap transition-colors ${!category ? 'text-amber-700 border-b-2 border-amber-600' : 'text-slate-500 hover:text-amber-600'
                                    }`}
                            >
                                All Items
                            </Link>
                            {categories.map(cat => (
                                <Link
                                    key={cat}
                                    href={`/astro/products?category=${cat}`}
                                    className={`text-sm font-bold uppercase tracking-wide pb-1 whitespace-nowrap transition-colors ${category === cat ? 'text-amber-700 border-b-2 border-amber-600' : 'text-slate-500 hover:text-amber-600'
                                        }`}
                                >
                                    {cat}
                                </Link>
                            ))}
                        </div>
                        {/* Cart Icon in Categories Strip - Visible mostly as secondary access */}
                        <div className="pl-4 border-l border-amber-100 shrink-0">
                            <CartIcon />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-12">
                {products.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <p className="text-xl text-slate-500 font-medium italic">
                            No items found in {category || 'collection'}.
                        </p>
                        <Link href="/astro/products" className="text-amber-600 hover:underline mt-2 inline-block">
                            View all items
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
