import { useRef, useState } from "react";

export function ImageUpload({ value, onChange, label = "Bild (optional)" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: form });
      const j = (await r.json()) as { ok: boolean; url?: string; error?: string };
      if (j.ok && j.url) onChange(j.url);
      else setErr(j.error ?? "Upload fehlgeschlagen");
    } catch {
      setErr("Upload fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        {value ? (
          <img src={value} alt="" className="h-20 w-32 rounded-lg border border-line object-cover" />
        ) : (
          <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink-3">Kein Bild</div>
        )}
        <div className="flex flex-wrap gap-2">
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-white disabled:opacity-50">
            {busy ? "Lädt hoch…" : value ? "Anderes Foto wählen" : "Foto hochladen"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="rounded-full px-4 py-2 text-sm text-ink-3 hover:text-rot">
              Entfernen
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-3">JPG, PNG oder WebP, maximal 6 MB. Querformat wirkt am besten.</p>
      {err && <p className="mt-2 text-sm text-rot">{err}</p>}
    </div>
  );
}
