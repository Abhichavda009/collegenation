import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import CollectionPage from "./pages/CollectionPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import ProductPage from "./pages/ProductPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/collections/:slug" element={<CollectionPage />} />
      <Route path="/products/:slug" element={<ProductPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FaqPage />} />
    </Routes>
  );
}

export default App;
