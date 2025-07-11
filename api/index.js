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
      body: JSON.stri
