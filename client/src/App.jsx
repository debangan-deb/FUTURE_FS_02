import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Admin from "./Admin";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Navbar from "./Navbar";
import Provider from "./Context";
import MyOrders from "./MyOrders";
import AdminOrders from "./AdminOrders";
import { Toaster } from "react-hot-toast";
import Profile from "./Profile";
import AdminDashBoard from "./AdminDashboard";
import Support from "./Support";
import RegisteredUsers from "./RegisteredUsers";
import CategoryPage from "./CategoryPage";
export default function App() {
  return (
    <Provider>
      <BrowserRouter>
        <Navbar />
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin-dashboard" element={<AdminDashBoard />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin/users" element={<RegisteredUsers />} />
          <Route path="/category/:name" element={<CategoryPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
