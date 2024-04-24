import { html } from "hono/html";
import { jsxRenderer } from "hono/jsx-renderer";

export const renderer = jsxRenderer(({ children }) => {
  return html`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image" content="https://i.ibb.co/6tR6wfK/og.png" />
        <meta
          name="twitter:image:src"
          content="https://i.ibb.co/6tR6wfK/og.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image:width" content="1200" />
        <meta name="twitter:image:width" content="1200" />
        <meta property="og:image:height" content="600" />
        <meta name="twitter:image:height" content="600" />
        <link
          rel="icon"
          href="https://arbain.sarbeh.com/favicon.ico"
          sizes="any"
        />
        <title>Referensi Kutub Mahzab Syafii dan Hanbali</title>
      </head>
      <body>
        <section class="bg-gray-50 ">
          <div
            class="mx-auto max-w-screen-xl px-4 py-32 lg:items-center"
          >
            ${children}
          </div>
        </section>
        <!-- Tombol "Kembali ke Atas" -->
        <button id="scrollToTopBtn" class="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md hidden z-10">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
      </button>
      
      <div role="button" aria-label="Button Api Documentation" class="fixed bottom-4 left-4 z-20">
        <a href="/reference" target="_blank" class="bg-gray-800 hover:bg-gray-900 text-white text-lg font-bold p-3 rounded-full decoration-none shadow-lg flex items-center">
          API Doc
        </a>
      </div>
<script>
// Fungsi untuk menggulir ke bagian atas halaman
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fungsi untuk menampilkan tombol "Kembali ke Atas" saat pengguna menggulir ke bawah
window.onscroll = function() {
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  if (window.pageYOffset > 20) {
    scrollToTopBtn.classList.remove('hidden');
  } else {
    scrollToTopBtn.classList.add('hidden');
  }
};

// Menambahkan event listener untuk tombol "Kembali ke Atas"
const scrollToTopBtn = document.getElementById('scrollToTopBtn');
scrollToTopBtn.addEventListener('click', scrollToTop);</script>
      </body>
    </html>
  `;
});

export const BookCard = ({ book }) => (
  <div class="bg-white grid gap-6 rounded-lg shadow-md p-4">
    <div class="mb-4">
      <h3 class="text-xl font-semibold">{book.name}</h3>
    </div>

    <div class="flex justify-between">
      <div
        class={`px-2 py-1 rounded-full font-bold text-white ${
          book.category_id === 2 ? "bg-green-500" : "bg-blue-300"
        }`}
      >
        {book.category_id === 2 ? "Hanbali" : "Syafii"}
      </div>
      <a
        href={book.download_url}
        class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        target="_blank"
        hxBoost="true"
      >
        Unduh
      </a>
    </div>
  </div>
);
export const SearchForm = ({ onSearch, categories }) => (
  <form
    hx-post="/search"
    hx-target="#search-results"
    hx-swap="outerHTML"
    class="flex flex-col md:flex-row gap-3 items-center justify-center mt-8"
  >
    <input
      type="text"
      name="query"
      placeholder="Cari buku..."
      class="input input-bordered w-full py-3 input-primary"
    />
    <select
      name="categoryId"
      class="input input-bordered w-full py-3 input-primary"
    >
      <option value="">Semua Kategori</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
    <button
      type="submit"
      class="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
    >
      Cari
    </button>
  </form>
);
