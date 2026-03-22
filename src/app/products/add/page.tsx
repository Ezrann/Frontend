"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Package,
  DollarSign,
  FileText,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  Shield,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
}

export default function PostProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [productCondition, setProductCondition] = useState("new");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Contact details
  const [contactName, setContactName] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);

  // Laptop-specific fields
  const [vga, setVga] = useState("");
  const [cpu, setCpu] = useState("");
  const [storage, setStorage] = useState("");
  const [ram, setRam] = useState("");
  const [screenSize, setScreenSize] = useState("");

  // Check authentication, fetch categories, and prefill contact info from user account
  useEffect(() => {
    const checkAuthAndFetchCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login?redirect=/products/add");
        return;
      }

      try {
        // Fetch categories
        const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data);
        }

        // Fetch current user profile to prefill contact info
        let profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (profileRes.status === 401) {
          // Token no longer valid; redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/auth/login?redirect=/products/add");
          return;
        }

        // Fallback to auth endpoint if needed
        if (!profileRes.ok) {
          profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        }

        if (profileRes.ok) {
          const contentType = profileRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const userData = await profileRes.json();
            if (userData) {
              if (!contactName) {
                setContactName(userData.name || "");
              }
              const phoneFromProfile = (userData.phone || "").trim();
              if (phoneFromProfile) {
                setPhoneNumbers([phoneFromProfile]);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize post product page:", error);
      }
    };

    checkAuthAndFetchCategories();
  }, [router]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const newFiles = [...images, ...files].slice(0, 5);
    setImages(newFiles);

    // Create previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    // Validation
    if (!title.trim()) {
      setError("Product title is required");
      setLoading(false);
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setError("Valid price is required");
      setLoading(false);
      return;
    }
    if (!categoryId) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    if (!contactName.trim()) {
      setError("Contact name is required");
      setLoading(false);
      return;
    }

    const cleanedPhones = phoneNumbers
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (cleanedPhones.length === 0) {
      setError("Please provide at least one phone number");
      setLoading(false);
      return;
    }

    const selectedCategory = categories.find(
      (c) => c.id.toString() === categoryId
    );
    const categoryName = selectedCategory?.name?.toLowerCase() || "";
    const isComputerCategory =
      categoryName.includes("computer") || categoryName.includes("laptop");

    if (isComputerCategory) {
      if (
        !vga.trim() ||
        !cpu.trim() ||
        !storage.trim() ||
        !ram.trim() ||
        !screenSize.trim()
      ) {
        setError(
          "Please fill in all laptop specifications: VGA, CPU, Storage, RAM, and Screen size."
        );
        setLoading(false);
        return;
      }
    }
    if (images.length === 0) {
      setError("Please upload at least one image");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("price", price);
      formData.append("product_condition", productCondition);
      formData.append("category_id", categoryId);
      formData.append("contact_name", contactName.trim());
      formData.append("contact_phones", JSON.stringify(cleanedPhones));

      // Append computer/laptop-specific fields when applicable
      if (isComputerCategory) {
        formData.append("vga", vga.trim());
        formData.append("cpu", cpu.trim());
        formData.append("storage", storage.trim());
        formData.append("ram", ram.trim());
        formData.append("screen_size", screenSize.trim());
      }

      // Append images - use 'images' field name for multer.array('images')
      images.forEach((image) => {
        formData.append("images", image);
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      let data: any = null;

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        setError(`Failed to create product: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errorMessage =
          data?.message ||
          data?.error ||
          `Failed to create product (${res.status})`;
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Success - Show notification about admin approval
      setMessage("pending_approval");
      setLoading(false);

      // Redirect to homepage after showing notification for 5 seconds
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Create product error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create product. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <Package className="w-10 h-10 text-blue-600" />
            Post Your Product
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to list your product for sale
          </p>

          {/* Info Banner about Approval Process */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">
                Admin Approval Required
              </p>
              <p>
                All products are reviewed by our admin team before being
                published. Your product will be visible to buyers once it's
                approved.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message === "pending_approval" && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg mb-6 shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Product Submitted Successfully!
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Your product has been submitted and is now{" "}
                    <strong>waiting for admin approval</strong>.
                  </p>
                  <div className="bg-white/70 rounded-lg p-4 mb-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-1">What happens next?</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>An admin will review your product listing</li>
                          <li>
                            Once approved, your product will be visible to all
                            users
                          </li>
                          <li>
                            You'll be able to see your product status in your
                            profile
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/products"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Browse Products
                    </Link>
                    <Link
                      href="/profile"
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                      Go to Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {message && message !== "pending_approval" && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 shadow-md animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            <p className="font-medium">{message}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 shadow-md animate-fade-in">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="space-y-6">
            {/* Product Title */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Product Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., iPhone 14 Pro 128GB"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product in detail..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none resize-none"
              />
            </div>

            {/* Price and Condition */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" />
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4" />
                  Condition *
                </label>
                <select
                  value={productCondition}
                  onChange={(e) => setProductCondition(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Package className="w-4 h-4" />
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Information */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/60">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Phone Numbers *
                  </label>
                  <div className="space-y-2">
                    {phoneNumbers.map((phone, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            const next = [...phoneNumbers];
                            next[index] = e.target.value;
                            setPhoneNumbers(next);
                          }}
                          placeholder="e.g., 012 345 678"
                          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                        />
                        {phoneNumbers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = phoneNumbers.filter(
                                (_, i) => i !== index
                              );
                              setPhoneNumbers(next.length > 0 ? next : [""]);
                            }}
                            className="px-3 py-2 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPhoneNumbers([...phoneNumbers, ""])}
                      className="mt-1 inline-flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium"
                    >
                      Add another phone
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Computer Specifications (shown when category is Computer/Laptop) */}
            {(() => {
              const selectedCategory = categories.find(
                (c) => c.id.toString() === categoryId
              );
              const categoryName = selectedCategory?.name?.toLowerCase() || "";
              const isComputerCategory =
                categoryName.includes("computer") ||
                categoryName.includes("laptop");

              if (!isComputerCategory) return null;

              return (
                <div className="border border-blue-100 rounded-2xl p-6 bg-blue-50/40">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Computer Specifications
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        VGA / Graphics *
                      </label>
                      <input
                        type="text"
                        value={vga}
                        onChange={(e) => setVga(e.target.value)}
                        placeholder="e.g., NVIDIA GTX 1650"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        CPU *
                      </label>
                      <input
                        type="text"
                        value={cpu}
                        onChange={(e) => setCpu(e.target.value)}
                        placeholder="e.g., Intel Core i7-12700H"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        Storage *
                      </label>
                      <input
                        type="text"
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                        placeholder="e.g., 512GB SSD"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        RAM *
                      </label>
                      <input
                        type="text"
                        value={ram}
                        onChange={(e) => setRam(e.target.value)}
                        placeholder="e.g., 16GB DDR4"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        Screen Size *
                      </label>
                      <input
                        type="text"
                        value={screenSize}
                        onChange={(e) => setScreenSize(e.target.value)}
                        placeholder='e.g., 15.6" Full HD'
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Image Upload */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4" />
                Product Images * (Max 5 images)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-600 font-medium">
                    Click to upload images
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4 border-t">
              <Link
                href="/products"
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-all font-semibold flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Post Product
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
