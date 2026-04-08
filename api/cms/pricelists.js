import { createClient } from "@supabase/supabase-js";

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
    VITE_CMS_PASSWORD 
  } = process.env;

  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;
  const effectivePassword = CMS_PASSWORD || VITE_CMS_PASSWORD;

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
    // 1. Prepare the data
    const flatData = data.map((item, index) => ({
      ...(item.id ? { id: item.id } : {}),
      slug: item.slug,
      category: item.category,
      servicename: item.servicename,
      description: item.description,
      retailprice: item.retailprice,
      finalprice: item.finalprice,
      duration: item.duration,
      isrevisionunlimited: item.isrevisionunlimited,
      totalrevision: item.totalrevision,
      deliverables: item.deliverables || [],
      order_index: index,
      is_show_to_customer: item.is_show_to_customer ?? item.isShowToCustomer ?? false,
    }));

    // Fetch existing IDs to find deleted items
    const { data: existingItems, error: fetchError } = await supabase
      .from('pricelists')
      .select('id');
      
    if (fetchError) throw fetchError;

    const existingIds = existingItems.map(p => p.id);
    const incomingIds = flatData.map(p => p.id).filter(Boolean);
    const deletedIds = existingIds.filter(id => !incomingIds.includes(id));

    // 2. Delete missing items
    if (deletedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('pricelists')
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
          .from('pricelists')
          .update(updateData)
          .eq('id', id);
        if (error) throw error;
      });
      await Promise.all(updatePromises);
    }

    // 4. Insert new items
    if (itemsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('pricelists')
        .insert(itemsToInsert);
      if (insertError) throw insertError;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('CMS Pricelist Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
