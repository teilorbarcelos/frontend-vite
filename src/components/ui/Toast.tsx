import { cn } from "@/utils/cn";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import * as React from "react";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 right-0 z-100 flex max-h-screen w-full flex-col gap-3 p-4 md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastRootProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  variant?: ToastVariant;
}

const ToastRoot = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Root>,
  ToastRootProps
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full data-[state=closed]:duration-500",
        {
          "bg-white text-gray-950 border-gray-200": variant === "default",
          "bg-white border-green-100 text-green-900": variant === "success",
          "bg-white border-red-100 text-red-900": variant === "error",
          "bg-white border-yellow-100 text-yellow-900": variant === "warning",
          "bg-white border-blue-100 text-blue-900": variant === "info",
        },
        className
      )}
      {...props}
    />
  );
});
ToastRoot.displayName = ToastPrimitives.Root.displayName;

const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-950/50 opacity-0 transition-opacity hover:text-gray-950 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className
    )}
    toast-close=""
    aria-label="Fechar"
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof ToastRoot>;

export {
  ToastClose, ToastDescription, ToastProvider, ToastRoot,
  ToastTitle, ToastViewport, type ToastProps
};

export const ToastProgress = ({ duration, variant }: { duration?: number; variant?: ToastVariant }) => {
  if (!duration) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
      <div
        className={cn(
          "h-full transition-all ease-linear",
          {
            "bg-gray-500": variant === "default" || !variant,
            "bg-green-500": variant === "success",
            "bg-red-500": variant === "error",
            "bg-yellow-500": variant === "warning",
            "bg-blue-500": variant === "info",
          }
        )}
        style={{
          animation: `toast-progress ${duration}ms linear forwards`,
        }}
      />
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export const ToastIcon = ({ variant }: { variant?: ToastVariant }) => {
  switch (variant) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return null;
  }
};
