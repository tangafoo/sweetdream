import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

function bucket(): string {
  return process.env.R2_BUCKET_NAME ?? "";
}

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}

function getClient(): S3Client {
  if (!r2Configured()) {
    throw new Error("R2 is not configured (R2_ACCOUNT_ID / keys / bucket missing)");
  }
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

export async function presignPut(key: string, contentType: string): Promise<string> {
  return getSignedUrl(
    getClient(),
    new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType }),
    { expiresIn: 60 },
  );
}

export async function headObject(
  key: string,
): Promise<{ exists: boolean; sizeBytes: number; contentType: string; etag: string }> {
  try {
    const res = await getClient().send(
      new HeadObjectCommand({ Bucket: bucket(), Key: key }),
    );
    return {
      exists: true,
      sizeBytes: res.ContentLength ?? 0,
      contentType: res.ContentType ?? "",
      etag: res.ETag ?? "",
    };
  } catch {
    return { exists: false, sizeBytes: 0, contentType: "", etag: "" };
  }
}

/**
 * Move an object out of the lifecycle-expired `reviews/incoming/` prefix into
 * the permanent `reviews/` prefix. Returns the permanent key.
 *
 * `etag` pins the copy to the exact bytes that were verified and moderated:
 * the presigned PUT URL stays valid for 60s, so without If-Match an attacker
 * could overwrite the object between moderation and promotion (TOCTOU). A
 * changed object makes the copy fail with 412 PreconditionFailed.
 */
export async function promoteObject(incomingKey: string, etag: string): Promise<string> {
  const permanentKey = incomingKey.replace(/^reviews\/incoming\//, "reviews/");
  await getClient().send(
    new CopyObjectCommand({
      Bucket: bucket(),
      CopySource: `${bucket()}/${incomingKey}`,
      CopySourceIfMatch: etag,
      Key: permanentKey,
    }),
  );
  return permanentKey;
}

export async function deleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await getClient().send(
    new DeleteObjectsCommand({
      Bucket: bucket(),
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    }),
  );
}
