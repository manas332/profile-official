"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types/product";

interface ProductsSectionProps {
  products: Product[];
}

export default function ProductsSection({ products }: ProductsSectionProps) {
  // If no products, we might want to hide the section or show a placeholder.
  // For now, let's just return null if empty to keep UI clean, or show header with "Coming Soon".
  // But user asked to filter top 4, so assuming there are products.
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 pt-8 pb-8">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Sacred Products</h2>
        <p className="text-xl text-gray-600">Authentic gemstones and spiritual items</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Link href="/astro/products">
          <Button variant="primary" size="lg">
            Browse All Products
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}