import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import CollectionPage from "./pages/CollectionPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import ProductPage from "./pages/ProductPage";
import UniversitiesPage from "./pages/UniversitiesPage";
import UniversityPage from "./pages/UniversityPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/collections/:slug" element={<CollectionPage />} />
      <Route path="/products/:slug" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/universities/:slug" element={<UniversityPage />} />
      <Route path="/pages/universities" element={<UniversitiesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FaqPage />} />
    </Routes>
  );
}

export default App;
