import type { ReactNode } from "react";

// Sehr kleiner, sicherer Markdown-Renderer: Absaetze, ## Ueberschriften, - Listen,
// **fett**, [Text](URL). Kein HTML-Passthrough, keine dangerouslySetInnerHTML.

function renderInline(text: string, keyPrefix: string, nofollow = false): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      const href = m[2];
      const external = href.startsWith("http");
      out.push(
        <a key={`${keyPrefix}-a${i++}`} href={href} target={external ? "_blank" : undefined} rel={external ? (nofollow ? "nofollow noopener" : "noopener") : undefined}>
          {m[1]}
        </a>,
      );
    } else if (m[3]) {
      out.push(<strong key={`${keyPrefix}-b${i++}`}>{m[3]}</strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Content({ text, nofollow = false }: { text: string; nofollow?: boolean }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  const nodes: ReactNode[] = [];
  blocks.forEach((block, bi) => {
    const lines = block.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim() !== "");
    if (lines.length === 0) return;
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      nodes.push(
        <ul key={`ul${bi}`}>
          {lines.map((l, li) => (
            <li key={li}>{renderInline(l.replace(/^[-*]\s+/, ""), `l${bi}-${li}`, nofollow)}</li>
          ))}
        </ul>,
      );
      return;
    }
    lines.forEach((line, li) => {
      const key = `p${bi}-${li}`;
      if (line.startsWith("### ")) nodes.push(<h3 key={key}>{renderInline(line.slice(4), key, nofollow)}</h3>);
      else if (line.startsWith("## ")) nodes.push(<h2 key={key}>{renderInline(line.slice(3), key, nofollow)}</h2>);
      else if (line.startsWith("# ")) nodes.push(<h2 key={key}>{renderInline(line.slice(2), key, nofollow)}</h2>);
      else if (line.startsWith("> ")) nodes.push(<blockquote key={key}>{renderInline(line.slice(2), key, nofollow)}</blockquote>);
      else if (/^[-*]\s+/.test(line))
        nodes.push(
          <ul key={key}>
            <li>{renderInline(line.replace(/^[-*]\s+/, ""), key, nofollow)}</li>
          </ul>,
        );
      else nodes.push(<p key={key}>{renderInline(line, key, nofollow)}</p>);
    });
  });
  return <div className={nofollow ? "prose-bw prose-nofollow" : "prose-bw"}>{nodes}</div>;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
