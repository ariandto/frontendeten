import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../../api/api";
import BASE_URL from "../../api/base";
import { Helmet } from "react-helmet";

interface Product {
  id: number;
  name: string;
  size: string;
  stock: number;
  price: number;
  image_url: string;
}

const ITEMS_PER_PAGE = 8;

export default function ManageProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/me`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setIsAdmin(data.admin === true);
      } catch (err) {
        console.warn("❌ Bukan admin atau belum login");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("❌ Gagal mengambil produk:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      try {
        await deleteProduct(id); // 🔁 panggil API
        await fetchProducts(); // 🔁 refresh list produk
      } catch (error) {
        console.error("❌ Gagal hapus produk:", error);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (checkingAuth) {
    return <p className="p-6 text-gray-500">Memeriksa hak akses...</p>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        ❌ Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6">
      <Helmet>
        <title>Manajemen Produk - EtenSport</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-10 mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0"></h1>
        <button
          onClick={() => navigate("/add-product")}
          className="bg-rose-600 text-white font-bold px-5 py-2 rounded hover:bg-rose-700 transition mt-3 text-sm sm:text-base"
        >
          + Tambah Jersey
        </button>
      </div>

      {loading ? (
        <p className="text-sm sm:text-base text-gray-500">
          Sedang memuat data...
        </p>
      ) : products.length === 0 ? (
        <p className="text-sm sm:text-base text-gray-500">
          Belum ada produk yang ditambahkan.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-transform w-full max-w-xs mx-auto"
              >
                <img
                  src={product.image_url
                    .replace(/\\/g, "/")
                    .replace("/uploads", `${BASE_URL}/uploads`)}
                  alt={product.name}
                  className="w-full h-40 object-cover cursor-pointer"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.onerror = null;
                    img.src = "/default-image.jpg";
                  }}
                />
                <div className="p-4 text-xs sm:text-sm text-gray-700">
                  <h2 className="font-semibold text-sm sm:text-base mb-1">
                    {product.name}
                  </h2>
                  <p>Ukuran: {product.size}</p>
                  <p>Stok: {product.stock}</p>
                  <p className="font-bold text-rose-600 mt-2 text-sm sm:text-base">
                    Rp {product.price.toLocaleString()}
                  </p>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => navigate(`/edit-product/${product.id}`)} // ⬅️ Tambahkan ini juga
                      className="bg-yellow-500 text-white text-xs sm:text-sm px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)} // 🔧 Tambahkan ini
                      className="bg-red-600 text-white text-xs sm:text-sm px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
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
        </>
      )}
    </div>
  );
}
