"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { deleteProduct, getProducts } from "@/app/actions";
import { Edit, LogOut, Plus, ShoppingBag, Trash2, User as UserIcon } from "lucide-react";
import { logoutAdmin } from "./actions";
import { useRouter } from "next/navigation";
import ProductUpload from "@/components/ProductUpload";
import AstrologerManagement from "./AstrologerManagement";
import { AstroData } from "@/lib/aws/astro";
import { fetchAstroData } from "./astro-actions";

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"products" | "profile">("profile");
    const [products, setProducts] = useState<Product[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [astroData, setAstroData] = useState<AstroData | null>(null);

    // Form States
    // ...

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = async () => {

        // Fetch products from DynamoDB
        const result = await getProducts();
        if (result.success && (result as any).data) {
            setProducts((result as any).data as Product[]);
        }

        // Fetch Astro Data
        const astroResult = await fetchAstroData();
        if (astroResult.success && astroResult.data) {
            setAstroData(astroResult.data);
        }
    };

    const handleLogout = async () => {
        await logoutAdmin();
        router.push("/admin/login");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-amber-100">Admin Dashboard</h1>
                    <p className="text-amber-200/60">Manage your profile and products</p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-amber-900/30 text-amber-200 hover:bg-neutral-800 hover:text-amber-100"
                >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
            </div>

            <div className="flex gap-4 mb-8 border-b border-amber-900/20 pb-1">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-3 px-4 flex items-center gap-2 transition-colors relative ${activeTab === "profile"
                        ? "text-amber-400 font-medium"
                        : "text-amber-200/50 hover:text-amber-200"
                        }`}
                >
                    <UserIcon className="w-4 h-4" /> Profile
                    {activeTab === "profile" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("products")}
                    className={`pb-3 px-4 flex items-center gap-2 transition-colors relative ${activeTab === "products"
                        ? "text-amber-400 font-medium"
                        : "text-amber-200/50 hover:text-amber-200"
                        }`}
                >
                    <ShoppingBag className="w-4 h-4" /> Products
                    {activeTab === "products" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 rounded-t-full" />
                    )}
                </button>
            </div>

            {activeTab === "profile" ? (
                astroData ? (
                    <AstrologerManagement initialData={astroData} />
                ) : (
                    <div className="text-amber-200/60 text-center py-12">Loading profile data...</div>
                )
            ) : (
                <>
                    {/* Products View */}
                    {(isAdding || editingProduct) ? (
                        <Card className="bg-neutral-800 border-amber-900/30 mb-8 max-w-2xl">
                            <CardHeader>
                                <CardTitle className="text-amber-100">
                                    {editingProduct ? "Edit Product" : "Add New Product"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <ProductUpload
                                        initialData={editingProduct}
                                        onSuccess={() => {
                                            setIsAdding(false);
                                            setEditingProduct(null);
                                            refreshData();
                                        }}
                                    />
                                    <div className="flex justify-end">
                                        <Button variant="outline" onClick={() => { setIsAdding(false); setEditingProduct(null); }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="mb-8 bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Product
                        </Button>
                    )}
                    {/* ... product list mapping ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-amber-200/40 border border-dashed border-amber-900/30 rounded-xl">
                                No products found. Add one to get started.
                            </div>
                        ) : (
                            products.map((prod) => (
                                <Card key={prod.id} className="bg-neutral-800 border-amber-900/30 hover:border-amber-700/50 transition-colors">
                                    {prod.imageUrl && (
                                        <div className="h-48 overflow-hidden rounded-t-xl">
                                            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs text-amber-500 uppercase tracking-wider font-semibold">{prod.category}</span>
                                                <CardTitle className="text-amber-100 text-lg mt-1">{prod.name}</CardTitle>
                                            </div>
                                            <span className="text-amber-400 font-bold">₹{prod.price}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-amber-200/60 text-sm mb-4 line-clamp-3">{prod.description}</p>


                                        <div className="flex justify-end pt-2 border-t border-amber-900/20 gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingProduct(prod);
                                                    setActiveTab("products");
                                                }}
                                                className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/20 border-transparent shadow-none"
                                            >
                                                <Edit className="w-4 h-4 mr-2" /> Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to delete this product?')) {
                                                        const result = await deleteProduct(prod.id);
                                                        if (result.success) {
                                                            refreshData();
                                                        } else {
                                                            alert("Failed to delete product: " + result.error);
                                                        }
                                                    }
                                                }}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border-transparent shadow-none"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
