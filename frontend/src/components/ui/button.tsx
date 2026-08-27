import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4274D9] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.99] cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#4274D9] text-white shadow-sm hover:bg-[#3462c7] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] dark:bg-[#4274D9] dark:hover:bg-[#3462c7]",
        gradient:
          "bg-[#4274D9] text-white shadow-sm hover:bg-[#3462c7] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
        navy:
          "bg-[#293681] text-white shadow-sm hover:bg-[#1f2963] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border-2 border-[#95CCDD] bg-white text-[#293681] shadow-sm hover:border-[#4274D9] hover:bg-[#D0E7E6]/30 hover:text-[#4274D9] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-[#4274D9] dark:hover:bg-[#4274D9]/15 dark:hover:text-[#95CCDD]",
        secondary:
          "bg-[#D0E7E6] text-[#293681] font-bold border border-[#95CCDD]/60 hover:bg-[#bee4e3] hover:text-[#293681] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 dark:bg-[#4274D9]/20 dark:text-[#95CCDD] dark:border-[#4274D9]/30 dark:hover:bg-[#4274D9]/30",
        ghost:
          "text-slate-700 hover:bg-[#D0E7E6]/50 hover:text-[#4274D9] hover:-translate-y-0.5 active:translate-y-0 dark:text-slate-200 dark:hover:bg-[#4274D9]/20 dark:hover:text-[#95CCDD]",
        link: "text-[#4274D9] font-semibold underline-offset-4 hover:underline hover:text-[#293681] dark:hover:text-[#95CCDD]",
      },
      size: {
        default: "h-11 px-5 text-sm rounded-lg",
        sm: "h-9 px-3.5 text-xs rounded-md",
        lg: "h-12 px-7 text-base rounded-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
