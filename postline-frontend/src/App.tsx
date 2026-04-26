import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useAuthStore } from "./store/authStore";

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-8 h-8 border-4 border-pine border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
