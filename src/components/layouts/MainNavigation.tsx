import { useEffect, useState } from "react";
import { getProducts } from "../../api/api";
import { Helmet } from "react-helmet";
import BASE from "../../api/base";

interface Product {
  id: number;
  name: string;
  size: string;
  stock: number;
  price: number;
  image_url: string;
}

const getImageUrl = (path: string): string => {
  if (!path) return "/default-image.jpg";
  return path.startsWith("/") ? `${BASE}${path.replace(/\\/g, "/")}` : path;
};

const ITEMS_PER_PAGE = 10;

export default function MainNavigation() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProducts();
        setProducts(res);
      } catch (err) {
        console.error("❌ Gagal fetch produk:", err);
        setError("Gagal memuat produk, silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const closeModal = () => setSelectedImage(null);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="pt-20 pb-10 px-4 sm:px-10 bg-white min-h-screen">
      <Helmet>
        <title>Jersey Catalog - EtenSport</title>
        <meta name="description" content="Browse our premium sportswear catalog" />
      </Helmet>

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
        Our Jerseys Catalog
      </h2>

      {/* Pencarian */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Cari berdasarkan nama jersey..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1); // reset halaman saat pencarian
          }}
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring focus:ring-rose-200"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Memuat katalog...</p>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-black transition"
          >
            Login untuk mengakses
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">Produk tidak ditemukan.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-xs hover:shadow-lg transition"
              >
                <img
                  src={getImageUrl(product.image_url)}
                  alt={product.name}
                  className="w-full h-40 object-cover cursor-pointer"
                  onClick={() => setSelectedImage(getImageUrl(product.image_url))}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.onerror = null;
                    img.src = "/default-image.jpg";
                  }}
                />
                <div className="p-4 text-xs sm:text-sm text-gray-700">
                  <h3 className="font-semibold text-sm sm:text-base mb-1">{product.name}</h3>
                  <p>Size: {product.size}</p>
                  <p>Stock: {product.stock}</p>
                  <p className="font-bold text-rose-600 mt-2">
                    Rp {product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center mt-8 gap-2 text-sm sm:text-base">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                &larr; Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-rose-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Fullscreen Image */}
      {selectedImage && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        >
          <img
            src={selectedImage}
            alt="Preview"
            className="w-auto h-auto max-w-[95%] max-h-[90vh] object-contain rounded-xl shadow-lg"
          />
          <button
            onClick={closeModal}
            className="absolute top-5 right-5 text-white text-3xl font-bold hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}
