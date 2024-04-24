import { BookCard, SearchForm, renderer } from './components';

import { Hono } from 'hono';
import { apiReference } from '@scalar/hono-api-reference';
import { z } from '@hono/zod-openapi'

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


const ReferensiSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  name: z.string().openapi({ example: 'Referensi 1' }),
  'folder_id': z.string().openapi({ example: '1RCO_AjI3i-nTuXpbTbTGRbRwt2XFaDOl' }),
  'file_id': z.string().openapi({ example: '1JbWVuklNFMGxHR_rGHL_rbG2PF7djF6M' }),
  'download_url': z.string().openapi({ example: 'https://drive.google.com/uc?export=download&id=1JbWVuklNFMGxHR_rGHL_rbG2PF7djF6M' }),
  'category_id': z.number().int().optional().openapi({ example: 2 }),
})

const PaginationSchema = z.object({
  query: z.string().optional().openapi({ description: 'Kata kunci pencarian' }),
  page: z.number().int().default(1).openapi({ description: 'Nomor halaman' }),
  limit: z.number().int().default(10).openapi({ description: 'Jumlah hasil per halaman' }),
})

const app = new Hono<{ Bindings: Bindings }>();

app.get('*', renderer);

app.get('/', async (c) => {
  const { results: books } = await c.env.DB.prepare(`
    SELECT * FROM referensi ORDER BY RANDOM() LIMIT 9;
  `).all<Referensi>();

  const { results: categories } = await c.env.DB.prepare(`
  SELECT * FROM category ORDER BY id;
`).all<{ id: number; name: string }>();
  return c.render(
    <>
      <h1 class="text-3xl font-extrabold sm:text-5xl text-center">
        Cari Referensi{' '}Kutub
        <strong class="font-extrabold sm:block">
           Mahzab <span class="text-blue-600">Syafii</span> dan <span class="text-green-600">Hanbali</span>
        </strong>
      </h1>
      <SearchForm
  onSearch={(query, categoryId) =>
    c.redirect(
      `/search?query=${encodeURIComponent(query)}${
        categoryId ? `&categoryId=${categoryId}` : ''
      }`
    )
  }
  categories={categories}
/>
      <div id="search-results" class="grid grid-cols-1 pt-5 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </>
  );
});




app.post('/search', async (c) => {
  const body = await c.req.parseBody();
  const query = body.query;
  const categoryId = body.categoryId || null;

  if (query) {
    let stmt;
    if (categoryId) {
      stmt = c.env.DB.prepare(`
        SELECT id, * FROM referensi
        WHERE category_id = ? AND name IN (
          SELECT name
          FROM referensi_fts
          WHERE referensi_fts MATCH ?
        )
      `).bind(categoryId, query);
    } else {
      stmt = c.env.DB.prepare(`
        SELECT id, * FROM referensi
        WHERE name IN (
          SELECT name
          FROM referensi_fts
          WHERE referensi_fts MATCH ?
        )
      `).bind(query);
    }

    const { results } = await stmt.all<Referensi>();

    return c.render(
      <div id="search-results" class="grid grid-cols-1 pt-5 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

app.get('/referensi', async (c) => {
  const { query, category, page = 1, limit = 10 } = c.req.query();
  const db = c.env.DB as D1Database;
  const offset = (page - 1) * limit;
  const searchQuery = query ? `%${query}%` : '%';
  const categoryFilter = category ? `AND category_id = ${category}` : '';

  const countQuery = `SELECT COUNT(*) AS total FROM referensi r
                      JOIN category c ON r.category_id = c.id
                      WHERE r.name LIKE ?
                      ${categoryFilter}`;

  const dataQuery = `SELECT r.id, r.name, r.folder_id, r.file_id, r.download_url, c.name AS category_name, r.category_id
                     FROM referensi r
                     JOIN category c ON r.category_id = c.id
                     WHERE r.name LIKE ?
                     ${categoryFilter}
                     ORDER BY r.id LIMIT ? OFFSET ?`;

  try {
    const countResult = await db.prepare(countQuery).bind(searchQuery).first('total');
    const total = countResult ? countResult['total'] : 0;
    const dataResult = await db.prepare(dataQuery).bind(searchQuery, limit, offset).all();
    const data = dataResult.results.map((item) => {
      const { category_id = null, ...rest } = item;
      return ReferensiSchema.parse({ ...rest, category_id });
    });

    return c.json({ data, total, page, limit });
  } catch (error) {
    console.error('Error executing query:', error);
    return c.json({ error: 'Failed to fetch data' }, 500);
  }
});

app.get('/doc', (c) => {
  const swaggerJson = {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Referensi API',
      description: 'API ini memungkinkan Anda untuk mendapatkan daftar referensi buku berdasarkan filter pencarian dan kategori.'
    },
    paths: {
      '/referensi': {
        get: {
          summary: 'Dapatkan daftar referensi',
          description: 'Endpoint ini mengembalikan daftar referensi buku yang sesuai dengan filter pencarian dan kategori yang diberikan. Respons juga mencakup informasi paginasi.',
          parameters: [
            { name: 'query', in: 'query', schema: { type: 'string' }, description: 'Kata kunci pencarian untuk mencari referensi berdasarkan nama buku.' },
            { name: 'category', in: 'query', schema: { type: 'integer' }, description: 'ID kategori untuk menyaring referensi berdasarkan kategori Mahzab, 1 untuk Syafii dan 2 untuk Hanbali.' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Nomor halaman untuk paginasi hasil.' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Jumlah maksimum hasil yang akan dikembalikan per halaman.' },
          ],
          responses: {
            '200': {
              description: 'Respons sukses',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { '$ref': '#/components/schemas/Referensi' },
                        description: 'Daftar referensi yang sesuai dengan filter dan paginasi yang diberikan.'
                      },
                      total: { type: 'integer', description: 'Total jumlah referensi yang sesuai dengan filter.' },
                      page: { type: 'integer', description: 'Nomor halaman saat ini.' },
                      limit: { type: 'integer', description: 'Jumlah maksimum hasil per halaman.' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Referensi: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID unik referensi.' },
            name: { type: 'string', description: 'Nama referensi buku.' },
            'folder_id': { type: 'string', description: 'ID folder tempat file referensi disimpan.' },
            'file_id': { type: 'string', description: 'ID file referensi.' },
            'download_url': { type: 'string', description: 'URL untuk mengunduh file referensi.' },
            'category_id': { type: 'integer', description: 'ID kategori yang terkait dengan referensi.' },
            'category_name': { type: 'string', description: 'Nama kategori yang terkait dengan referensi.' },
          },
        },
      },
    },
  }

  return c.json(swaggerJson)
})

app.get(
  '/reference',
  apiReference({
    pageTitle: 'Referensi API Reference',
    theme: 'purple',
    spec: {
      url: '/doc',
    },
  }),
)

export default app;