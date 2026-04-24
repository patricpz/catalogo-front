"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth/storage";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    clearAuthToken();
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Saindo...
    </div>
  );
}
