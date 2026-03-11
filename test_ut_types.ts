import { createUploadthing } from "uploadthing/next";
const f = createUploadthing();
const r = f({ blob: { maxFileSize: "32MB", maxFileCount: 1 } });
console.log(r);
