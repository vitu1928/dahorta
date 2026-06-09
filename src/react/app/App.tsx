import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./store/AppContext";

// Main App component wrapping everything in the AppProvider context
function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;
