import { html } from 'hono/html'
import { jsxRenderer } from 'hono/jsx-renderer'

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
        <div class="p-4">
          <h1 class="text-4xl font-bold mb-4"><a href="/">Todo</a></h1>
          ${children}
        </div>
      </body>
    </html>
  `
})



export const BookCard = ({ book }) => (
  <div class="card">
    <div class="card-header">
    </div>
    <div class="card-body">
      <h3 class="text-lg font-semibold">{book.name}</h3>
    </div>
    <div class="card-footer">
      <a
        href={book.download_url}
        class="flex gap-2 text-primary"
        target="_blank"
        hx-boost="true"
      >
        Unduh
      </a>
    </div>
  </div>
);

export const SearchForm = ({ onSearch }) => (
  <form hx-post="/search" hx-target="#search-results" class="flex gap-3 items-center">
    <input
      type="text"
      name="query"
      placeholder="Cari buku..."
      class="input input-bordered input-primary"
    />
    <button type="submit" class="btn btn-primary">
      Cari
    </button>
  </form>
);
