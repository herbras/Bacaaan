import { html } from 'hono/html';
import { jsxRenderer } from 'hono/jsx-renderer';

export const renderer = jsxRenderer(({ children }) => {
  return html`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Referensi Kutub Mahzab Syafii dan Hanbali</title>
      </head>
      <body>
        <section class="bg-gray-50">
          <div class="mx-auto max-w-screen-xl px-4 py-32 lg:h-screen lg:items-center">
              ${children}
          </div>
        </section>
      </body>
    </html>
  `;
});

export const BookCard = ({ book }) => (
  <div class="bg-white rounded-lg shadow-md p-4">
    <div class="mb-4">
      <h3 class="text-xl font-semibold">{book.name}</h3>
    </div>
    <div class="flex justify-end">
      <a
        href={book.download_url}
        class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        target="_blank"
        hx-boost="true"
      >
        Unduh
      </a>
    </div>
  </div>
);
export const SearchForm = ({ onSearch }) => (
  <form hx-post="/search" hx-target="#search-results" class="flex flex-col md:flex-row gap-3 items-center justify-center mt-8">
    <input
      type="text"
      name="query"
      placeholder="Cari buku..."
      class="input input-bordered w-full py-3 input-primary"
    />
    
    <button type="submit"         class="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
>
      Cari
    </button>
  </form>
);