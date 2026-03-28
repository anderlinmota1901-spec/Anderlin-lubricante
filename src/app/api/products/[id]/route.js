import { NextResponse } from 'next/server';
import { getSupabaseServerClient, getSupabaseServerAdminClient } from '../../../../lib/supabaseServer';

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

export async function GET(_request, { params }) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(mapRow(data));
  } catch (error) {
    console.error('[products:id][GET]', error);
    return NextResponse.json({ error: 'No se pudo cargar el producto' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = getSupabaseServerAdminClient();
    const payload = await request.json();
    const { id } = await params;
    const updates = {
      name: payload.name?.trim(),
      description: payload.description?.trim() ?? '',
      category: payload.category?.trim() ?? '',
      price: Number(payload.price ?? 0),
      image: payload.image ?? '',
      features: normalizeFeatures(payload.features),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from(TABLE_NAME)
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(mapRow(data));
  } catch (error) {
    console.error('[products:id][PUT]', error);
    return NextResponse.json({ error: 'No se pudo actualizar el producto' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const admin = getSupabaseServerAdminClient();
    const { id } = await params;
    const { error } = await admin.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[products:id][DELETE]', error);
    return NextResponse.json({ error: 'No se pudo eliminar el producto' }, { status: 500 });
  }
}
