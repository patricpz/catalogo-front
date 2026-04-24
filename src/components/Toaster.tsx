"use client";

import { useToast } from "@/contexts/toast-context";
import { CheckCircle2, XCircle, AlertTriangle, InfoIcon, X } from "lucide-react";

const icons: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  error: <XCircle className="h-5 w-5 text-red-600" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-600" />,
  info: <InfoIcon className="h-5 w-5 text-blue-600" />,
};

const borderColors: Record<string, string> = {
  success: "border-l-green-500",
  error: "border-l-red-500",
  warning: "border-l-amber-500",
  info: "border-l-blue-500",
};

export default function Toaster() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-white rounded-lg border border-l-4 ${borderColors[toast.type]} shadow-lg p-4 pointer-events-auto animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
              {toast.description && (
                <p className="text-sm text-gray-500 mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 shrink-0"
              aria-label="Fechar notificacao"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
