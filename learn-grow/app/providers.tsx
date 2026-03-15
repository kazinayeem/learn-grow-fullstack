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
      // Prevent console from being modified
      try {
        Object.defineProperty(window.console, '_commandLineAPI', {
          value: {},
          writable: false,
          configurable: false,
        });
      } catch (e) {
        // Fallback if defineProperty fails
      }

      // Big red banner warning
      const bannerStyle = `
        color: #ffffff;
        background-color: #d32f2f;
        font-size: 16px;
        font-weight: bold;
        padding: 15px;
        border: 3px solid #b71c1c;
        border-radius: 5px;
        display: block;
      `;

      const redBigStyle = `
        color: #ff0000;
        background-color: #ffebee;
        font-size: 18px;
        font-weight: bold;
        padding: 10px;
        border-left: 4px solid #d32f2f;
        display: block;
      `;

      const redStyle = `
        color: #d32f2f;
        font-size: 14px;
        font-weight: 600;
        display: block;
        margin: 5px 0;
      `;

      const warningIcon = "🚨 ";

      // Main warning messages
      console.log(
        `%c${warningIcon}SECURITY WARNING - DO NOT EDIT!${warningIcon}`,
        bannerStyle
      );

      console.log(
        "%c⚠️ THIS IS A BROWSER FEATURE INTENDED FOR DEVELOPERS",
        redBigStyle
      );

      console.log(
        "%cDO NOT PASTE CODE OR COMMANDS HERE!",
        redStyle
      );

      console.log(
        "%cPasting code from untrusted sources could compromise your account security.",
        redStyle
      );

      console.log(
        "%cNever share your authentication tokens, passwords, or personal information.",
        redStyle
      );

      console.log(
        "%cScammers may trick you into pasting malicious code. When in doubt, DO NOT paste.",
        redStyle
      );

      console.log(
        "%c✅ For help, visit: https://learnandgrow.io/support",
        "color: #2e7d32; font-size: 14px; font-weight: bold;"
      );
    };

    // Show warning on page load
    showWarning();

    // Detect DevTools opening using dimensions
    let devToolsOpen = false;

    const checkDevTools = () => {
      const tolerance = 160;

      // Check for DevTools window
      if (
        window.outerHeight - window.innerHeight > tolerance ||
        window.outerWidth - window.innerWidth > tolerance
      ) {
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
