import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const useGalleryItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error: queryError } = await supabase
        .from('gallery')
        .select('gallery_id, title, subtitle, description, image_url, display_order')
        .order('display_order', { ascending: true });

      if (cancelled) return;

      if (queryError) {
        console.error('Gallery fetch failed:', queryError.message);
        setError(queryError);
      } else {
        setItems(data ?? []);
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
};

export default useGalleryItems;