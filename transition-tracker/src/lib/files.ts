/** Saves a generated file. In the Claude Artifact preview, downloads go through the `downloads` capability. */
interface DownloadsApi {
  save(arg: { filename: string; data: string | Blob | ArrayBuffer }): Promise<unknown>;
}

export async function saveFile(filename: string, data: string, mime: string): Promise<'saved' | 'cancelled'> {
  try {
    const claude = (window as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
    if (claude?.use) {
      const dl = (await claude.use('downloads')) as DownloadsApi | null;
      if (dl) {
        await dl.save({ filename, data });
        return 'saved';
      }
    }
  } catch {
    return 'cancelled';
  }
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'saved';
}
