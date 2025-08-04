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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    
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
    if (!product) return;

    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/manage-product");
  };

 // 🔄 Cek hak akses sementara
if (checkingAuth) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mb-4"></div>
        <p className="text-gray-700 font-medium">Memeriksa hak akses...</p>
      </div>
    </div>
  );
}

  // 🔒 Akses ditolak
if (!isAdmin) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full bg-gray-100  shadow-lg p-8 text-center">
        <div className=" flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500"/>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Akses Ditolak</h3>
        <p className="text-gray-600 mb-6">Anda tidak memiliki akses ke halaman ini.</p>
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}

  // 📦 Jika belum selesai loading data produk
  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-white font-medium">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:py-14">
  <div className="max-w-2xl mx-auto">
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-800"/>
      </div>
    </div>

        {/* Main Card */}
         <div className="bg-gray-50 rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
              {/* Current & New Image Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Gambar Saat Ini
                  </label>
                  <div className="relative">
                    <img
                      src={getImageUrl(product.image_url)}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-2xl shadow-lg border-4 border-gray-100"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <span className="text-white font-medium bg-black bg-opacity-50 px-3 py-1 rounded-lg">
                        Gambar Lama
                      </span>
                    </div>
                  </div>
                </div>

                {/* New Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Upload Gambar Baru (Opsional)
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-2xl shadow-lg border-4 border-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center shadow-lg"
                      >
                        ×
                      </button>
                      <div className="absolute inset-0 bg-black bg-opacity-20 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <span className="text-white font-medium bg-black bg-opacity-50 px-3 py-1 rounded-lg">
                          Gambar Baru
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 border-3 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500 mb-2">Upload Gambar Baru</p>
                        <p className="text-xs text-gray-400">Biarkan kosong jika tidak ingin mengganti</p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="mt-4 block w-full text-center px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-200 cursor-pointer font-medium"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {imagePreview ? 'Ganti Gambar' : 'Pilih Gambar Baru'}
                  </label>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Nama Produk */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-2 focus:ring-gray-200 transition-all duration-200 outline-none bg-gray-50 focus:bg-white"
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    required
                  />
                </div>

                {/* Ukuran */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ukuran
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-2 focus:ring-gray-200 transition-all duration-200 outline-none bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                    value={product.size}
                    onChange={(e) => setProduct({ ...product, size: e.target.value })}
                  >
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                  </select>
                </div>

                {/* Stok */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stok
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-2 focus:ring-gray-200 transition-all duration-200 outline-none bg-gray-50 focus:bg-white"
                    value={product.stock}
                    onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) })}
                    required
                  />
                </div>

                {/* Harga */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Harga (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-2 focus:ring-gray-200 transition-all duration-200 outline-none bg-gray-50 focus:bg-white"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Simpan Perubahan
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBack}
                  className="sm:w-auto px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-black hover:text-black transition-all duration-200"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Batal
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            * Jika tidak ingin mengganti gambar, biarkan field upload gambar kosong
          </p>
        </div>
      </div>
    </div>
  );
}