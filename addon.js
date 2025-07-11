const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

const manifest = {
  id: "org.rob.anilist.adult",
  version: "1.0.0",
  name: "Anilist Adult Anime",
  description: "Adult anime catalogus op basis van Anilist",
  resources: ["catalog"],
  types: ["series"],
  catalogs: [
    {
      type: "series",
      id: "anilist_adult",
      name: "Adult Anime (18+)"
    }
  ]
};

const builder = new addonBuilder(manifest);

const query = `
query {
  Page(perPage: 20) {
    media(type: ANIME, isAdult: true, sort: POPULARITY_DESC) {
      id
      title { romaji }
      coverImage { extraLarge }
      description(asHtml: false)
    }
  }
}
`;

builder.defineCatalogHandler(async ({ type, id }) => {
  if (type !== "series" || id !== "anilist_adult") return { metas: [] };

  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    if (!res.ok) throw new Error("Anilist API error: " + res.status);

    const json = await res.json();
    const items = json?.data?.Page?.media || [];

    const metas = items.map(item => ({
      id: "anilist:" + item.id,
      type: "series",
      name: item.title.romaji,
      poster: item.coverImage.extraLarge,
      description: (item.description || "").replace(/<[^>]*>/g, "").slice(0, 400)
    }));

    return { metas };
  } catch (err) {
    console.error("❌ Fout in catalogHandler:", err);
    return { metas: [] };
  }
});

// ✅ Specifieke export voor Vercel Serverless Functions
const handler = builder.getInterface();

// Nodig voor Vercel (Node.js handler)
module.exports = (req, res) => {
  return handler(req, res);
};
