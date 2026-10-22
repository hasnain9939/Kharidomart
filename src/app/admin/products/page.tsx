"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Filter,
  Add,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  CloseCircle,
  Box,
  TicketDiscount,
  Eye,
  Edit,
  Trash,
  Sparkles,
  Copy,
} from "reicon-react";
import { Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";

export default function AdminProductsPage() {
  const { refreshProducts } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const { id, title } = productToDelete;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        await refreshProducts();
        setToastMessage(`Product "${title}" removed from database.`);
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (err: any) {
      alert("Error deleting product: " + err.message);
    } finally {
      setDeletingId(null);
      setProductToDelete(null);
    }
  };

  const filteredItems = products.filter((item) => {
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      return matchTitle || matchCat;
    }
    return true;
  });

  const categories = [
    "All",
    "Mom & Baby",
    "Toys & Games",
    "Home & Kitchen",
    "Smart Gadgets",
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto min-w-0 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-[#f97316] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={16} weight="Filled" className="text-[#15803d]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#565e74] mb-1">
            <span className="font-semibold">Store Management</span>
            <span>/</span>
            <span className="font-bold text-[#0b1c30]">Product Catalog</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            Products ({products.length})
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5">
            Real products stored in your local Prisma SQLite database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/shop"
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#f8fafc] text-[#565e74] border border-[#e2e8f0] text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Eye size={15} weight="Outline" />
            <span>View Storefront</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.35)] transition-all"
          >
            <Add size={16} weight="Outline" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            weight="Outline"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#565e74]"
          />
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f8fafc] text-xs font-medium text-[#0b1c30] placeholder:text-[#565e74] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#f8fafc] text-[#0b1c30] text-xs font-semibold border border-[#e2e8f0] focus:outline-none focus:border-[#f97316] cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-xs text-[#565e74]">
          Loading products from database...
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ea580c]">
            <Box size={32} weight="Filled" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0b1c30]">Your Product Catalog is Empty</h3>
            <p className="text-xs text-[#565e74] max-w-md mx-auto mt-1">
              No products found in your database. Click the button below to add your first product with images, pricing, and description!
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-md transition-all"
          >
            <Add size={16} weight="Outline" />
            <span>Add Your First Product</span>
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-10 text-center text-xs text-[#565e74]">
          No products match your search or filter.
        </div>
      ) : (
        /* Products Table */
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#f8fafc] text-[#565e74] font-bold uppercase tracking-wider text-[11px] border-b border-[#e2e8f0]">
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price / MRP</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-[#f1f5f9] overflow-hidden shrink-0 border border-[#e2e8f0]">
                          <Image
                            src={item.images?.[0] || "/assets/stitch/hero_showcase.jpg"}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col max-w-[280px]">
                          <span className="font-bold text-[#0b1c30] line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[#565e74] text-[11px] font-mono">
                            /{item.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#0b1c30]">{item.category}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm text-[#0b1c30]">
                          ₹{item.price}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-[11px] text-[#565e74] line-through">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#0b1c30]">
                        {item.stock} in stock
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#15803d] border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span>
                        Live on Store
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg bg-white hover:bg-slate-100 text-[#565e74] border border-[#e2e8f0] transition-colors"
                          title="View Live Page"
                        >
                          <Eye size={14} weight="Outline" />
                        </Link>
                        <Link
                          href={`/admin/products/new?edit=${item.id}`}
                          className="p-2 rounded-lg bg-white hover:bg-orange-50 text-[#ea580c] border border-orange-200 transition-colors"
                          title="Edit Product"
                        >
                          <Edit size={14} weight="Outline" />
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => setProductToDelete({ id: item.id, title: item.title })}
                          className="p-2 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash size={14} weight="Outline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash size={24} weight="Filled" />
            </div>
            <h3 className="text-base font-bold text-[#0b1c30]">
              Delete Product?
            </h3>
            <p className="text-xs text-[#565e74] mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#0b1c30]">&ldquo;{productToDelete.title}&rdquo;</strong>? This will permanently remove it from your live storefront and product database.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#565e74] hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === productToDelete.id}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 disabled:opacity-50 transition-colors"
              >
                {deletingId === productToDelete.id ? "Deleting..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
