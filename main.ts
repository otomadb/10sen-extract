import { DOMParser } from "jsr:@b-fuze/deno-dom";

const years = [
  2008,
  2009,
  2010,
  2011,
  2012,
  2013,
  2014,
  2015,
  2016,
  2017,
  2018,
  2019,
  2020,
  2021,
  2022,
  2023,
  2024,
];

const dat: Record<
  number,
  {
    count: number;
    url: string | null;
    title: string;
    type: ReturnType<typeof estimateType>;
  }[]
> = {};

for (const year of years) {
  const url = `http://oto10.s602.xrea.com/10sen/${year}-r.html`;
  const t = await fetch(url).then((b) => b.text());
  const a = new DOMParser().parseFromString(t, "text/html")!;
  const dds = a.querySelectorAll("tr");

  const recs: (typeof dat)[number] = [];

  for (const dd of dds) {
    const tds = dd.querySelectorAll("td");

    const z0 = tds[0].textContent.trim();

    if (!/^\d+$/.test(z0)) continue;

    const href =
      (tds[1].querySelector("a")?.attributes.getNamedItem("href")?.value
        .trim()) ||
      null;
    const vurl = normalizeVUrl(href);

    recs.push({
      count: parseInt(z0, 10),
      url: vurl,
      title: tds[2].textContent.trim(),
      type: estimateType(vurl),
    });
  }

  dat[year] = recs;
}

function normalizeVUrl(vurl: string | null): string | null {
  if (vurl === null) return null;

  // 2011年『膳(Big_blue) 』
  if (vurl === "http://www.nicovideo.jp/tag/Big_blue") {
    return "https://www.nicovideo.jp/watch/sm13274282";
  }

  // 2010年『ヤマザキ春のTimepiece pan まIIり』
  if (vurl === "http://www.nicovideo.jp/watch/1270563585") {
    return "https://www.nicovideo.jp/watch/sm27116924";
  }

  // 2010年『アレミミズ』（詳細不明）
  if (vurl === "http://www.nicovideo.jp/watch/1286180411") return null;

  if (/^sm\d+$/.test(vurl)) {
    return `https://www.nicovideo.jp/watch/${vurl}`;
  }

  return vurl;
}

function estimateType(
  vurl: string | null,
):
  | "niconico"
  | "nicovideo-live"
  | "youtube"
  | "twitter"
  | "bilibili"
  | "soundcloud"
  | "linevoom"
  | "unknown" {
  if (vurl === null) return "unknown";

  switch (new URL(vurl).host) {
    case "www.nicovideo.jp":
      return "niconico";

    case "live.nicovideo.jp":
      return "nicovideo-live";

    case "www.youtube.com":
    case "m.youtube.com":
    case "youtu.be":
      return "youtube";

    case "twitter.com":
    case "www.twitter.com":
    case "x.com":
      return "twitter";

    case "bilibili.com":
    case "www.bilibili.com":
      return "bilibili";

    case "soundcloud.com":
      return "soundcloud";

    case "linevoom.line.me":
      return "linevoom";

    default:
      return "unknown";
  }
}

await Deno.writeFile(
  "pages/data.json",
  new TextEncoder().encode(JSON.stringify(dat)),
);
