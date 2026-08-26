import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = memoryStore.getSession(id);

  if (!session) {
    return NextResponse.json(
      { error: `Report ${id} not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json(session);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const deleted = memoryStore.deleteSession(id);

  if (!deleted) {
    return NextResponse.json(
      { error: `Report ${id} not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: `Report ${id} deleted.` });
}
