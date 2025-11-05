import { Client, Databases, ID, Query } from "react-native-appwrite";
import { getCurrentUser } from "./auth";

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const FAVORITES_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID!;

export async function addFavorite(movie: MovieDetails) {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be logged in to favorite a movie");

  const docId = ID.unique();
  const data = {
    user_id: user.$id,
    movie_id: movie.id.toString(),
    title: movie.title,
    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    // createdAt: new Date().toISOString(),
  };

  return await databases.createDocument(
    DATABASE_ID,
    FAVORITES_COLLECTION_ID,
    docId,
    data
  );
}

export async function removeFavorite(movieId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be logged in");

  const res = await databases.listDocuments(
    DATABASE_ID,
    FAVORITES_COLLECTION_ID,
    [
      Query.equal("user_id", user.$id),
      Query.equal("movie_id", movieId.toString()),
    ]
  );

  if (res.documents.length > 0) {
    await databases.deleteDocument(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      res.documents[0].$id
    );
  }
}

export async function getUserFavorites() {
  const user = await getCurrentUser();
  if (!user) return [];

  // Get all favorites for current user, newest first
  const res = await databases.listDocuments(
    DATABASE_ID,
    FAVORITES_COLLECTION_ID,
    [
      Query.equal("user_id", user.$id), // Only current user's favorites
      Query.orderDesc("created_at"), // Newest favorites first
    ]
  );

  return res.documents;
}

export async function isFavorite(movieId: string) {
  const user = await getCurrentUser();
  if (!user) return false;

  // Check if this user has this movie in favorites
  const res = await databases.listDocuments(
    DATABASE_ID,
    FAVORITES_COLLECTION_ID,
    [
      Query.equal("user_id", user.$id),
      Query.equal("movie_id", movieId.toString()),
    ]
  );

  return res.documents.length > 0; // True if found, false if not
}
