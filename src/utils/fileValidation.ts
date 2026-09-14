export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export async function validateFile(file: File): Promise<string | null> {
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_FILE_SIZE)
    return "Please choose a file smaller than 10 MB.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["pdf", "txt"].includes(extension || ""))
    return "Only PDF and TXT documents are supported.";
  const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  if (
    extension === "pdf" &&
    !new TextDecoder().decode(bytes.slice(0, 5)).startsWith("%PDF-")
  )
    return "This file does not appear to be a valid PDF.";
  if (extension === "txt" && bytes.includes(0))
    return "This file does not appear to be plain text.";
  return null;
}
export function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}
export function displayFilename(name: string) {
  return name.replace(/^[0-9a-f-]{36}_/i, "");
}
