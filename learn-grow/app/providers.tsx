"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { SSRProvider } from "react-aria";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { Provider } from "react-redux";
import { store } from "../redux/store";

// DevTools detection component
function DevToolsWarning() {
  React.useEffect(() => {
    const showWarning = () => {
      const warningStyle = "color: #ff0000; font-size: 20px; font-weight: bold;";
      const textStyle = "color: #ff0000; font-size: 14px;";
      
      console.log(
        "%c⚠️ SECURITY WARNING",
        warningStyle
      );
      console.log(
        "%cDo not paste anything here unless you understand the security risks!",
        textStyle
      );
      console.log(
        "%cScammers and malicious users may trick you into pasting code that compromises your account.",
        textStyle
      );
      console.log(
        "%cNever share your authentication tokens or personal information.",
        textStyle
      );
    };

    // Initial warning on page load
    showWarning();

    // Detect DevTools opening using dimensions
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let devToolsOpen = false;

    const checkDevTools = () => {
      const tolerance = 160;
      
      if (window.outerHeight - window.innerHeight > tolerance) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          showWarning();
        }
      } else if (window.outerWidth - window.innerWidth > tolerance) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          showWarning();
        }
      } else {
        devToolsOpen = false;
      }
    };

    const resizeListener = () => {
      checkDevTools();
    };

    window.addEventListener("resize", resizeListener);

    // Also check on focus/blur
    const focusListener = () => {
      checkDevTools();
    };
    
    window.addEventListener("focus", focusListener);
    window.addEventListener("blur", focusListener);

    return () => {
      window.removeEventListener("resize", resizeListener);
      window.removeEventListener("focus", focusListener);
      window.removeEventListener("blur", focusListener);
    };
  }, []);

  return null;
}

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <Provider store={store}>
      <DevToolsWarning />
      <SSRProvider>
        <NextUIProvider navigate={router.push}>
          <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        </NextUIProvider>
      </SSRProvider>
    </Provider>
  );
}
