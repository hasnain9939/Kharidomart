"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Add,
  ShieldCheck,
  CheckCircle,
  CloseCircle,
  Box,
  Eye,
  Edit,
  Trash,
  Refresh,
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

  // 1-Click Shopify Import states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoadingShopify, setIsLoadingShopify] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [shopifyProducts, setShopifyProducts] = useState<any[]>([]);
  const [selectedShopifyIds, setSelectedShopifyIds] = useState<number[]>([]);
  const [shopifyError, setShopifyError] = useState<string | null>(null);
  const [shopifyScopeNeeded, setShopifyScopeNeeded] = useState(false);

  const openShopifyImportModal = async () => {
    setIsImportModalOpen(true);
    setIsLoadingShopify(true);
    setShopifyError(null);
    setShopifyScopeNeeded(false);
    try {
      const res = await fetch("/api/shopify/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setShopifyProducts(data.products);
        // Pre-select products that are not yet imported
        const unimported = data.products.filter((p: any) => !p.isAlreadyImported).map((p: any) => p.id);
        setSelectedShopifyIds(unimported);
      } else {
        if (data.scopeNeeded) {
          setShopifyScopeNeeded(true);
        }
        setShopifyError(data.error || "Could not load products from Shopify");
      }
    } catch (err: any) {
      setShopifyError("Failed to reach server: " + err.message);
    } finally {
      setIsLoadingShopify(false);
    }
  };

  const handleToggleSelectShopify = (id: number) => {
    setSelectedShopifyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllShopify = () => {
    if (selectedShopifyIds.length === shopifyProducts.length) {
      setSelectedShopifyIds([]);
    } else {
      setSelectedShopifyIds(shopifyProducts.map((p) => p.id));
    }
  };

  const handleImportFromShopify = async () => {
    if (selectedShopifyIds.length === 0) {
      alert("Please select at least one product to import.");
      return;
    }
    setIsImporting(true);
    try {
      const res = await fetch("/api/shopify/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedShopifyIds }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`🎉 ${data.message || "Products imported successfully!"}`);
        setIsImportModalOpen(false);
        await fetchProducts();
        await refreshProducts();
      } else {
        alert(data.error || "Failed to import products from Shopify");
      }
    } catch (err: any) {
      alert("Error importing from Shopify: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

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
            Active product catalog published to your storefront and synchronized to Shopify Warehouse.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/shop"
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#f8fafc] text-[#565e74] border border-[#e2e8f0] text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Eye size={15} weight="Outline" />
            <span>View Storefront</span>
          </Link>
          <button
            type="button"
            onClick={openShopifyImportModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1c30] hover:bg-[#1a2d45] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Box size={16} weight="Outline" className="text-emerald-400" />
            <span>1-Click Import from Shopify</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
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

      {/* 1-Click Shopify Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#e2e8f0] flex flex-col gap-5 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Box size={22} weight="Filled" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0b1c30] flex items-center gap-2">
                    <span>1-Click Import from Shopify</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      cgxx12-ek
                    </span>
                  </h3>
                  <p className="text-xs text-[#565e74] mt-0.5">
                    Sync items from your connected Shopify warehouse catalog directly into Kharido Mart.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#0b1c30] hover:bg-slate-100 transition-colors"
              >
                <CloseCircle size={20} weight="Outline" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto min-h-[220px]">
              {isLoadingShopify ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold text-[#565e74]">
                    Connecting to Shopify Admin API &amp; fetching products...
                  </span>
                </div>
              ) : shopifyScopeNeeded ? (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                    <ShieldCheck size={22} weight="Filled" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      Product Catalog Authorization Required
                    </h4>
                    <p className="text-xs text-amber-700 mt-1 max-w-md">
                      Your app needs permission to read products from Shopify. Click below to approve and return here.
                    </p>
                  </div>
                  <Link
                    href="/api/shopify/install"
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-[#0b1c30] text-white text-xs font-bold hover:bg-[#1a2d45] transition-all"
                  >
                    Authorize Product Sync ↗
                  </Link>
                </div>
              ) : shopifyError ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex flex-col gap-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <CloseCircle size={15} weight="Filled" />
                    <span>Failed to load products:</span>
                  </div>
                  <p>{shopifyError}</p>
                  <button
                    type="button"
                    onClick={openShopifyImportModal}
                    className="self-start px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : shopifyProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                    <Box size={24} weight="Outline" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0b1c30]">
                      No Products Found in Shopify
                    </h4>
                    <p className="text-xs text-[#565e74] mt-1 max-w-sm">
                      Your Shopify store (<code className="font-mono text-emerald-700">cgxx12-ek.myshopify.com</code>) currently has no products listed. Add products in Shopify first or add them directly in Kharido Mart.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href="https://admin.shopify.com/store/cgxx12-ek/products/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#0b1c30] text-white text-xs font-bold hover:bg-[#1a2d45] transition-all"
                    >
                      Add in Shopify ↗
                    </a>
                    <button
                      type="button"
                      onClick={openShopifyImportModal}
                      className="px-3.5 py-2 rounded-xl bg-white border border-[#e2e8f0] text-xs font-bold text-[#0b1c30] hover:bg-slate-50 transition-all flex items-center gap-1"
                    >
                      <Refresh size={14} weight="Outline" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Select All Row */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs text-[#565e74]">
                    <span>
                      Found <strong>{shopifyProducts.length}</strong> products in Shopify
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllShopify}
                      className="font-bold text-[#f97316] hover:underline cursor-pointer"
                    >
                      {selectedShopifyIds.length === shopifyProducts.length
                        ? "Deselect All"
                        : "Select All Unimported"}
                    </button>
                  </div>

                  {/* List of Products */}
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {shopifyProducts.map((p) => {
                      const isSelected = selectedShopifyIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleSelectShopify(p.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50/40"
                              : "border-[#e2e8f0] hover:border-slate-300 bg-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                          />
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-[#e2e8f0]">
                            <Image
                              src={p.imageUrl}
                              alt={p.title}
                              width={48}
                              height={48}
                              unoptimized
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#0b1c30] truncate">
                              {p.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-[#565e74] mt-0.5">
                              <span className="font-mono text-emerald-800 font-bold">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                              <span>•</span>
                              <span>Stock: {p.stock}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {p.sku}
                              </span>
                            </div>
                          </div>
                          {p.isAlreadyImported && (
                            <span className="text-[10px] font-bold text-[#15803d] bg-emerald-100/80 px-2 py-0.5 rounded-md shrink-0">
                              Synced
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9]">
              <span className="text-xs text-[#565e74]">
                {selectedShopifyIds.length} item{selectedShopifyIds.length === 1 ? "" : "s"} selected
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#565e74] hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedShopifyIds.length === 0 || isImporting}
                  onClick={handleImportFromShopify}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isImporting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <span>Import Selected ({selectedShopifyIds.length})</span>
                  )}
                </button>
              </div>
            </div>
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
