/**
 * T3.2 realtime sync. Active only when VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY are configured; otherwise a no-op and the manual
 * Refresh button remains the sync path. Any change triggers a debounced
 * refetch through the caller's normal loaders (no row hand-merging).
 */
export function subscribeToCatalogChanges(onChange: () => void): () => void {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) return () => undefined;

  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cleanup: (() => void) | undefined;

  const schedule = () => {
    if (disposed) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(onChange, 300);
  };

  void (async () => {
    const { createClient } = await import('@supabase/supabase-js');
    if (disposed) return;
    const client = createClient(url, anonKey);
    const channel = client
      .channel('catalog-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, schedule)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, schedule)
      .subscribe();
    cleanup = () => { void client.removeChannel(channel); };
  })();

  return () => {
    disposed = true;
    if (timer) clearTimeout(timer);
    cleanup?.();
  };
}
