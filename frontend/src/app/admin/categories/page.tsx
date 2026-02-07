"use client";

import { useEffect, useState } from "react";
import { getCategories, createCategory, deleteCategory, Category } from "@/lib/api";
import { Loader2, Plus, Trash2, Tag, Search } from "lucide-react";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategorySlug, setNewCategorySlug] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            setError("Failed to fetch categories");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName || !newCategorySlug) return;

        setSubmitting(true);
        try {
            await createCategory({
                name: newCategoryName,
                slug: newCategorySlug
            });
            setNewCategoryName("");
            setNewCategorySlug("");
            setIsCreating(false);
            fetchCategories();
        } catch (err) {
            alert("Failed to create category");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            await deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
        } catch (err: any) {
            alert(err.message || "Failed to delete category (it may contain products)");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage product categories</p>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-in slide-in-from-top-4 fade-in duration-200">
                    <h3 className="font-bold text-lg mb-4">New Category</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => {
                                        setNewCategoryName(e.target.value);
                                        // Auto-slug
                                        if (!newCategorySlug) {
                                            setNewCategorySlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder="e.g. Electronics"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={newCategorySlug}
                                    onChange={(e) => setNewCategorySlug(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder="e.g. electronics"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-black text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Creating...' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <div key={category.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Tag size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{category.name}</h3>
                                    <p className="text-xs text-gray-500 font-mono">/{category.slug}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleDelete(category.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                title="Delete Category"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">ID: {category.id.slice(0, 8)}...</span>
                        </div>
                    </div>
                ))}

                {categories.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                        <Tag size={32} className="mx-auto mb-3 opacity-20" />
                        <p>No categories found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
