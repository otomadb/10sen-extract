import {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

const pageUrls = [
  "http://oto10.s602.xrea.com/10sen/2008-r.html",
  "http://oto10.s602.xrea.com/10sen/2009-r.html",
  "http://oto10.s602.xrea.com/10sen/2010-r.html",
  "http://oto10.s602.xrea.com/10sen/2011-r.html",
  "http://oto10.s602.xrea.com/10sen/2012-r.html",
  "http://oto10.s602.xrea.com/10sen/2013-r.html",
  "http://oto10.s602.xrea.com/10sen/2014-r.html",
  "http://oto10.s602.xrea.com/10sen/2015-r.html",
  "http://oto10.s602.xrea.com/10sen/2016-r.html",
  "http://oto10.s602.xrea.com/10sen/2017-r.html",
  "http://oto10.s602.xrea.com/10sen/2018-r.html",
  "http://oto10.s602.xrea.com/10sen/2019-r.html",
  "http://oto10.s602.xrea.com/10sen/2020-r.html",
  "http://oto10.s602.xrea.com/10sen/2021-r.html",
  "http://oto10.s602.xrea.com/10sen/2022-r.html",
  "http://oto10.s602.xrea.com/10sen/2023-r.html",
  "http://oto10.s602.xrea.com/10sen/2024-r.html",
];

const vurls = await Promise.all(
  pageUrls.map(async (url) => {
    const b = await fetch(url);
    const t = await b.text();
    const doc = new DOMParser().parseFromString(t, "text/html")!;
    const qq = doc.querySelectorAll("#content_block_1 a");

    return [...qq]
      .map((e) => {
        const vurl = (e as Element).attributes
          .getNamedItem("href")!
          .value.trim();

        // 2011年『膳(Big_blue) 』
        if (vurl === "http://www.nicovideo.jp/tag/Big_blue")
          return "https://www.nicovideo.jp/watch/sm13274282";

        // 2010年『ヤマザキ春のTimepiece pan まIIり』
        if (vurl === "http://www.nicovideo.jp/watch/1270563585")
          return "https://www.nicovideo.jp/watch/sm27116924";

        // 2010年『アレミミズ』（詳細不明）
        if (vurl === "http://www.nicovideo.jp/watch/1286180411") return null;

        if (/^sm\d+$/.test(vurl))
          return `https://www.nicovideo.jp/watch/${vurl}`;

        return vurl;
      })
      .filter((e): e is string => e !== null)
      .map((u) => {
        const p = new URL(u);
        if (p.protocol === "http:") p.protocol = "https:";
        return p.toString();
      });
  })
).then((t) => t.reduce((a, b) => [...b, ...a], [] as string[]).toSorted());

await Deno.writeFile(
  "pages/data.json",
  new TextEncoder().encode(JSON.stringify(vurls))
);
