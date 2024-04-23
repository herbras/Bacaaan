import { BookCard, SearchForm, renderer } from './components';

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

type Bindings = {
  DB: D1Database;
};

type Referensi = {
  id: number;
  name: string;
  folder_id: string;
  file_id: string;
  download_url: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('*', renderer);

app.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT *
    FROM referensi
    ORDER BY RANDOM()
    LIMIT 10;
  `).all<Referensi>();

  const books = results;

  return c.render(
    <div>
      <SearchForm onSearch={(query) => c.redirect(`/search?query=${encodeURIComponent(query)}`)} />
      <div id="search-results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
});

app.post('/search', async (c) => {
  const body = await c.req.parseBody();
  const query = body.query;

  if (query) {
    const stmt = c.env.DB.prepare(`
      SELECT referensi.*
      FROM referensi
      JOIN referensi_fts ON referensi.name = referensi_fts.name
      WHERE referensi_fts MATCH ?
    `).bind(query);

    const { results } = await stmt.all<Referensi>();
    console.log(results);

    return c.render(
      <div id="search-results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    );
  } else {
    c.status(400);
    return c.json({ error: 'Istilah pencarian tidak ditemukan' });
  }
});

export default app;