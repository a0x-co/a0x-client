"use client";

// next
import Image from "next/image";

// shadcn
import { Button } from "@/components/shadcn/button";

export default function AuthGooglePage() {
  const handleGoogleAuth = () => {
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const REDIRECT_URI = `${window.location.origin}/authGoogleCallback`;

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/spreadsheets.readonly&access_type=offline&prompt=consent`;

    window.location.href = googleAuthUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-8">Conectar con Google Sheets</h1>

      <Button
        onClick={handleGoogleAuth}
        className="flex items-center gap-2 bg-white text-gray-800 hover:bg-gray-100 border"
      >
        <Image
          src="/assets/images/google-sheets.png"
          alt="Google"
          className="w-5 h-5"
          width={20}
          height={20}
        />
        Conectar con Google
      </Button>
    </div>
  );
}
