import { NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseServerAdminClient } from '../../../lib/supabaseServer';

const TABLE_NAME = 'products';

const normalizeFeatures = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const mapRow = (row) => ({
  id: row.id,
  name: row.name ?? '',
  description: row.description ?? '',
  category: row.category ?? '',
  price: Number(row.price ?? 0),
  image: row.image ?? '',
  features: normalizeFeatures(row.features),
  created_at: row.created_at ?? null,
  updated_at: row.updated_at ?? null,
});

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json((data ?? []).map(mapRow));
  } catch (error) {
    console.error('[products][GET]', error);
    return NextResponse.json({ error: 'No se pudieron cargar los productos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const required = ['name', 'category'];
    const missing = required.filter((field) => {
      const value = payload[field];
      return typeof value !== 'string' || !value.trim();
    });

    if (missing.length) {
      return NextResponse.json(
        { error: `Campos faltantes: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const admin = getSupabaseServerAdminClient();
    const now = new Date().toISOString();

    const insertPayload = {
      name: payload.name.trim(),
      description: (payload.description ?? '').trim(),
      category: (payload.category ?? '').trim(),
      price: Number(payload.price ?? 0),
      image: payload.image ?? '',
      features: normalizeFeatures(payload.features),
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await admin
      .from(TABLE_NAME)
      .insert(insertPayload)
      .select('*')
      .single();

    if (error || !data) {
      throw error || new Error('Insert failed');
    }

    return NextResponse.json(mapRow(data), { status: 201 });
  } catch (error) {
    console.error('[products][POST]', error);
    return NextResponse.json(
      { error: error?.message ?? 'No se pudo crear el producto' },
      { status: 500 }
    );
  }
}
