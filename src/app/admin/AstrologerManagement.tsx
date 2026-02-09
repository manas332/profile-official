"use client";

import { useState, useEffect } from "react";
import { AstroData, ConsultationPackage } from "@/lib/aws/astro";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { saveAstroData } from "./astro-actions";

interface AstrologerManagementProps {
    initialData: AstroData;
}

export default function AstrologerManagement({ initialData }: AstrologerManagementProps) {
    const [data, setData] = useState<AstroData>(initialData);
    const [saving, setSaving] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isAddingPackage, setIsAddingPackage] = useState(false);

    useEffect(() => {
        console.log("AstrologerManagement received new initialData:", initialData);
        setData(initialData);
    }, [initialData]);

    // Temp state for package form
    const [pkgForm, setPkgForm] = useState<ConsultationPackage>({
        title: "",
        price: "",
        duration: "",
        description: "",
        features: [],
        link: "",
        imageUrl: ""
    });

    const handleSave = async () => {
        setSaving(true);
        const result = await saveAstroData(data);
        setSaving(false);
        if (result.success) {
            alert("Saved successfully!");
        } else {
            alert("Error saving: " + result.error);
        }
    };

    const handleAddQuote = () => {
        setData({ ...data, quotes: [...data.quotes, "New Quote"] });
    };

    const updateQuote = (index: number, val: string) => {
        const newQuotes = [...data.quotes];
        newQuotes[index] = val;
        setData({ ...data, quotes: newQuotes });
    };

    const removeQuote = (index: number) => {
        const newQuotes = data.quotes.filter((_, i) => i !== index);
        setData({ ...data, quotes: newQuotes });
    };

    const handleSavePackage = () => {
        if (editingIndex !== null) {
            // Update existing
            const newPackages = [...data.packages];
            newPackages[editingIndex] = pkgForm;
            setData({ ...data, packages: newPackages });
            setEditingIndex(null);
        } else {
            // Add new
            setData({ ...data, packages: [...data.packages, pkgForm] });
        }
        setIsAddingPackage(false);

        // Reset form
        setPkgForm({
            title: "",
            price: "",
            duration: "",
            description: "",
            features: [],
            link: "",
            imageUrl: ""
        });
    };

    const deletePackage = (index: number) => {
        if (confirm("Are you sure?")) {
            const newPackages = data.packages.filter((_, i) => i !== index);
            setData({ ...data, packages: newPackages });
        }
    };

    const startEditPackage = (pkg: ConsultationPackage, index: number) => {
        setPkgForm({ ...pkg });
        setEditingIndex(index);
        setIsAddingPackage(true);
    };

    return (
        <div className="space-y-8">
            <Card className="bg-neutral-800 border-amber-900/30">
                <CardHeader>
                    <CardTitle className="text-amber-100">Basic Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-amber-200/60 text-sm">Name</label>
                        <Input
                            className="bg-neutral-900/50 border-amber-900/30 text-amber-100 mt-1"
                            value={data.name || ""}
                            onChange={(e) => setData({ ...data, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-amber-200/60 text-sm">Description</label>
                        <textarea
                            className="w-full bg-neutral-900/50 border border-amber-900/30 text-amber-100 rounded-md p-3 min-h-[150px] mt-1 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                            value={data.description || ""}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-amber-200/60 text-sm block mb-2">Profile Photo URL</label>
                        <div className="flex gap-4 items-start">
                            {data.photoUrl && (
                                <img src={data.photoUrl} alt="Current" className="w-24 h-32 object-cover rounded-lg border border-amber-900/30" />
                            )}
                            <div className="flex-1">
                                <Input
                                    className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                    placeholder="Photo URL"
                                    value={data.photoUrl || ""}
                                    onChange={(e) => setData({ ...data, photoUrl: e.target.value })}
                                />
                                <p className="text-xs text-amber-200/40 mt-1">Enter CloudFront URL directly.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-neutral-800 border-amber-900/30">
                <CardHeader>
                    <CardTitle className="text-amber-100">About Page Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-amber-200/60 text-sm block mb-2">About Page Text</label>
                        <p className="text-xs text-amber-200/40 mb-2">
                            Use markdown-like formatting: # for main heading, ## for subheading, **text** for bold
                        </p>
                        <textarea
                            className="w-full bg-neutral-900/50 border border-amber-900/30 text-amber-100 rounded-md p-3 min-h-[300px] mt-1 focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono text-sm"
                            value={data.aboutContent || ""}
                            onChange={(e) => setData({ ...data, aboutContent: e.target.value })}
                            placeholder="# About Us&#10;&#10;Write your about page content here..."
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-neutral-800 border-amber-900/30">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-amber-100">Quotes</CardTitle>
                    <Button onClick={handleAddQuote} size="sm" variant="outline" className="text-amber-400 border-amber-900/30 hover:bg-amber-900/20">
                        <Plus className="w-4 h-4 mr-1" /> Add Quote
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.quotes.map((quote, idx) => (
                        <div key={idx} className="flex gap-2">
                            <Input
                                className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                value={quote || ""}
                                onChange={(e) => updateQuote(idx, e.target.value)}
                            />
                            <Button
                                variant="outline"
                                onClick={() => removeQuote(idx)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border-transparent px-3"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="bg-neutral-800 border-amber-900/30">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-amber-100">Packages</CardTitle>
                    {!isAddingPackage && (
                        <Button
                            onClick={() => {
                                setEditingIndex(null);
                                setPkgForm({
                                    title: "", price: "", duration: "", description: "", features: [], link: "", imageUrl: ""
                                });
                                setIsAddingPackage(true);
                            }}
                            size="sm"
                            variant="outline"
                            className="text-amber-400 border-amber-900/30 hover:bg-amber-900/20"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Package
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {isAddingPackage ? (
                        <div className="space-y-4 border border-amber-900/30 p-4 rounded-lg bg-neutral-900/30">
                            {/* ... inputs ... */}
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Title"
                                    className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                    value={pkgForm.title || ""}
                                    onChange={e => setPkgForm({ ...pkgForm, title: e.target.value })}
                                />
                                <Input
                                    placeholder="Price"
                                    className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                    value={pkgForm.price || ""}
                                    onChange={e => setPkgForm({ ...pkgForm, price: e.target.value })}
                                />
                                <Input
                                    placeholder="Duration"
                                    className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                    value={pkgForm.duration || ""}
                                    onChange={e => setPkgForm({ ...pkgForm, duration: e.target.value })}
                                />
                                <Input
                                    placeholder="Image URL (Optional)"
                                    className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                    value={pkgForm.imageUrl || ""}
                                    onChange={e => setPkgForm({ ...pkgForm, imageUrl: e.target.value })}
                                />
                            </div>
                            <textarea
                                placeholder="Description"
                                className="w-full bg-neutral-900/50 border border-amber-900/30 text-amber-100 rounded-md p-3"
                                value={pkgForm.description || ""}
                                onChange={e => setPkgForm({ ...pkgForm, description: e.target.value })}
                            />
                            <Input
                                placeholder="Features (comma separated)"
                                className="bg-neutral-900/50 border-amber-900/30 text-amber-100"
                                value={pkgForm.features?.join(", ") || ""}
                                onChange={e => setPkgForm({ ...pkgForm, features: e.target.value.split(",").map(s => s.trim()) })}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddingPackage(false)}>Cancel</Button>
                                <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSavePackage}>
                                    {editingIndex !== null ? "Update Package" : "Add Package"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.packages.length === 0 && <p className="text-amber-200/40 text-center py-4">No packages added.</p>}
                            {data.packages.map((pkg, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-neutral-900/30 p-4 rounded-lg border border-amber-900/20">
                                    <div>
                                        <h4 className="font-bold text-amber-100">{pkg.title} <span className="text-sm font-normal text-amber-200/60">({pkg.duration})</span></h4>
                                        <p className="text-amber-200/40 text-sm">{pkg.price}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => startEditPackage(pkg, idx)}>Edit</Button>
                                        <Button variant="outline" size="sm" className="text-red-400" onClick={() => deletePackage(idx)}>Delete</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button
                    className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-6"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
}
