import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/ui/ToastContainer";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
