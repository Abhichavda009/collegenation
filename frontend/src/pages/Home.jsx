import Header from "../components/Header";
import HeroSlider from "../components/HeroSlider";
import FeaturedCollections from "../components/FeaturedCollections";
import PromoTiles from "../components/PromoTiles";
import ShopByCollection from "../components/ShopByCollection";
import UniversityCollections from "../components/UniversityCollections";
import LifestyleBanners from "../components/LifestyleBanners";
import TrendingProducts from "../components/TrendingProducts";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Header />
      <HeroSlider />
      <FeaturedCollections />
      <PromoTiles />
      <ShopByCollection />
      <UniversityCollections />
      <LifestyleBanners />
      <TrendingProducts />
      <Footer />
    </>
  );
}

export default Home;
