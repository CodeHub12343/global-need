import { connectDB } from '@/lib/db';
import { ok, serverError } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const conn = await connectDB();
    const state = conn.connection.readyState; // 1 = connected
    const dbName = conn.connection.name;
    return ok({ db: dbName, connectionState: state, time: new Date().toISOString() });
  } catch (err) {
    return serverError(err);
  }
}
