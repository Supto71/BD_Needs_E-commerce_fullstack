import { NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    
    let updateData: any = { ...data };
    if (data.subcategories) {
      updateData.subcategories = {
        deleteMany: {},
        create: data.subcategories.map((s: string) => ({
          name: s.trim(),
          slug: s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          isFeatured: (data.featuredSubcategories || []).includes(s.trim())
        }))
      };
    }
    
    // Remove featuredSubcategories from updateData to prevent Prisma errors on Category model
    delete updateData.featuredSubcategories;
    
    const updated = await updateCategory(id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    revalidatePath('/', 'layout');
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const success = await deleteCategory(id);
    if (!success) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
