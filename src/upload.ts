import { createWriteStream } from "fs";
var gcpStorage = require("@google-cloud/storage");

const storage = new gcpStorage.Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEYFILE,
});

const bucketName = process.env.GCP_BUCKET_NAME;

const uploadDir = "uploads";

const storeUpload = async (createReadStream: any, filename: string): Promise<any> => {
  const path = `${uploadDir}/${filename}`;

  return new Promise((resolve, reject) =>
    createReadStream()
      .pipe(createWriteStream(path))
      .on("finish", () => resolve({ path }))
      .on("error", reject)
  );
};

export const processUpload = async (upload: any) => {
  const { createReadStream, filename } = await upload;

  const { path } = await storeUpload(createReadStream, filename);
  return path;
};

export const uploadFileToStorage = async (file: any, destination: string) => {
  if (!file) {
    return;
  }

  const bucket = storage.bucket(bucketName);

  const { createReadStream, filename } = await file.originFileObj;

  const gcpFileName = `${Date.now()}-${filename}`;
  const bucketFile = bucket.file(destination + "/" + gcpFileName);

  const writeStream = bucketFile.createWriteStream({
    resumable: false,
    gzip: true,
  });

  const uploadPath = `https://storage.googleapis.com/${bucketName}/${destination}/${gcpFileName}`;

  return new Promise((resolve, reject) =>
    createReadStream()
      .pipe(writeStream)
      .on("finish", () => resolve(uploadPath))
      .on("error", reject)
  );
};

export const deleteFileFromStorage = (file: string) => {
  // Deletes file from the bucket
  const fileResponse = storage.bucket(bucketName).file(file);

  fileResponse.exists(function (err: Error, exists: any) {
    if (exists) {
      fileResponse
        .delete()
        .then(() => {
          console.log(`gs://${bucketName}/${file} deleted.`);
        })
        .catch((err: Error) => {
          console.error("Erro:", err);
        });
    }

    console.log("Err: ", err, exists);
  });
};

