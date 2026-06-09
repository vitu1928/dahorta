import { createBrowserRouter } from "react-router";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import HomeRedirect from "./pages/HomeRedirect";
import LandingPage from "./pages/LandingPage";

import OwnerLayout from "./pages/owner/OwnerLayout";
import AnalyticsPage from "./pages/owner/AnalyticsPage";
import MenuManagementPage from "./pages/owner/MenuManagementPage";
import SettingsPage from "./pages/owner/SettingsPage";
import InsumoManagementPage from "./pages/owner/InsumoManagementPage";
import SuppliersPage from "./pages/owner/SuppliersPage";
import InventoryPage from "./pages/owner/InventoryPage";
import CouponManagementPage from "./pages/owner/CouponManagementPage";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import MotoboyDashboard from "./pages/motoboy/MotoboyDashboard";

import CustomerLayout from "./pages/customer/CustomerLayout";
import MenuPage from "./pages/customer/MenuPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import OrderTrackingPage from "./pages/customer/OrderTrackingPage";
import OrdersPage from "./pages/customer/OrdersPage";
import ProfilePage from "./pages/customer/ProfilePage";

export const router = createBrowserRouter([
  { path: "/landing", Component: LandingPage },
  { path: "/login", Component: LoginPage },
  { path: "/register", Component: RegisterPage },
  { path: "/forgot-password", Component: ForgotPasswordPage },
  {
    path: "/owner",
    Component: OwnerLayout,
    children: [
      { index: true, Component: AnalyticsPage },
      { path: "menu", Component: MenuManagementPage },
      { path: "cupons", Component: CouponManagementPage },
      { path: "insumos", Component: InsumoManagementPage },
      { path: "fornecedores", Component: SuppliersPage },
      { path: "estoque", Component: InventoryPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
  { path: "/employee", Component: EmployeeDashboard },
  { path: "/motoboy", Component: MotoboyDashboard },
  {
    path: "/",
    Component: CustomerLayout,
    children: [
      { index: true, Component: HomeRedirect },
      { path: "menu", Component: MenuPage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "order/:id", Component: OrderTrackingPage },
      { path: "orders", Component: OrdersPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
]);