/* =========================
   LOCALITY PROFILE MEDIA SERVICE
   Supabase Storage uploads for logo, banner, and gallery images.
========================= */

(function () {
  const BUCKET_NAME = "locality-profile-media";

  function getClient() {
    if (!window.LocalitySupabase) {
      console.error("LocalitySupabase client is not available.");
      return null;
    }

    return window.LocalitySupabase;
  }

  async function getCurrentUser() {
    if (!window.LocalityAuthService?.getCurrentUser) {
      console.error("LocalityAuthService is not available.");
      return null;
    }

    return await window.LocalityAuthService.getCurrentUser();
  }

  function sanitizeFileName(fileName = "upload") {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 120);
  }

  function getFileExtension(fileName = "") {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop() : "jpg";
  }

  async function uploadBusinessProfileMedia({ file, businessProfileId, mediaType }) {
    const supabase = getClient();
    const user = await getCurrentUser();

    if (!supabase || !user) {
      return { data: null, error: "No authenticated user." };
    }

    if (!file) {
      return { data: null, error: "No file selected." };
    }

    if (!businessProfileId) {
      return { data: null, error: "Missing business profile id." };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      return {
        data: null,
        error: "Please upload a JPG, PNG, WEBP, or GIF image."
      };
    }

    const maxSizeMb = 5;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return {
        data: null,
        error: `Image must be smaller than ${maxSizeMb} MB.`
      };
    }

    const extension = getFileExtension(file.name);
    const safeName = sanitizeFileName(file.name);
    const filePath = `${user.id}/${businessProfileId}/${mediaType}/${Date.now()}-${safeName || `image.${extension}`}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      data: {
        url: publicUrlData.publicUrl,
        path: filePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        media_type: mediaType,
        uploaded_at: new Date().toISOString()
      },
      error: null
    };
  }

  window.LocalityProfileMediaService = {
    uploadBusinessProfileMedia
  };
})();
