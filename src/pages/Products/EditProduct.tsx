import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProducts } from "../../api/api";
import BASE from "../../api/base";

interface Product {
  id: number;
  name: string;
  size: string;
  stock: number;
  price: number;
  image_url: string;
}

interface MeResponse {
  uid: string;
  email: string;
  name: string;
  admin: boolean;
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const getImageUrl = (path: string): string => {
    return path.startsWith("/uploads")
      ? `${BASE}${path.replace(/\\/g, "/")}`
      : path;
  };

  // 🔐 Cek apakah user adalah admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BASE}/api/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Unauthorized");

        const data: MeResponse = await res.json();
        setIsAdmin(data.admin === true);
      } catch (err) {
        console.warn("❌ Akses ditolak");
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // 🔃 Fetch detail produk
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const products = await getProducts();
        const found = products.find((p: Product) => p.id === Number(id));
        if (found) setProduct(found);
      } catch (err) {
        console.error("❌ Gagal mengambil produk:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchProduct();
    }
  }, [id, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("size", product.size);
      formData.append("stock", product.stock.toString());
      formData.append("price", product.price.toString());

      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("image_url", product.image_url);
      }

      const res = await fetch(`${BASE}/api/products/${product.id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Gagal memperbarui produk");

      alert("✅ Produk berhasil diperbarui!");
      navigate("/manage-product");
    } catch (err) {
      console.error("❌ Gagal memperbarui produk:", err);
      alert("Terjadi kesalahan saat memperbarui produk.");
    }
  };

  // 🔄 Sementara cek hak akses
  if (checkingAuth) return <p className="p-4">Memeriksa hak akses...</p>;

  // 🔒 Jika bukan admin
  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-red-600">
        ❌ Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  // 📦 Jika belum selesai loading data produk
  if (loading || !product) return <p className="p-4">Memuat data produk...</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Edit Produk Jersey</h2>

        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <label className="block font-medium">Nama Produk</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Ukuran</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={product.size}
              onChange={(e) => setProduct({ ...product, size: e.target.value })}
            >
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Stok</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={product.stock}
              onChange={(e) =>
                setProduct({ ...product, stock: parseInt(e.target.value) })
              }
              required
            />
          </div>

          <div>
            <label className="block font-medium">Harga</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={product.price}
              onChange={(e) =>
                setProduct({ ...product, price: parseInt(e.target.value) })
              }
              required
            />
          </div>

          <div>
            <label className="block font-medium">Gambar Saat Ini</label>
            <img
              src={getImageUrl(product.image_url)}
              alt={product.name}
              className="w-full h-40 object-cover rounded mb-2 border"
            />
            <input
              type="file"
              accept="image/*"
              className="w-full border px-3 py-2 rounded"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Biarkan kosong jika tidak ingin mengganti gambar.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}
