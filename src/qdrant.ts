import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { Document } from "langchain/document";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import archive from "../archiwum.json";
import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const __dirname = path.resolve();

dotenv.config();

export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  maxConcurrency: 5,
});

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
});

const COLLECTION_NAME = "search_task";

const indexed = (await qdrantClient.getCollections()).collections.find(
  (collection) => collection.name === COLLECTION_NAME
);

if (!indexed) {
  await qdrantClient.createCollection(COLLECTION_NAME, {
    vectors: { size: 1536, distance: "Cosine", on_disk: true },
  });
}

const collectionDetails = await qdrantClient.getCollection(COLLECTION_NAME);

if (!collectionDetails.points_count) {
  const chat = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const loader = new JSONLoader(path.join(__dirname, "archiwum.json"), "/info");

  const documents = (await loader.loadAndSplit()).map((document) => {
    return new Document({ pageContent: document.pageContent });
  });

  const documentsWithMetadata = documents.slice(0, 300).map((doc) => {
    doc.metadata.source = COLLECTION_NAME;
    doc.metadata.content = doc.pageContent;
    doc.metadata.id = uuidv4();
    doc.metadata.url = archive.find(
      (item) => item.info === doc.pageContent
    )?.url;
    return doc;
  });

  const points = [];
  for (const document of documentsWithMetadata) {
    const [embeding] = await embeddings.embedDocuments([document.pageContent]);
    points.push({
      id: document.metadata.id,
      payload: document.metadata,
      vector: embeding,
    });
  }

  await qdrantClient.upsert(COLLECTION_NAME, {
    wait: true,
    batch: {
      ids: points.map((point) => point.id),
      vectors: points.map((point) => point.vector),
      payloads: points.map((point) => point.payload),
    },
  });
}
