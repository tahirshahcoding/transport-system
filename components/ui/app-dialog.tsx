"use client";

import { useState, useCallback, createContext, useContext, useRef, useEffect } from "react";
import { X, AlertTriangle, MessageCircle, CheckCircle, Info } from "lucide-react";

type DialogType = "confirm" | "prompt" | "alert" | "success";

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  resolve?: (value: string | boolean | null) => void;
}

const DialogContext = createContext<{
  showConfirm: (title: string, message: string) => Promise<boolean>;
  showPrompt: (title: string, message: string, placeholder?: string, defaultValue?: string) => Promise<string | null>;
  showAlert: (title: string, message: string) => Promise<void>;
  showSuccess: (title: string, message: string) => Promise<void>;
} | null>(null);

export function useAppDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useAppDialog must be used within AppDialogProvider");
  return ctx;
}

export function AppDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dialog.isOpen && dialog.type === "prompt") {
      setInputValue(dialog.defaultValue || "");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [dialog.isOpen, dialog.type, dialog.defaultValue]);

  const closeDialog = useCallback((result: string | boolean | null) => {
    dialog.resolve?.(result);
    setDialog(prev => ({ ...prev, isOpen: false }));
    setInputValue("");
  }, [dialog]);

  const showConfirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type: "confirm",
        title,
        message,
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
        resolve: resolve as (value: string | boolean | null) => void,
      });
    });
  }, []);

  const showPrompt = useCallback((title: string, message: string, placeholder?: string, defaultValue?: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type: "prompt",
        title,
        message,
        placeholder,
        defaultValue,
        confirmLabel: "Submit",
        cancelLabel: "Cancel",
        resolve: resolve as (value: string | boolean | null) => void,
      });
    });
  }, []);

  const showAlert = useCallback((title: string, message: string): Promise<void> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type: "alert",
        title,
        message,
        confirmLabel: "OK",
        resolve: () => resolve(),
      });
    });
  }, []);

  const showSuccess = useCallback((title: string, message: string): Promise<void> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type: "success",
        title,
        message,
        confirmLabel: "Done",
        resolve: () => resolve(),
      });
    });
  }, []);

  const handleConfirm = () => {
    if (dialog.type === "prompt") {
      closeDialog(inputValue || null);
    } else if (dialog.type === "confirm") {
      closeDialog(true);
    } else {
      closeDialog(true);
    }
  };

  const handleCancel = () => {
    if (dialog.type === "prompt") {
      closeDialog(null);
    } else if (dialog.type === "confirm") {
      closeDialog(false);
    } else {
      closeDialog(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const getIcon = () => {
    switch (dialog.type) {
      case "confirm":
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
        );
      case "prompt":
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
            <MessageCircle className="w-6 h-6 text-blue-500" />
          </div>
        );
      case "success":
        return (
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Info className="w-6 h-6 text-slate-500" />
          </div>
        );
    }
  };

  return (
    <DialogContext value={{ showConfirm, showPrompt, showAlert, showSuccess }}>
      {children}

      {/* Backdrop + Dialog */}
      {dialog.isOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleCancel}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-6 pt-6 flex flex-col items-center text-center">
              {getIcon()}
              <h3 className="text-base font-bold text-slate-900 font-outfit mb-1.5">
                {dialog.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-[280px]">
                {dialog.message}
              </p>

              {/* Input for prompt */}
              {dialog.type === "prompt" && (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={dialog.placeholder || "Type here..."}
                  className="w-full h-11 px-4 mb-5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              )}

              {/* Actions */}
              <div className="flex w-full gap-3">
                {(dialog.type === "confirm" || dialog.type === "prompt") && (
                  <button
                    onClick={handleCancel}
                    className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
                  >
                    {dialog.cancelLabel}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${
                    dialog.type === "confirm"
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                      : dialog.type === "success"
                        ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                  }`}
                >
                  {dialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContext>
  );
}
