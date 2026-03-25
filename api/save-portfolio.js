import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { data, password } = req.body;
  const { 
    SUPABASE_URL, 
    VITE_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY, 
    CMS_PASSWORD, 
    VITE_CMS_PASSWORD 
  } = process.env;

  const effectiveUrl = SUPABASE_URL || VITE_SUPABASE_URL;
  const effectivePassword = CMS_PASSWORD || VITE_CMS_PASSWORD;

  if (!effectivePassword || password !== effectivePassword) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!effectiveUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Server configuration missing (Supabase credentials)' });
  }

  const supabase = createClient(effectiveUrl, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. Flatten the data from { category: [items] } to [items]
    const flatData = Object.entries(data).flatMap(([category, items]) => 
      items.map((item, index) => ({ 
        title: item.title,
        description: item.description,
        category: category,
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

    // 2. Clear existing portfolios (using a more robust filter to delete all)
    const { error: deleteError } = await supabase
      .from('portfolios')
      .delete()
      .not('id', 'is', null); // This correctly targets all rows with an ID

    if (deleteError) throw deleteError;

    // 3. Insert new items
    if (flatData.length > 0) {
      const { error: insertError } = await supabase
        .from('portfolios')
        .insert(flatData);

      if (insertError) throw insertError;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('CMS Error:', error);
    return res.status(500).json({ message: error.message });
  }
}
