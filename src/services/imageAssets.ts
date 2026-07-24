import { decode } from "base64-arraybuffer";
import { getSupabaseClient } from "../lib/supabase";

export interface LocalImageAsset {
  uri: string;
  base64?: string | null;
}

export interface UploadedListingImage {
  publicUrl: string;
  storagePath: string;
}

export function validateListingImages(imageUris: string[]): string[] {
  if (imageUris.length === 0) {
    return ["至少上传 1 张商品照片"];
  }

  if (imageUris.length > 9) {
    return ["最多上传 9 张商品照片"];
  }

  return [];
}

export function getImageExtension(localUri: string): "jpg" | "png" {
  return localUri.toLowerCase().endsWith(".png") ? "png" : "jpg";
}

export async function uploadListingImage(userId: string, localUri: string, base64: string): Promise<UploadedListingImage> {
  const extension = getImageExtension(localUri);
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from("listing-images").upload(path, decode(base64), {
    contentType: extension === "png" ? "image/png" : "image/jpeg",
    upsert: false
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
  return {
    publicUrl: data.publicUrl,
    storagePath: path
  };
}

export async function uploadListingImages(userId: string, images: LocalImageAsset[]): Promise<UploadedListingImage[]> {
  const validationErrors = validateListingImages(images.map((image) => image.uri));

  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const uploadedImages: UploadedListingImage[] = [];

  try {
    for (const image of images) {
      if (!image.base64) {
        throw new Error("图片缺少上传数据，请重新选择照片");
      }

      uploadedImages.push(await uploadListingImage(userId, image.uri, image.base64));
    }
  } catch (error) {
    await removeUploadedListingImages(uploadedImages).catch(() => undefined);
    throw error;
  }

  return uploadedImages;
}

export async function removeUploadedListingImages(images: UploadedListingImage[]): Promise<void> {
  if (images.length === 0) {
    return;
  }

  const { error } = await getSupabaseClient()
    .storage
    .from("listing-images")
    .remove(images.map((image) => image.storagePath));

  if (error) {
    throw error;
  }
}
