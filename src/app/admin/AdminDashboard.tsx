"use client";

import { useState, useEffect } from "react";
import { adminStore, ConsultationPackage, Product } from "@/lib/admin-store";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Package, ShoppingBag, Plus, ExternalLink, LogOut } from "lucide-react";
import { logoutAdmin } from "./actions";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"packages" | "products">("packages");
    const [packages, setPackages] = useState<ConsultationPackage[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Form States
    const [pkgForm, setPkgForm] = useState({
        title: "",
        price: "",
        description: "",
        features: "",
        imageUrl: "",
        link: ""
    });

    const [prodForm, setProdForm] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        imageUrl: "",
        link: ""
    });

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        setPackages(adminStore.getPackages());
        setProducts(adminStore.getProducts());
    };

    const handleLogout = async () => {
        await logoutAdmin();
        router.push("/admin/login");
    };

    const handleAddPackage = (e: React.FormEvent) => {
        e.preventDefault();
        adminStore.addPackage({
            title: pkgForm.title,
            price: Number(pkgForm.price),
            description: pkgForm.description,
            features: pkgForm.features.split(",").map((f) => f.trim()),
            imageUrl: pkgForm.imageUrl,
            link: pkgForm.link
        });
        setPkgForm({ title: "", price: "", description: "", features: "", imageUrl: "", link: "" });
        setIsAdding(false);
        refreshData();
    };

    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        adminStore.addProduct({
            name: prodForm.name,
            price: Number(prodForm.price),
            description: prodForm.description,
            category: prodForm.category,
            imageUrl: prodForm.imageUrl,
            link: prodForm.link
        });
        setProdForm({ name: "", price: "", description: "", category: "", imageUrl: "", link: "" });
        setIsAdding(false);
        refreshData();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-amber-100">Admin Dashboard</h1>
                    <p className="text-amber-200/60">Manage your consultation packages and products</p>
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
                    onClick={() => setActiveTab("packages")}
                    className={`pb-3 px-4 flex items-center gap-2 transition-colors relative ${activeTab === "packages"
                        ? "text-amber-400 font-medium"
                        : "text-amber-200/50 hover:text-amber-200"
                        }`}
                >
                    <Package className="w-4 h-4" /> Packages
                    {activeTab === "packages" && (
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

            {isAdding ? (
                <Card className="bg-neutral-800 border-amber-900/30 mb-8 max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-amber-100">
                            Add New {activeTab === "packages" ? "Package" : "Product"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activeTab === "packages" ? (
                            <form onSubmit={handleAddPackage} className="space-y-4">
                                <Input
                                    className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                    placeholder="Package Title"
                                    value={pkgForm.title}
                                    onChange={(e) => setPkgForm({ ...pkgForm, title: e.target.value })}
                                    required
                                />
                                <div className="flex gap-4">
                                    <Input
                                        className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                        type="number"
                                        placeholder="Price (₹)"
                                        value={pkgForm.price}
                                        onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                                        required
                                    />
                                    <Input
                                        className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                        placeholder="Image URL"
                                        value={pkgForm.imageUrl}
                                        onChange={(e) => setPkgForm({ ...pkgForm, imageUrl: e.target.value })}
                                    />
                                </div>
                                <Input
                                    className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                    placeholder="External Purchase Link (Optional)"
                                    value={pkgForm.link}
                                    onChange={(e) => setPkgForm({ ...pkgForm, link: e.target.value })}
                                />
                                <textarea
                                    className="w-full bg-neutral-900/50 border border-amber-900/30 text-amber-100 rounded-md p-3 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                    placeholder="Description"
                                    value={pkgForm.description}
                                    onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
                                    required
                                />
                                <Input
                                    className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                    placeholder="Features (comma separated)"
                                    value={pkgForm.features}
                                    onChange={(e) => setPkgForm({ ...pkgForm, features: e.target.value })}
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                                        Save Package
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <Input
                                    className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                    placeholder="Product Name"
                                    value={prodForm.name}
                                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                                    required
                                />
                                <div className="flex gap-4">
                                    <Input
                                        className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                        type="number"
                                        placeholder="Price (₹)"
                                        value={prodForm.price}
                                        onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                                        required
                                    />
                                    <Input
                                        className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                        placeholder="Category"
                                        value={prodForm.category}
                                        onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Input
                                        className="bg-neutral-900/50 border-amber-900/30 text-amber-100 w-full"
                                        placeholder="Image URL"
                                        value={prodForm.imageUrl}
                                        onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                                    />
                                    <Input
                                        className="bg-neutral-900/50 border-amber-900/30 text-amber-100 w-full"
                                        placeholder="External Purchase Link (Optional)"
                                        value={prodForm.link}
                                        onChange={(e) => setProdForm({ ...prodForm, link: e.target.value })}
                                    />
                                </div>
                                <textarea
                                    className="w-full bg-neutral-900/50 border border-amber-900/30 text-amber-100 rounded-md p-3 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                    placeholder="Description"
                                    value={prodForm.description}
                                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                                    required
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                                        Save Product
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Button
                    onClick={() => setIsAdding(true)}
                    className="mb-8 bg-amber-600 hover:bg-amber-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New {activeTab === "packages" ? "Package" : "Product"}
                </Button>
            )}

            {/* List Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === "packages" ? (
                    packages.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-amber-200/40 border border-dashed border-amber-900/30 rounded-xl">
                            No packages found. Add one to get started.
                        </div>
                    ) : (
                        packages.map((pkg) => (
                            <Card key={pkg.id} className="bg-neutral-800 border-amber-900/30 hover:border-amber-700/50 transition-colors">
                                {pkg.imageUrl && (
                                    <div className="h-48 overflow-hidden rounded-t-xl">
                                        <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-amber-100 text-lg">{pkg.title}</CardTitle>
                                        <span className="text-amber-400 font-bold">₹{pkg.price}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-amber-200/60 text-sm mb-4 line-clamp-3">{pkg.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {pkg.features.map((f, i) => (
                                            <span key={i} className="text-xs bg-amber-900/30 text-amber-200 px-2 py-1 rounded-md">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                    {pkg.link && (
                                        <div className="mb-4">
                                            <a href={pkg.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                                                <ExternalLink className="w-3 h-3" /> View Link
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex justify-end pt-2 border-t border-amber-900/20">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this package?')) {
                                                    adminStore.deletePackage(pkg.id);
                                                    refreshData();
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
                    )
                ) : (
                    products.length === 0 ? (
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
                                    {prod.link && (
                                        <div className="mb-4">
                                            <a href={prod.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                                                <ExternalLink className="w-3 h-3" /> View Link
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex justify-end pt-2 border-t border-amber-900/20">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this product?')) {
                                                    adminStore.deleteProduct(prod.id);
                                                    refreshData();
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
                    )
                )}
            </div>
        </div>
    );
}
