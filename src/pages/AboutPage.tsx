import { Helmet } from "react-helmet";

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Eten Sport</title>
        <meta
          name="description"
          content="Eten Sport merupakan Penyedia Jersey Premium yang terpercaya di Cikarang sejak tahun 2025."
        />
        <meta
          name="keywords"
          content="Eten Sport, Jersey Premium, Cikarang, Olahraga, Sportwear"
        />
      </Helmet>

      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        {/* Foto Owner */}
        <div className="w-28 h-28 rounded-full border-2 border-gray-400 overflow-hidden">
          <img
            src="/foto-profil.jpeg"
            alt="Foto Owner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Icon WhatsApp */}
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-green-500 hover:scale-110 transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12.004 2.003c-5.522 0-10 4.477-10 9.999 0 1.762.465 3.48 1.345 4.997l-1.424 5.196 5.33-1.397a9.958 9.958 0 004.749 1.202h.001c5.523 0 10-4.477 10-9.998s-4.477-9.999-10.001-9.999zm0 18.194a8.21 8.21 0 01-4.193-1.146l-.3-.178-3.164.829.847-3.094-.195-.317a8.203 8.203 0 01-1.255-4.478c0-4.541 3.692-8.232 8.232-8.232 2.198 0 4.266.856 5.82 2.409a8.203 8.203 0 012.411 5.823c0 4.54-3.691 8.232-8.233 8.232zm4.485-6.153c-.245-.123-1.449-.715-1.673-.796-.225-.082-.389-.123-.552.123-.163.245-.633.796-.776.959-.143.163-.286.184-.531.061-.245-.123-1.034-.381-1.971-1.213-.729-.65-1.222-1.451-1.365-1.696-.143-.245-.015-.377.108-.499.111-.11.245-.286.368-.429.123-.143.163-.245.245-.408.082-.163.041-.306-.02-.429-.061-.123-.552-1.336-.757-1.828-.199-.478-.401-.413-.552-.42-.143-.006-.306-.007-.469-.007-.163 0-.429.062-.654.306-.225.245-.858.84-.858 2.047s.879 2.377 1.002 2.541c.123.163 1.729 2.64 4.192 3.701.586.253 1.042.404 1.398.517.587.187 1.122.16 1.545.097.471-.07 1.449-.593 1.653-1.166.204-.572.204-1.062.143-1.165-.061-.102-.224-.163-.47-.286z" />
          </svg>
        </a>

        {/* About Section */}
        <div className="mt-6 text-center">
          <h2 className="font-bold text-lg">About Eten Sport</h2>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
            Eten Sport merupakan Penyedia Jersey <br />
            Premium yang terpercaya di Cikarang sejak <br />
            tahun 2024
          </p>
        </div>
      </div>
    </>
  );
}
