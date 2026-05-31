// Utility for Google OAuth login

export async function handleGoogleLogin(googleUser: {
  credential: string;
}): Promise<{ success: boolean; message: string; role?: string }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          credential: googleUser.credential,
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

    window.dispatchEvent(new Event("authChange"));

    return {
      success: true,
      message: "Google login successful",
      role: data.role,
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
          initialize: (config: {
            client_id: string;
            callback: (response: CredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            options: {
              theme: string;
              size: string;
              width: number;
              text: string;
            }
          ) => void;
          prompt: (onError: () => void) => void;
        };
      };
    };
  }
}
