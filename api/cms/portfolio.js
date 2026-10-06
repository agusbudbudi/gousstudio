import { createClient } from "@supabase/supabase-js";
import { list, del } from "@vercel/blob";

const BLOB_PREFIX = 'portfolio/';
// Skip recent blobs: they may be uploaded in a modal but not yet saved (e.g. another tab).
const ORPHAN_MIN_AGE_MS = 60 * 60 * 1000;

async function cleanupOrphanedBlobs(supabase) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  const { data: rows, error } = await supabase
    .from('portfolios')
    .select('image')
    .not('image', 'is', null);
  if (error) throw error;

  const referenced = new Set(rows.map(r => r.image));
  const cutoff = Date.now() - ORPHAN_MIN_AGE_MS;
  const orphans = [];

  let cursor;
  do {
    const page = await list({ prefix: BLOB_PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      if (!referenced.has(blob.url) && new Date(blob.uploadedAt).getTime() < cutoff) {
        orphans.push(blob.url);
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  if (orphans.length > 0) {
    await del(orphans);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { data } = req.body;
  const { 
    SUPABASE_URL, 
    VITE_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY, 
    CMS_PASSWORD, 
  } = process.env;

  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;
  const effectivePassword = CMS_PASSWORD;

  const cookies = (req.headers.cookie || '').split(';');
  let cmsToken = null;
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=');
    if (name === 'cms_token') {
      cmsToken = decodeURIComponent(rest.join('='));
      break;
    }
  }

  if (!effectivePassword || cmsToken !== effectivePassword) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!effectiveUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Server configuration missing (Supabase credentials)' });
  }

  const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. Flatten the data from { [serviceId]: [items] } to [items].
    //    The group key is the service id ("none" = no service); order_index is the position within the service.
    const flatData = Object.entries(data).flatMap(([serviceKey, items]) =>
      items.map((item, index) => ({
        ...(item.id ? { id: item.id } : {}),
        title: item.title,
        description: item.description,
        service_id: serviceKey === 'none' ? null : parseInt(serviceKey, 10),
        tags: item.tags || [],
        imgalt: item.imgalt || item.imgAlt || '',
        linkurl: item.linkurl || item.linkUrl || '',
        image: item.image,
        role: item.role,
        tools: item.tools || [],
        order_index: index,
        pricelist_id: (item.pricelist_id && String(item.pricelist_id).trim() !== "" && String(item.pricelist_id) !== "null") ? parseInt(item.pricelist_id, 10) : null
      }))
    );

    // Fetch existing logic to find deleted ones
    const { data: existingPortfolios, error: fetchError } = await supabase
      .from('portfolios')
      .select('id');
      
    if (fetchError) throw fetchError;

    const existingIds = existingPortfolios.map(p => p.id);
    const incomingIds = flatData.map(p => p.id).filter(Boolean);
    const deletedIds = existingIds.filter(id => !incomingIds.includes(id));

    // 2. Delete missing items
    if (deletedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('portfolios')
        .delete()
        .in('id', deletedIds);

      if (deleteError) throw deleteError;
    }

    const itemsToUpdate = flatData.filter(item => item.id);
    const itemsToInsert = flatData.filter(item => !item.id);

    // 3. Update existing items
    if (itemsToUpdate.length > 0) {
      const updatePromises = itemsToUpdate.map(async (item) => {
        const { id, ...updateData } = item;
        const { error } = await supabase
          .from('portfolios')
          .update(updateData)
          .eq('id', id);
        if (error) throw error;
      });
      await Promise.all(updatePromises);
    }

    // 4. Insert new items
    if (itemsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('portfolios')
        .insert(itemsToInsert);
      if (insertError) throw insertError;
    }

    // 5. Remove orphaned blobs (replaced images, deleted items, abandoned uploads).
    // Best-effort: a cleanup failure must not fail the save.
    try {
      await cleanupOrphanedBlobs(supabase);
    } catch (cleanupError) {
      console.error('Blob cleanup error:', cleanupError);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('CMS Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
