import { useEffect, useState } from "react";
import { getProducts } from "../api/api";
import { Helmet } from "react-helmet";

interface Product {
  id: number;
  name: string;
  size: string;
  stock: number;
  price: number;
  image_url: string;
}

// ✅ Convert path from \ to / and prepend BASE_URL
const getImageUrl = (path: string): string => {
  const base = "http://localhost:5700";
  return path.startsWith("/")
    ? `${base}${path.replace(/\\/g, "/")}`
    : path;
};


export default function MainNavigation() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProducts(); // ✅ credentials: "include" sudah diatur di api.ts
        setProducts(res);
      } catch (err) {
        setError("Gagal memuat produk");
        console.error("❌ Gagal fetch produk:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="pt-20 pb-10 px-4 sm:px-10 bg-gray-50 min-h-screen">
      <Helmet>
        <title>Jersey Catalog - EtenSport</title>
        <meta name="description" content="Browse our premium sportswear catalog" />
      </Helmet>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Our Jerseys Catalogs
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Memuat katalog...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">Belum ada produk tersedia.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 justify-items-center">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-xs hover:shadow-lg transition"
            >
              <img
                src={getImageUrl(product.image_url)}
                alt={product.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 text-sm text-gray-700">
                <h3 className="font-semibold text-base mb-1">{product.name}</h3>
                <p>Size: {product.size}</p>
                <p>Stock: {product.stock}</p>
                <p className="font-bold text-rose-600 mt-2">
                  Rp {product.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
