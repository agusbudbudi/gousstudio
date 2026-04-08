/**
 * Compresses and crops an image to a specific size and ratio (1:1 square).
 * @param file The original image file
 * @param size The target size in pixels (e.g., 400 for 400x400)
 * @param quality Compression quality from 0 to 1
 * @returns A promise that resolves to a compressed Blob
 */
export const compressAndCropImage = (
  file: File,
  size: number = 400,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Set target dimensions
        canvas.width = size;
        canvas.height = size;

        // Calculate cropping (Center Crop)
        let sourceX = 0;
        let sourceY = 0;
        let sourceSize = Math.min(img.width, img.height);

        if (img.width > img.height) {
          sourceX = (img.width - img.height) / 2;
        } else {
          sourceY = (img.height - img.width) / 2;
        }

        // Draw and resize
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          size,
          size
        );

        // Convert to Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Image loading failed"));
    };
    reader.onerror = () => reject(new Error("File reading failed"));
  });
};
