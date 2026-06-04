/* =========================
   LOCALITY AUTH SERVICE
   Supabase Auth wrapper.
========================= */

(function () {
  function getClient() {
    if (!window.LocalitySupabase) {
      console.error("LocalitySupabase client is not available.");
      return null;
    }

    return window.LocalitySupabase;
  }

  async function getCurrentUser() {
    const supabase = getClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.warn("Unable to get current user:", error.message);
      return null;
    }

    return data.user || null;
  }

  async function getCurrentSession() {
    const supabase = getClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.warn("Unable to get current session:", error.message);
      return null;
    }

    return data.session || null;
  }

  async function signUpWithEmail(email, password) {
    const supabase = getClient();
    if (!supabase) return { data: null, error: "Supabase client missing." };

    return await supabase.auth.signUp({
      email,
      password
    });
  }

  async function signInWithEmail(email, password) {
    const supabase = getClient();
    if (!supabase) return { data: null, error: "Supabase client missing." };

    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  async function signOut() {
    const supabase = getClient();
    if (!supabase) return { error: "Supabase client missing." };

    return await supabase.auth.signOut();
  }

  window.LocalityAuthService = {
    getCurrentUser,
    getCurrentSession,
    signUpWithEmail,
    signInWithEmail,
    signOut
  };
})();
