
const BASE_URL =  "https://etenapi.ariandto.pro/api";

export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`, {
    credentials: "include", // ✅ Tambahkan ini
  });
  if (!res.ok) throw new Error("Gagal mengambil produk");
  return await res.json();
};

export const createProductWithUpload = async (formData: FormData) => {
  const res = await fetch(`${BASE_URL}/products/upload`, {
    method: "POST",
    body: formData,
    credentials: "include", // ✅
  });

  if (!res.ok) throw new Error("Gagal mengunggah produk");
  return await res.json();
};

export const updateProduct = async (id: number, product: any) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
    credentials: "include", // ✅
  });

  if (!res.ok) throw new Error("Gagal memperbarui produk");
  return await res.json();
};

export const deleteProduct = async (id: number) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
    credentials: "include", // ✅
  });

  if (!res.ok) throw new Error("Gagal menghapus produk");
  return await res.json();
};
