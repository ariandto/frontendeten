export default function MainNavigation() {
  const jerseys = Array.from({ length: 10 }, (_, i) => ({
    name: `Jersey ${String.fromCharCode(65 + i)}`, // Jersey A, B, ...
    image: `/src/assets/jersey/jersey${i + 1}.jpeg`,
  }));

  return (
    <main className="pt-20 pb-10 px-4 sm:px-10 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Our Jerseys Catalog</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 justify-items-center">
        {jerseys.map((item, idx) => (
          <div
            key={idx}
            className="w-32 sm:w-40 bg-white border border-gray-300 rounded-lg shadow hover:shadow-md transition duration-200 p-3 flex flex-col items-center"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-32 object-cover rounded mb-2"
              loading="lazy"
            />
            <span className="text-sm text-gray-700 font-medium text-center">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
