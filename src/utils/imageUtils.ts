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

/**
 * Compresses and crops an image to a specific rectangular size (non-square).
 * Centers the crop based on aspect ratio.
 * @param file The original image file
 * @param width Target width in pixels
 * @param height Target height in pixels
 * @param quality Compression quality from 0 to 1 (ignored for PNG)
 * @param outputFormat MIME type for output — 'image/jpeg' or 'image/png'. Defaults to 'image/jpeg'
 * @returns A promise that resolves to a compressed Blob
 */
export const compressAndCropImageRect = (
  file: File,
  width: number,
  height: number,
  quality: number = 0.85,
  outputFormat: "image/jpeg" | "image/png" = "image/jpeg"
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

        canvas.width = width;
        canvas.height = height;

        const targetRatio = width / height;
        const imgRatio = img.width / img.height;

        let sourceX = 0;
        let sourceY = 0;
        let sourceW = img.width;
        let sourceH = img.height;

        if (imgRatio > targetRatio) {
          // Image is wider than target — crop sides
          sourceW = img.height * targetRatio;
          sourceX = (img.width - sourceW) / 2;
        } else {
          // Image is taller than target — crop top/bottom
          sourceH = img.width / targetRatio;
          sourceY = (img.height - sourceH) / 2;
        }

        ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          },
          outputFormat,
          outputFormat === "image/png" ? undefined : quality
        );
      };
      img.onerror = () => reject(new Error("Image loading failed"));
    };
    reader.onerror = () => reject(new Error("File reading failed"));
  });
};
