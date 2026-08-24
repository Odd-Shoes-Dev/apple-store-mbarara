import { UploadedFile } from "../domain/types";

export interface StorageProvider {
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<UploadedFile>;
  delete(key: string): Promise<void>;
}
