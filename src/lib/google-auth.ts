// Utility for Google OAuth login

export async function handleGoogleLogin(googleUser: {
  id: string;
  email: string;
  name: string;
  picture?: string;
}): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleUser.email,
          name: googleUser.name,
          google_id: googleUser.id,
          avatar: googleUser.picture || null,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Google login failed",
      };
    }

    // Save token to localStorage
    if (data.token) {
      localStorage.setItem("token", data.token);
      document.cookie = `token=${data.token}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; SameSite=Lax`;
    }

    // Save role
    if (data.role) {
      const roleString = String(data.role).trim();
      localStorage.setItem("role", roleString);
      document.cookie = `role=${roleString}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; SameSite=Lax`;
    }

    // Dispatch event for navbar update
    window.dispatchEvent(new Event("localStorageChange"));

    return {
      success: true,
      message: "Google login successful",
      token: data.token,
    };
  } catch (error) {
    console.error("Google login error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Network error occurred",
    };
  }
}

// Load Google SDK script
export function loadGoogleScript() {
  if (document.getElementById("google-jssdk")) {
    return;
  }

  const script = document.createElement("script");
  script.id = "google-jssdk";
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Initialize Google Sign-In button
export function initializeGoogleSignIn(
  buttonId: string,
  onSuccess: (credentialResponse: CredentialResponse) => void,
  onError: () => void
) {
  try {
    if (!window.google) {
      console.error("Google SDK not loaded");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      callback: onSuccess,
    });

    window.google.accounts.id.renderButton(document.getElementById(buttonId), {
      theme: "outline",
      size: "large",
      width: 320,
      text: "signup_with",
    });
  } catch (error) {
    console.error("Failed to initialize Google Sign-In:", error);
    onError();
  }
}

// TypeScript type for Google Credential Response
interface CredentialResponse {
  clientId: string;
  credential: string;
  select_by: string;
}

// Decode JWT response from Google
export function decodeGoogleResponse(token: string) {
  try {
    const parts = token.split(".");
    const decoded = JSON.parse(atob(parts[1]));
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
  } catch (error) {
    console.error("Failed to decode Google token:", error);
    return null;
  }
}

// Extend Window interface for Google SDK
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
          prompt: (onError: () => void) => void;
        };
      };
    };
  }
}
