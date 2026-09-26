// functions/api/download.js
// Server-Side Protected Study Material Download Gate
// Unlocks downloads ONLY for orders verified as PAID in D1 / KV

import { getOrder, hasFulfillmentAccess } from '../utils/db.js';
import { loadCatalogue } from '../utils/pricing.js';

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');
    const bookId = url.searchParams.get('book_id');
    const accessToken = url.searchParams.get('access_token');

    if (!orderId || !bookId) {
      return new Response('Missing order_id or book_id parameters.', { status: 400 });
    }

    // 1. Verify order in D1 / KV
    const order = await getOrder(env, orderId);
    if (!order) {
      return new Response('Order not found.', { status: 404 });
    }

    if (!(await hasFulfillmentAccess(order, accessToken))) {
      return new Response('Order access is not authorized.', { status: 403 });
    }

    if (order.status !== 'PAID') {
      return new Response('Payment required. This order has not been confirmed as PAID.', {
        status: 403,
      });
    }

    // 2. Verify book in order items
    const items = Array.isArray(order.items) ? order.items : [];
    const matchingItem = items.find((it) => (it.bookId || it.id) === bookId);
    if (!matchingItem) {
      return new Response('The requested item is not part of this purchased order.', {
        status: 403,
      });
    }

    // 3. Find book details in KV catalogue
    const catalog = await loadCatalogue(env);
    const book = catalog.find((b) => b.id === bookId) || {
      title: matchingItem.title || 'Study Material',
      category: 'Exam Prep',
    };

    if (book.pdfUrl) {
      try {
        const pdfUrl = new URL(book.pdfUrl);
        if (pdfUrl.protocol === 'https:') return Response.redirect(pdfUrl.toString(), 302);
      } catch {}
    }

    // Generate authenticated official PDF response
    const titleClean = (book.title || 'Xylem_Bookstore_Material').replace(/[^a-zA-Z0-9]/g, '_');
    const escapePdfText = (value) => String(value || '').replace(/[\\()\r\n]/g, (char) => {
      if (char === '\\') return '\\\\';
      if (char === '(') return '\\(';
      if (char === ')') return '\\)';
      return ' ';
    });
    const pdfTitle = escapePdfText(book.title);
    const pdfCategory = escapePdfText(book.category || 'Certification');
    const licensee = escapePdfText(order.customer_email || order.customer_name || 'Verified Student');
    const pdfContent = `%PDF-1.4
%
1 0 obj
<< /Title (${pdfTitle} - Xylem Bookstore Official Exam Guide)
   /Author (Xylem Bookstore Academic Editorial Board)
   /Subject (${book.category || 'Exam'} Preparation)
   /Keywords (IELTS, OET, PTE, German, Mock Test, Study Guide)
   /Creator (Xylem Bookstore Publishing Engine)
>>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595 842] /Contents 5 0 R >>
endobj
5 0 obj
<< /Length 280 >>
stream
BT
/F1 24 Tf
50 750 Td
(XYLEM BOOKSTORE OFFICIAL MATERIAL) Tj
/F1 16 Tf
0 -40 Td
(${pdfTitle}) Tj
/F1 12 Tf
0 -30 Td
(Licensed to: ${licensee}) Tj
0 -20 Td
(Category: ${pdfCategory} | Edition 2026) Tj
0 -20 Td
(Status: VERIFIED PAID) Tj
0 -20 Td
(Security Identifier: ${order.id}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000220 00000 n 
0000000267 00000 n 
0000000326 00000 n 
0000000415 00000 n 
trailer
<< /Size 6 /Root 2 0 R /Info 1 0 R >>
startxref
750
%%EOF`;

    return new Response(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${titleClean}_XylemBookstore.pdf"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    return new Response('Error retrieving download.', { status: 500 });
  }
}
