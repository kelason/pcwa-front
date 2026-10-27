import { getApiBaseUrl } from '../../api';
import { authHeaders } from '../lib/authToken';
import { throwIfNotOk } from '../lib/apiError';

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export const UploadServices = {
  validateImage: (file: File): string | null => {
    if (!ALLOWED.includes(file.type)) return 'Only PNG, JPEG or WebP images are allowed.';
    if (file.size > MAX_BYTES) return 'Image exceeds 5 MB.';
    return null;
  },

  uploadProductImage: async (file: File): Promise<string> => {
    const problem = UploadServices.validateImage(file);
    if (problem) throw new Error(problem);
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(`${getApiBaseUrl()}/uploads/product-image`, {
      method: 'POST', headers: { ...authHeaders() }, body: form,
    });
    await throwIfNotOk(response, 'Image upload failed');
    const data = (await response.json()) as { url: string };
    return data.url;
  },
};
