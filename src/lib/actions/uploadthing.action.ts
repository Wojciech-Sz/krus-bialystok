"use server";

import { utapi } from "@/server/uploadthing";

export const deleteFile = async (key: string) => {
  await utapi.deleteFiles(key);
};
