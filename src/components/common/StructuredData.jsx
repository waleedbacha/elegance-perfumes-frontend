// frontend/src/components/common/StructuredData.jsx
import React from "react";
import { Helmet } from "react-helmet-async";

export const OrganizationStructuredData = () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Elegance Perfumes",
    url: "https://eleganceperfumes.com",
    logo: "https://eleganceperfumes.com/logo.png",
    sameAs: [
      "https://www.facebook.com/eleganceperfumes",
      "https://www.instagram.com/eleganceperfumes",
      "https://twitter.com/eleganceperfumes",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+92-319-9457143",
      contactType: "customer service",
      email: "elegance.myperfume@gmail.com",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
      addressLocality: "Islamabad",
      addressRegion: "Islamabad",
      postalCode: "44000",
      streetAddress: "Gulburg Greens",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

export const WebsiteStructuredData = () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://eleganceperfumes.com",
    name: "Elegance Perfumes",
    description: "Luxury fragrances for men and women in Pakistan",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://eleganceperfumes.com/shop?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

export const BreadcrumbStructuredData = ({ items }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

export const ProductStructuredData = ({ product }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: product.category,
    image: product.images?.[0]?.url || "",
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "PKR",
      availability: product.totalStock > 0 ? "InStock" : "OutOfStock",
      url: `https://eleganceperfumes.com/product/${product._id}`,
    },
    aggregateRating: product.ratings?.average
      ? {
          "@type": "AggregateRating",
          ratingValue: product.ratings.average,
          reviewCount: product.ratings.count || 0,
        }
      : undefined,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};

export const ReviewStructuredData = ({ reviews, product }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: product.brand,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.ratings?.average || 0,
      reviewCount: product.ratings?.count || 0,
    },
    review: reviews?.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.user?.name || "Anonymous",
      },
      datePublished: review.createdAt,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
      },
      reviewBody: review.comment,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};
