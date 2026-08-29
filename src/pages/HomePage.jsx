import React from "react";
import { motion } from "framer-motion";
import SEO from "../components/common/SEO";
import {
  OrganizationStructuredData,
  WebsiteStructuredData,
} from "../components/common/StructuredData";
import "../styles/pages/HomePage.css";

// Components
import Navbar from "../components/common/Navbar";
import HeroSection from "../components/home/HeroSection";
import CategorySection from "../components/home/CategorySection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import Testimonials from "../components/home/Testimonials";
import Newsletter from "../components/home/Newsletter";
import BannerCarousel from "../components/common/BannerCarousel";
import TopSellers from "../components/home/TopSellers";
import NewArrivals from "../components/home/NewArrivals";
import PerfumeCategoryCarousel from "../components/home/PerfumeCategoryCarousel";

const HomePage = () => {
  return (
    <>
      <SEO
        title="Home"
        description="Discover luxury fragrances at HAMAMA Perfumes. Shop authentic perfumes for men and women in Pakistan. Premium scents, fast delivery."
        keywords="luxury perfumes, premium fragrances, perfume store Pakistan, authentic perfumes, men's perfume, women's perfume"
        url="/"
        type="website"
      />
      <OrganizationStructuredData />
      <WebsiteStructuredData />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Navbar />

        <main>
          <HeroSection />
          <BannerCarousel
            position="promo"
            section="homepage"
            height={250}
            autoPlay={true}
            autoPlayInterval={3000}
            showArrows={true}
            showDots={false}
          />
          <CategorySection />
          <NewArrivals />
          <PerfumeCategoryCarousel />
          <TopSellers />
          <FeaturedProducts />
          <Testimonials />
          <Newsletter />
        </main>
      </motion.div>
    </>
  );
};

export default HomePage;
