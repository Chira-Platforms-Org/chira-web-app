(function () {
  if (!window.supabase) {
    console.error("Supabase library not loaded.");
    return;
  }

  const config = window.LocalitySupabaseConfig;

  if (!config?.url || !config?.anonKey) {
    console.error("Missing Locality Supabase config.");
    return;
  }

  window.LocalitySupabase = window.supabase.createClient(
    config.url,
    config.anonKey
  );

  console.log("Locality Supabase client connected.");
})();
