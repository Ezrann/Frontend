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
  Lock,
  Eye,
  EyeOff,
  Camera,
  Upload,
} from "lucide-react";

interface UserData {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        // Try primary endpoint first
        let res = await fetch("http://localhost:5001/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/auth/login");
          return;
        }

        // If primary endpoint fails, try alternative
        if (!res.ok) {
          res = await fetch("http://localhost:5001/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
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
              setAvatarPreview(`http://localhost:5001${data.avatar}`);
            } else {
              setAvatarPreview(null);
            }
            // Store original values for comparison when editing
            setOriginalValues({
              name: data.name || "",
              phone: data.phone || "",
              avatar: data.avatar || null,
            });
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

    // Validate password if provided
    if (password) {
      if (password.length < 6) {
        setIsSubmitting(false);
        return setError("Password must be at least 6 characters");
      }
      if (password !== confirmPassword) {
        setIsSubmitting(false);
        return setError("Passwords do not match");
      }
    }

    // Check if there are any actual changes
    if (originalValues) {
      const hasNameChange = name.trim() !== (originalValues.name || "").trim();
      const originalPhone = (originalValues.phone || "").trim();
      const currentPhone = (phone || "").trim();
      const hasPhoneChange = currentPhone !== originalPhone;
      const hasAvatarChange = avatarFile !== null;
      const hasPasswordChange = password && password.trim().length > 0;

      const hasChanges = hasNameChange || hasPhoneChange || hasAvatarChange || hasPasswordChange;

      if (!hasChanges) {
        setIsSubmitting(false);
        setError("No changes detected. Please make changes before saving.");
        setTimeout(() => setError(""), 3000);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      // Use FormData if we have an image, otherwise use JSON
      const hasImage = avatarFile !== null;
      
      let res: Response;
      
      if (hasImage) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("phone", phone.trim() || "");
        if (password) {
          formData.append("password", password);
        }
        if (avatarFile) {
          formData.append("avatar", avatarFile);
        }

        res = await fetch("http://localhost:5001/api/users/me", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type for FormData, browser will set it with boundary
          },
          body: formData,
        });
      } else {
        // Use JSON for regular updates
        const updateData: any = {
          name: name.trim(),
          phone: phone.trim() || "",
        };

        if (password) {
          updateData.password = password;
        }

        res = await fetch("http://localhost:5001/api/users/me", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
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
            setAvatarPreview(`http://localhost:5001${data.avatar}`);
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
          setPassword("");
          setConfirmPassword("");
          setIsSubmitting(false);
          // Auto-hide success message after 3 seconds
          setTimeout(() => setMessage(""), 3000);
        } else {
          // If response is not JSON but status is OK, assume success
          setMessage("Profile updated successfully!");
          setEditing(false);
          setPassword("");
          setConfirmPassword("");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
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

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
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
                    src={avatarPreview || `http://localhost:5001${user?.avatar}`}
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
                  className={`w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg ${
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
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
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
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
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
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
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
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
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
                          src={`http://localhost:5001${user.avatar}`}
                          alt="Current"
                          className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-blue-200">
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
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                    <p className="text-blue-800 font-medium capitalize">
                      {user?.role || "user"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Role cannot be changed
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Change Password
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Optional
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Leave blank to keep your current password
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {password && password.length < 6 && (
                      <p className="text-xs text-red-500">
                        Password must be at least 6 characters
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {password &&
                      confirmPassword &&
                      password !== confirmPassword && (
                        <p className="text-xs text-red-500">
                          Passwords do not match
                        </p>
                      )}
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
                        setAvatarPreview(`http://localhost:5001${user.avatar}`);
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
                    setPassword("");
                    setConfirmPassword("");
                    setAvatarFile(null);
                    setShowPassword(false);
                    setShowConfirmPassword(false);
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
      </div>
    </div>
  );
};

export default ProfilePage;
