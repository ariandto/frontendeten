import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../../api/api";
import { Helmet } from "react-helmet";

interface Product {
  id: number;
  name: string;
  size: string;
  stock: number;
  price: number;
  image_url: string;
}

interface User {
  email: string;
  name?: string;
}

export default function ManageProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null); // ✅ user state
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Ambil user dari localStorage atau session
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
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
        await deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error("❌ Gagal hapus produk:", error);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔒 Validasi jika bukan admin
  if (!user || user.email !== import.meta.env.VITE_EMAIL_ADMIN) {
    return (
      <div className="p-6 text-center text-red-600">
        ❌ Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Helmet>
        <title>Manajemen Produk - EtenSport</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
        <button
          onClick={() => navigate("/add-product")}
          className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700"
        >
          + Tambah Produk
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>Belum ada produk.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded shadow p-4 flex flex-col">
              <img
                src={product.image_url.replace(/\\/g, "/").replace("/uploads", "http://localhost:5700/uploads")}
                alt={product.name}
                className="h-40 w-full object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p>Ukuran: {product.size}</p>
              <p>Stok: {product.stock}</p>
              <p className="text-rose-600 font-bold">Rp {product.price.toLocaleString()}</p>

              <div className="mt-4 flex justify-between gap-2">
                <button
                  onClick={() => navigate(`/edit-product/${product.id}`)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
