import { ImageKit } from "@imagekit/nodejs";
import { StorageProvider } from "../../ports/StorageProvider";
import { UploadedFile } from "../../domain/types";

export class ImageKitStorageProvider implements StorageProvider {
  private readonly client: ImageKit;
  private readonly folder: string;

  constructor(privateKey: string, appFolder: string) {
    this.client = new ImageKit({ privateKey });
    this.folder = `/${appFolder}/products`;
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<UploadedFile> {
    const file = await ImageKit.toFile(buffer, filename, { type: mimeType });

    const result = await this.client.files.upload({
      file,
      fileName: filename,
      folder: this.folder,
    });

    if (!result.url || !result.fileId) {
      throw new Error("ImageKit upload did not return a url/fileId");
    }

    return { url: result.url, key: result.fileId };
  }

  async delete(key: string): Promise<void> {
    await this.client.files.delete(key);
  }
}
