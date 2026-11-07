import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/dm-mono/latin-400.css";
import "@fontsource/dm-mono/latin-500.css";
import "../../../brand/tokens.css";
import "./styles.css";
import { DialogProvider } from "./DialogManager";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DialogProvider><App /></DialogProvider>
  </React.StrictMode>,
);
