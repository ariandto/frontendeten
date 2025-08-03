import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProductWithUpload } from "../../api/api";
import BASE from "../../api/base";

interface MeResponse {
  uid: string;
  email: string;
  name: string;
  admin: boolean;
}

export default function AddJersey() {
  const [name, setName] = useState("");
  const [size, setSize] = useState("M");
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState<File | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  //  Cek apakah user adalah admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BASE}/me`, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      alert("❌ Gambar wajib diunggah.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("size", size);
    formData.append("stock", stock.toString());
    formData.append("price", price.toString());
    formData.append("image", image);

    try {
      await createProductWithUpload(formData);
      alert("✅ Produk berhasil ditambahkan!");
      navigate("/products");
    } catch (err) {
      console.error("❌ Gagal menambahkan produk:", err);
      alert("Gagal menambahkan produk.");
    }
  };

  if (checkingAuth) return <p className="p-4">Memeriksa hak akses...</p>;

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-red-600">
        ❌ Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Tambah Produk Jersey</h2>

        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <label className="block font-medium">Nama Jersey</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Ukuran</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={size}
              onChange={(e) => setSize(e.target.value)}
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
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Harga</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block font-medium">Upload Gambar</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border px-3 py-2 rounded"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-rose-600 text-white py-2 rounded hover:bg-rose-700 transition"
          >
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
}
