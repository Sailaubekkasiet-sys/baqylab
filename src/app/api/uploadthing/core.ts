import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
    courseAttachment: f({ blob: { maxFileSize: "32MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const session = await getServerSession(authOptions);
            if (!session) throw new Error("Unauthorized");
            return { userId: (session.user as any)?.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("file url", file.url);
            return { uploadedBy: metadata.userId, url: file.url };
        }),

    editorImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const session = await getServerSession(authOptions);
            if (!session) throw new Error("Unauthorized");
            return { userId: (session.user as any)?.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId, url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
