import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { TripProvider } from "./contexts/TripContext";

createRoot(document.getElementById("root")!).render(
  <TripProvider>
    <App />
  </TripProvider>
);
