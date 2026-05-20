import app from '../server/app';
import { seedIfEmpty } from '../server/seed';

let booted = false;

export default async function handler(req: any, res: any) {
  if (!booted) {
    const dbUrl = process.env.SUPABASE_DB_URL || '';
    const jwtSecret = process.env.JWT_SECRET || '';

    console.log('[boot] DB URL set:', !!dbUrl, '| DB host:', dbUrl ? new URL(dbUrl).hostname : 'MISSING');
    console.log('[boot] JWT_SECRET set:', !!jwtSecret);

    if (!dbUrl) {
      res.status(500).json({ error: 'Server misconfiguration: database URL is not set. Add SUPABASE_DB_URL to Vercel environment variables.' });
      return;
    }
    if (!jwtSecret) {
      res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET is not set. Add JWT_SECRET to Vercel environment variables.' });
      return;
    }

    try {
      await seedIfEmpty();
      booted = true;
      console.log('[boot] Database initialized successfully');
    } catch (err: any) {
      console.error('[boot] Database initialization failed:', err.message);
      res.status(500).json({ error: 'Database connection failed: ' + err.message });
      return;
    }
  }
  app(req, res);
}
