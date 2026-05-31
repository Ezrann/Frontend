"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Edit2,
  Save,
  X,
  LogOut,
  Camera,
  Upload,
  ShieldCheck,
  ArrowRight,
  Package,
  PlusCircle,
  ExternalLink,
  Clock,
  Tag,
  DollarSign,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface UserData {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
}

interface ProductImage {
  id?: number;
  path?: string;
  url?: string;
  is_cover?: number;
}

interface ProfileProduct {
  id: number;
  category_id?: number;
  title: string;
  description?: string;
  price: string | number;
  product_condition: string;
  status: string;
  category_name?: string;
  created_at?: string;
  images?: ProductImage[];
}

interface Category {
  id: number;
  name: string;
}

const getAvatarSrc = (avatar?: string | null) => {
  if (!avatar) {
    return null;
  }

  if (
    avatar.startsWith("http://") ||
    avatar.startsWith("https://") ||
    avatar.startsWith("data:") ||
    avatar.startsWith("blob:")
  ) {
    return avatar;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  return `${apiUrl}${avatar.startsWith("/") ? avatar : `/${avatar}`}`;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getProductImageSrc = (product: ProfileProduct) => {
  const image = product.images?.[0];

  if (!image) {
    return "/images/hero.png";
  }

  if (image.url) {
    return image.url;
  }

  if (image.path) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    return `${apiUrl}/${image.path.replace(/^\/+/, "")}`;
  }

  return "/images/hero.png";
};

const getStatusLabel = (status: string) => {
  if (status === "active") return "Approved";
  if (status === "removed") return "Rejected";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusClassName = (status: string) => {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "pending") return "bg-amber-100 text-amber-700";
  if (status === "sold") return "bg-blue-100 text-blue-700";
  if (status === "removed") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
};

const formatProductPrice = (price: string | number) => {
  const priceNumber = typeof price === "string" ? parseFloat(price) : price;

  if (!Number.isFinite(priceNumber)) {
    return String(price);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: Number.isInteger(priceNumber) ? 0 : 2,
  }).format(priceNumber);
};

const formatProductDate = (dateValue?: string) => {
  if (!dateValue) return "Just now";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<ProfileProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editProductForm, setEditProductForm] = useState({
    title: "",
    description: "",
    price: "",
    product_condition: "used",
    category_id: "",
  });
  const [savingProductId, setSavingProductId] = useState<number | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [originalValues, setOriginalValues] = useState<{
    name: string;
    phone: string;
    avatar: string | null;
  } | null>(null);

  // Helper function to safely parse JSON response
  const safeJsonParse = async (response: Response) => {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch (e) {
        console.error("JSON parse error:", e);
        return null;
      }
    }
    return null;
  };

  // Fetch user profile
  useEffect(() => {
    const fetchMyProducts = async () => {
      setProductsLoading(true);
      setProductsError("");

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/me`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorData = await safeJsonParse(res);
          setProductsError(
            errorData?.message ||
              `Could not load your products (${res.status}).`
          );
          return;
        }

        const data = await safeJsonParse(res);
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("My products fetch error:", error);
        setProductsError("Could not load your products.");
      } finally {
        setProductsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);

        if (!res.ok) {
          setCategories([]);
          return;
        }

        const data = await safeJsonParse(res);
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Categories fetch error:", error);
        setCategories([]);
      }
    };

    const fetchProfile = async () => {
      try {
        // Try primary endpoint first
        let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }

        // If primary endpoint fails, try alternative
        if (!res.ok) {
          res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (res.status === 401) {
            router.push("/auth/login");
            return;
          }
        }

        if (res.ok) {
          const data = await safeJsonParse(res);
          if (data) {
            setUser(data);
            setName(data.name || "");
            setEmail(data.email || "");
            setPhone(data.phone || "");
            // Set avatar preview if exists
            if (data.avatar) {
              setAvatarPreview(getAvatarSrc(data.avatar));
            } else {
              setAvatarPreview(null);
            }
            // Store original values for comparison when editing
            setOriginalValues({
              name: data.name || "",
              phone: data.phone || "",
              avatar: data.avatar || null,
            });
            fetchMyProducts();
          } else {
            setError("Invalid response format from server");
          }
        } else {
          const errorData = await safeJsonParse(res);
          const errorMessage =
            errorData?.message ||
            errorData?.error ||
            `Server error (${res.status}). Please try again later.`;
          setError(errorMessage);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load profile. Please check your connection."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchProfile();
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    // Validate name
    if (!name || name.trim().length === 0) {
      setIsSubmitting(false);
      return setError("Name is required");
    }

    // Check if there are any actual changes
    if (originalValues) {
      const hasNameChange = name.trim() !== (originalValues.name || "").trim();
      const originalPhone = (originalValues.phone || "").trim();
      const currentPhone = (phone || "").trim();
      const hasPhoneChange = currentPhone !== originalPhone;
      const hasAvatarChange = avatarFile !== null;

      const hasChanges = hasNameChange || hasPhoneChange || hasAvatarChange;

      if (!hasChanges) {
        setIsSubmitting(false);
        setError("No changes detected. Please make changes before saving.");
        setTimeout(() => setError(""), 3000);
        return;
      }
    }

    try {
      // Use FormData if we have an image, otherwise use JSON
      const hasImage = avatarFile !== null;
      
      let res: Response;
      
      if (hasImage) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("phone", phone.trim() || "");
        if (avatarFile) {
          formData.append("avatar", avatarFile);
        }

        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          method: "PUT",
          credentials: "include",
          body: formData,
        });
      } else {
        // Use JSON for regular updates
        const updateData: { name: string; phone: string; password?: string } = {
          name: name.trim(),
          phone: phone.trim() || "",
        };

        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });
      }

      if (res.ok) {
        const data = await safeJsonParse(res);
        if (data) {
          setUser(data);
          // Update form fields from response
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          // Update avatar preview
          if (data.avatar) {
            setAvatarPreview(getAvatarSrc(data.avatar));
          }
          // Clear file input
          setAvatarFile(null);
          // Update original values to new values
          setOriginalValues({
            name: data.name || "",
            phone: data.phone || "",
            avatar: data.avatar || null,
          });
          setMessage("Profile updated successfully!");
          setEditing(false);
          setIsSubmitting(false);
          // Auto-hide success message after 3 seconds
          setTimeout(() => setMessage(""), 3000);
        } else {
          // If response is not JSON but status is OK, assume success
          setMessage("Profile updated successfully!");
          setEditing(false);
          setAvatarFile(null);
          setIsSubmitting(false);
          setTimeout(() => setMessage(""), 3000);
        }
      } else {
        // Handle error response
        const errorData = await safeJsonParse(res);
        const errorMessage =
          errorData?.message ||
          errorData?.error ||
          `Failed to update profile (${res.status}). Please try again.`;
        setError(errorMessage);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      if (error instanceof SyntaxError) {
        setError(
          "Server returned an invalid response. Please check if the server is running correctly."
        );
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again."
        );
      }
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.dispatchEvent(new Event("authChange"));
    router.push("/auth/login");
  };

  const startEditingProduct = (product: ProfileProduct) => {
    setEditingProductId(product.id);
    setEditProductForm({
      title: product.title || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      product_condition: product.product_condition || "used",
      category_id: product.category_id ? String(product.category_id) : "",
    });
    setProductsError("");
  };

  const cancelEditingProduct = () => {
    setEditingProductId(null);
    setEditProductForm({
      title: "",
      description: "",
      price: "",
      product_condition: "used",
      category_id: "",
    });
  };

  const handleSaveProduct = async (productId: number) => {
    setProductsError("");

    if (!editProductForm.title.trim()) {
      setProductsError("Product title is required.");
      return;
    }

    if (!editProductForm.price || Number(editProductForm.price) <= 0) {
      setProductsError("Valid product price is required.");
      return;
    }

    if (!editProductForm.category_id) {
      setProductsError("Please select a category.");
      return;
    }

    setSavingProductId(productId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editProductForm.title.trim(),
            description: editProductForm.description.trim(),
            price: editProductForm.price,
            product_condition: editProductForm.product_condition,
            category_id: editProductForm.category_id,
          }),
        }
      );

      const data = await safeJsonParse(res);

      if (!res.ok) {
        setProductsError(data?.message || "Failed to update product.");
        return;
      }

      const category = categories.find(
        (item) => String(item.id) === editProductForm.category_id
      );

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? {
                ...product,
                ...data,
                category_name: category?.name || product.category_name,
                images: product.images,
              }
            : product
        )
      );
      cancelEditingProduct();
      setMessage("Product updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Product update error:", error);
      setProductsError("Failed to update product. Please try again.");
    } finally {
      setSavingProductId(null);
    }
  };

  const handleRemoveProduct = async (product: ProfileProduct) => {
    const confirmed = window.confirm(
      `Remove "${product.title}" from your listed products?`
    );

    if (!confirmed) {
      return;
    }

    setProductsError("");
    setDeletingProductId(product.id);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${product.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: "Removed by product owner" }),
        }
      );

      const data = await safeJsonParse(res);

      if (!res.ok) {
        setProductsError(data?.message || "Failed to remove product.");
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.filter((item) => item.id !== product.id)
      );
      if (editingProductId === product.id) {
        cancelEditingProduct();
      }
      setMessage("Product removed successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Product remove error:", error);
      setProductsError("Failed to remove product. Please try again.");
    } finally {
      setDeletingProductId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Profile Avatar */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full -mr-32 -mt-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                {avatarPreview || user?.avatar ? (
                  <img
                    src={avatarPreview || getAvatarSrc(user?.avatar) || ""}
                    alt={user?.name || "Profile"}
                    className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-32 h-32 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg ${
                    avatarPreview || user?.avatar ? "hidden" : ""
                  }`}
                >
                  {user?.name ? getInitials(user.name) : "U"}
                </div>
                {editing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Upload profile picture"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {user?.name || "User"}
                </h1>
                <p className="text-gray-600 mb-1 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email || "No email"}
                </p>
                {user?.phone && (
                  <p className="text-gray-600 mb-1 flex items-center justify-center md:justify-start gap-2">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </p>
                )}
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  {user?.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : "User"}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {!editing ? (
                  <button
                    onClick={() => {
                      // Store original values when entering edit mode
                      setOriginalValues({
                        name: user?.name || "",
                        phone: user?.phone || "",
                        avatar: user?.avatar || null,
                      });
                      setEditing(true);
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
                  >
                    <Edit2 className="w-5 h-5" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="profile-form"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 shadow-md animate-fade-in">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="font-medium">{message}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center gap-3 shadow-md animate-fade-in">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!editing ? (
            /* View Mode */
            <div className="space-y-8">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  Personal Information
                </h2>
                <p className="text-gray-500 mt-1">
                  Your account details and preferences
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Full Name
                  </label>
                  <div className="bg-linear-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <p className="text-gray-800 font-medium">
                      {user?.name || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <div className="bg-linear-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <p className="text-gray-800 font-medium">
                      {user?.email || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <div className="bg-linear-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <p className="text-gray-800 font-medium">
                      {user?.phone || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Account Role
                  </label>
                  <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-blue-800 font-medium capitalize">
                      {user?.role || "user"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form
              id="profile-form"
              onSubmit={handleUpdateProfile}
              className="space-y-8"
            >
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Edit2 className="w-6 h-6 text-blue-600" />
                  Edit Profile
                </h2>
                <p className="text-gray-500 mt-1">
                  Update your personal information
                </p>
              </div>

              <div className="space-y-6">
                {/* Profile Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                        />
                      ) : user?.avatar ? (
                        <img
                          src={getAvatarSrc(user.avatar) || ""}
                          alt="Current"
                          className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-200">
                          {user?.name ? getInitials(user.name) : "U"}
                        </div>
                      )}
                    </div>
                    <label className="flex-1">
                      <div className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors cursor-pointer text-center">
                        <Upload className="w-5 h-5 mx-auto mb-2 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {avatarFile ? avatarFile.name : "Click to upload image"}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Recommended: Square image, max 5MB (JPG, PNG, GIF, WebP)
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Email cannot be changed"
                  />
                  <p className="text-xs text-gray-500">
                    Email address cannot be changed for security reasons
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Account Role
                  </label>
                  <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                    <p className="text-blue-800 font-medium capitalize">
                      {user?.role || "user"}
                    </p>
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Security settings
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Update your password on a separate page for a cleaner view.
                        </p>
                      </div>
                      <Link
                        href="/profile/security"
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                    setMessage("");
                    if (user) {
                      setName(user.name || "");
                      setEmail(user.email || "");
                      setPhone(user.phone || "");
                      if (user.avatar) {
                        setAvatarPreview(getAvatarSrc(user.avatar));
                      } else {
                        setAvatarPreview(null);
                      }
                      // Reset original values
                      setOriginalValues({
                        name: user.name || "",
                        phone: user.phone || "",
                        avatar: user.avatar || null,
                      });
                    }
                    setAvatarFile(null);
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-all font-semibold flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* My Products */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                My Products
              </h2>
              <p className="text-gray-500 mt-1">
                Products you posted and their approval status
              </p>
            </div>
            <Link
              href="/products/add"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4" />
              Post Product
            </Link>
          </div>

          {productsError && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="h-4 w-4" />
              {productsError}
            </div>
          )}

          {productsLoading ? (
            <div className="py-10 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
              <p className="mt-4 text-sm font-medium text-gray-500">
                Loading your products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Package className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No products posted yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                When you post a product, it will be stored here on your profile.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-gray-100">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="py-5"
                >
                  {editingProductId === product.id ? (
                    <div className="grid gap-4 lg:grid-cols-[8rem,1fr]">
                      <img
                        src={getProductImageSrc(product)}
                        alt={product.title}
                        className="h-28 w-full rounded-xl object-cover lg:h-24 lg:w-32"
                        onError={(e) => {
                          e.currentTarget.src = "/images/hero.png";
                        }}
                      />
                      <form
                        className="space-y-4"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveProduct(product.id);
                        }}
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-gray-500">
                              Title
                            </label>
                            <input
                              type="text"
                              value={editProductForm.title}
                              onChange={(e) =>
                                setEditProductForm((current) => ({
                                  ...current,
                                  title: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-gray-500">
                              Price
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editProductForm.price}
                              onChange={(e) =>
                                setEditProductForm((current) => ({
                                  ...current,
                                  price: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-gray-500">
                              Condition
                            </label>
                            <select
                              value={editProductForm.product_condition}
                              onChange={(e) =>
                                setEditProductForm((current) => ({
                                  ...current,
                                  product_condition: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="new">New</option>
                              <option value="used">Used</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase text-gray-500">
                              Category
                            </label>
                            <select
                              value={editProductForm.category_id}
                              onChange={(e) =>
                                setEditProductForm((current) => ({
                                  ...current,
                                  category_id: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="">Select a category</option>
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase text-gray-500">
                            Description
                          </label>
                          <textarea
                            value={editProductForm.description}
                            onChange={(e) =>
                              setEditProductForm((current) => ({
                                ...current,
                                description: e.target.value,
                              }))
                            }
                            rows={3}
                            className="w-full resize-none rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={cancelEditingProduct}
                            disabled={savingProductId === product.id}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-300 disabled:opacity-60"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingProductId === product.id}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
                          >
                            {savingProductId === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            Save Product
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <img
                        src={getProductImageSrc(product)}
                        alt={product.title}
                        className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-32"
                        onError={(e) => {
                          e.currentTarget.src = "/images/hero.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClassName(
                              product.status
                            )}`}
                          >
                            {getStatusLabel(product.status)}
                          </span>
                          {product.category_name && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              <Tag className="h-3.5 w-3.5" />
                              {product.category_name}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 truncate text-lg font-bold text-gray-900">
                          {product.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            {formatProductPrice(product.price)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 capitalize">
                            <Tag className="h-4 w-4 text-blue-600" />
                            {product.product_condition.replace(/_/g, " ")}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-slate-400" />
                            {formatProductDate(product.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:w-32">
                        <Link
                          href={`/products/${product.id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          View
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => startEditingProduct(product)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(product)}
                          disabled={deletingProductId === product.id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          {deletingProductId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
