import { Account, Client, ID } from "react-native-appwrite";
const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const account = new Account(client);

export async function registerUser(
  email: string,
  password: string,
  name: string
) {
  try {
    const user = await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });
    await loginUser(email, password);
    return user;
  } catch (err) {
    console.error("Register error:", err);
    throw err;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const session = await account.createEmailPasswordSession({
      email: email,
      password: password,
    });
    return session;
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await account.deleteSession({ sessionId: "current" });
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
}
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (err) {
    console.error("Get user error:", err);
    return null;
  }
}
