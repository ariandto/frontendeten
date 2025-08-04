import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProductWithUpload } from "../../api/api";
import BASE_URL from "../../api/base";

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/me`, {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!image) {
      alert("❌ Gambar wajib diunggah.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("size", size);
      formData.append("stock", stock.toString());
      formData.append("price", price.toString());
      formData.append("image", image);

      await createProductWithUpload(formData);
      alert("✅ Produk berhasil ditambahkan!");
      navigate("/manage-product");
    } catch (err: any) {
      console.error("❌ Gagal simpan:", err);
      alert(err.message || "Terjadi kesalahan saat menyimpan produk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/manage-product");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mb-4" />
          <p className="text-gray-600 font-medium">Memeriksa hak akses...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h3>
          <p className="text-gray-600 mb-6">Anda tidak memiliki akses ke halaman ini.</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-10">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Tambah Produk Jersey
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            <div className="text-center">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Upload Gambar Jersey
              </label>
              <div className="relative">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded-2xl shadow-lg border-4 border-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-40 mx-auto border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-gray-50">
                    <p className="text-gray-500 text-sm">Upload Gambar</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="mt-4 inline-block px-6 py-3 bg-black text-white rounded-xl cursor-pointer"
              >
                Pilih Gambar
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Jersey</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  placeholder="Contoh: Jersey Persija 2024"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ukuran</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="L">Large (L)</option>
                  <option value="XL">Extra Large (XL)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stok</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Harga (Rp)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-black transition"
            >
              ← Kembali ke Daftar Produk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
