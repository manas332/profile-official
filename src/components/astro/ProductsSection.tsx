"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

interface Product {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
}

const products: Product[] = [
  {
    name: "Ruby (Manik)",
    description: "Sun Stone",
    price: "₹24,999",
    imageUrl: "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?q=80&w=500&auto=format",
  },
  {
    name: "Blue Sapphire",
    description: "Saturn Stone",
    price: "₹34,999",
    imageUrl: "https://images.unsplash.com/photo-1610735052189-2bdb7d092643?q=80&w=500&auto=format",
  },
  {
    name: "Yellow Sapphire",
    description: "Jupiter Stone",
    price: "₹29,999",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=500&auto=format",
  },
  {
    name: "Emerald",
    description: "Mercury Stone",
    price: "₹22,999",
    imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=500&auto=format",
  },
];

export default function ProductsSection() {
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 mb-12">
        {products.map((product, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative overflow-hidden bg-linear-to-br from-amber-lightest to-amber-lighter h-28 sm:h-32 md:h-40">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-3 md:p-4">
              <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <p className="text-base md:text-lg font-bold text-amber-ink">{product.price}</p>
            </div>
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
        <Button variant="primary" size="lg">
          Browse All Products
        </Button>
      </motion.div>
    </section>
  );
}
