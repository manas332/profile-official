import { getProductById } from "@/app/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Sparkles, ScrollText, Award } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ProductActions from "@/components/ProductActions";

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
        <div className="min-h-screen bg-slate-50">
            {/* Header/Navigation */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-100/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        href="/products"
                        className="flex items-center text-amber-800 hover:text-amber-600 transition-colors font-medium group"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Collection
                    </Link>
                    <div className="hidden sm:block">
                        <span className="text-amber-900/60 text-sm font-serif">Sacred Collection / {product.category || 'Items'}</span>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-start">
                    {/* Left Column: Image (Sticky on Desktop) */}
                    <div className="lg:sticky lg:top-28 space-y-6">
                        <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-xl shadow-amber-900/5 border border-amber-100 relative group">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {product.isEnergized && (
                                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur shadow-lg text-amber-800 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 border border-amber-200 z-10">
                                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span>Energized (Pran Pratishtha)</span>
                                </div>
                            )}
                        </div>

                        {/* Trust Signals Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-amber-50 shadow-sm flex items-start gap-3">
                                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">100% Authentic</h4>
                                    <p className="text-xs text-slate-500">Orginality Guaranteed</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-amber-50 shadow-sm flex items-start gap-3">
                                <Award className="w-6 h-6 text-amber-600 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">Certified</h4>
                                    <p className="text-xs text-slate-500">{product.certification || 'Lab Tested'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-slate-900 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1 bg-amber-50 text-amber-800 text-sm font-bold uppercase tracking-wider rounded-md border border-amber-100">
                                    {product.category || 'Spiritual'}
                                </span>
                                {product.benefits?.slice(0, 3).map((b: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                        {b}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-4xl font-black text-amber-900">
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </span>
                                <span className="text-amber-700/60 text-sm">(Inclusive of all taxes)</span>
                            </div>

                            {/* Client Actions */}
                            <ProductActions product={product} />
                        </div>

                        {/* Mystical Attributes Grid */}
                        {(product.zodiac?.length || product.rashi?.length || product.planet || product.chakra || product.element) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-100">
                                {product.planet && (
                                    <div className="space-y-1">
                                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Planet</span>
                                        <p className="font-serif text-slate-800">{product.planet}</p>
                                    </div>
                                )}
                                {product.chakra && (
                                    <div className="space-y-1">
                                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Chakra</span>
                                        <p className="font-serif text-slate-800">{product.chakra}</p>
                                    </div>
                                )}
                                {product.element && (
                                    <div className="space-y-1">
                                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Element</span>
                                        <p className="font-serif text-slate-800">{product.element}</p>
                                    </div>
                                )}
                                {((product.zodiac?.length ? product.zodiac : product.rashi)?.length ?? 0) > 0 && (
                                    <div className="space-y-1">
                                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Zodiac</span>
                                        <p className="font-serif text-slate-800">{(product.zodiac?.length ? product.zodiac : product.rashi)?.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-light">
                                <h3 className="font-serif text-2xl text-slate-800 not-prose mb-4">Description</h3>
                                <ReactMarkdown>{product.description}</ReactMarkdown>
                            </div>

                            {product.ritual && (
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mt-8">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ScrollText className="w-5 h-5 text-amber-600" />
                                        <h3 className="font-serif text-xl text-slate-800">Usage Ritual (Vidhi)</h3>
                                    </div>
                                    <p className="text-slate-600 italic leading-relaxed">
                                        {product.ritual}
                                    </p>
                                </div>
                            )}

                            {/* Benefits List */}
                            {product.benefits && product.benefits.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="font-serif text-xl text-slate-800 mb-4">Key Benefits</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {product.benefits.map((benefit: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                                <span className="text-slate-600">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
