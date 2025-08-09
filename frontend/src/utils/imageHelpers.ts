// src/utils/imageHelpers.ts

/**
 * 🔥 Cloudinary URL'lerini HD kalite için optimize eder
 */
export const getOptimizedImageUrl = (imageUrl?: string, width?: number, height?: number): string => {
  // Eğer resim URL'si yoksa placeholder döndür
  if (!imageUrl) {
    return `https://placehold.co/${width || 400}x${height || 400}?text=No+Image`;
  }

  // Eğer Cloudinary URL'si değilse orijinal URL'yi döndür
  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  try {
    // Cloudinary transformation parametreleri ekle
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return imageUrl;

    // HD kalite transformasyonları
    const transformations = [
      'q_auto:best',    // En yüksek kalite
      'f_auto',         // En uygun format
      'dpr_auto',       // Device pixel ratio
      'fl_progressive'  // Progressive loading
    ];

    // Boyut ekle (isteğe bağlı)
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (width && height) transformations.push('c_fill,g_auto');

    // Transformation string'ini URL'ye ekle
    const transformationString = transformations.join(',');
    const newPathParts = [...pathParts];
    newPathParts.splice(uploadIndex + 1, 0, transformationString);
    
    return `${url.protocol}//${url.host}${newPathParts.join('/')}`;
  } catch (error) {
    console.warn('Image optimization error:', error);
    return imageUrl;
  }
};

/**
 * 🛍️ Product Card için optimize edilmiş resim URL'si
 */
export const getProductCardImageUrl = (imageUrl?: string): string => {
  return getOptimizedImageUrl(imageUrl, 400, 400);
};

/**
 * 🔍 Product Detail için optimize edilmiş resim URL'si
 */
export const getProductDetailImageUrl = (imageUrl?: string, size: 'thumbnail' | 'main' = 'main'): string => {
  if (size === 'thumbnail') {
    return getOptimizedImageUrl(imageUrl, 100, 100);
  }
  return getOptimizedImageUrl(imageUrl, 800, 800);
};