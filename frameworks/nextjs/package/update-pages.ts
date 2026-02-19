"use server"

import { updateTag } from "next/cache";

export async function updatePages(tags: string[]) {
    await Promise.all(tags.map((tag: string) => updateTag(tag)));
}