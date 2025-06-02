"use client";

// react
import { useEffect, useState } from "react";

// next
import { useSearchParams } from "next/navigation";

export default function AuthGoogleCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Procesando autenticación...");

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      handleGoogleCallback(code);
    } else {
      setStatus("error");
      setMessage("No se recibió código de autorización");
    }
  }, [searchParams]);

  const handleGoogleCallback = async (code: string) => {
    return;

    // try {
    //   const response = await fetch("/api/auth/google/callback", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ code }),
    //   });

    //   const data = await response.json();

    //   if (data.success) {
    //     setStatus("success");
    //     setMessage("Autenticación exitosa");
    //     // Opcional: redirigir después de un tiempo
    //     setTimeout(() => {
    //       window.location.href = "/dashboard"; // o donde quieras redirigir
    //     }, 2000);
    //   } else {
    //     throw new Error(data.error || "Error en la autenticación");
    //   }
    // } catch (error) {
    //   setStatus("error");
    //   setMessage(
    //     error instanceof Error ? error.message : "Error en la autenticación"
    //   );
    // }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {status === "loading" && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="text-green-500 text-xl mb-2">✓</div>
            <h2 className="text-xl font-semibold text-gray-800">¡Éxito!</h2>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">✗</div>
            <h2 className="text-xl font-semibold text-gray-800">Error</h2>
          </div>
        )}

        <p className="text-center mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
