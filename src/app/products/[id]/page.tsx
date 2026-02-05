import { getProductById } from "@/app/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";

interface ProductDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { id } = await params;
    const { success, data } = await getProductById(id);

    if (!success || !data) {
        notFound();
    }

    const product = data;

    return (
        <div className="min-h-screen bg-white">
            {/* Header/Navigation */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        href="/products"
                        className="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Collection
                    </Link>
                    <div className="hidden sm:block">
                        <span className="text-slate-400 text-sm">Sacred Collection / {product.category || 'Items'}</span>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-start">
                    {/* Left Column: Image (Sticky on Desktop) */}
                    <div className="lg:sticky lg:top-28">
                        <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="space-y-8 pb-24 lg:pb-0">
                        <div className="space-y-2">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center space-x-4">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold uppercase tracking-wider rounded-md">
                                    {product.category || 'Spiritual'}
                                </span>
                                <span className="text-slate-400 text-sm font-medium italic">
                                    SKU: {product.id.substring(0, 8).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-baseline space-x-2">
                            <span className="text-4xl font-black text-slate-900">
                                ₹{Number(product.price).toLocaleString("en-IN")}
                            </span>
                            <span className="text-slate-400 text-sm">(Inclusive of all taxes)</span>
                        </div>

                        <div className="border-t border-slate-100 pt-8">
                            <h2 className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-4">Description</h2>
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg">
                                {product.description.split('\n').map((para: string, i: number) => (
                                    <p key={i} className="mb-4">{para}</p>
                                ))}
                            </div>
                        </div>

                        {/* Desktop Buy Button */}
                        <div className="hidden lg:block pt-8">
                            <Button className="w-full py-6 text-xl bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xl shadow-blue-200 transition-all hover:scale-[1.02] flex items-center justify-center space-x-3">
                                <ShoppingBag className="w-6 h-6" />
                                <span>Add to Sacred Cart</span>
                            </Button>
                        </div>

                        {/* Features/Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-50">
                            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-xl">✨</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700">100% Authentic</span>
                            </div>
                            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-xl">🕉️</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700">Blessed Item</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-safe z-20 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Price</span>
                        <span className="text-2xl font-black text-slate-900">₹{Number(product.price).toLocaleString("en-IN")}</span>
                    </div>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center space-x-2">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="font-bold">Buy Now</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
