import Loading from "@/components/Loading";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@/services/auth";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Profile = () => {
  // Global states
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Signup form states
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Fetch current user
  const fetchUser = async () => {
    try {
      setLoading(true);
      const current = await getCurrentUser();
      setUser(current);
    } catch {
      setGeneralError("Failed to fetch user. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const validateLogin = () => {
    const errors: typeof loginErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!loginEmail.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(loginEmail))
      errors.email = "Invalid email format";

    if (!loginPassword.trim()) errors.password = "Password is required";
    else if (loginPassword.length < 6)
      errors.password = "Password must be at least 6 characters long";

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignup = () => {
    const errors: typeof signupErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!signupName.trim()) errors.name = "Name is required";
    if (!signupEmail.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(signupEmail))
      errors.email = "Invalid email address";

    if (!signupPassword.trim()) errors.password = "Password is required";
    else if (signupPassword.length < 6)
      errors.password = "Password must be at least 6 characters";

    if (!signupConfirm.trim())
      errors.confirmPassword = "Please confirm your password";
    else if (signupConfirm !== signupPassword)
      errors.confirmPassword = "Passwords do not match";

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAuth = async () => {
    setGeneralError(null);
    if (authMode === "login" && !validateLogin()) return;
    if (authMode === "signup" && !validateSignup()) return;

    try {
      setLoading(true);
      if (authMode === "signup") {
        await registerUser(
          signupEmail.trim(),
          signupPassword.trim(),
          signupName.trim()
        );
      } else {
        await loginUser(loginEmail.trim(), loginPassword.trim());
      }

      await fetchUser();

      // Reset both forms
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirm("");
      setLoginEmail("");
      setLoginPassword("");
    } catch (error: any) {
      let message = "Authentication failed. Please try again.";
      if (error?.message?.includes("invalid credentials"))
        message = "Invalid email or password.";
      if (error?.message?.includes("already exists"))
        message = "An account with this email already exists.";
      setGeneralError(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
    } catch {
      setGeneralError("Failed to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading screen
  if (loading) {
    <Loading />;
  }

  //  Logged-in screen
  if (user) {
    return (
      <View className="flex-1 justify-center items-center bg-primary px-8">
        <Text className="text-light-100 mb-4 text-lg font-semibold">
          Welcome, {user.name || user.email}
        </Text>

        {generalError && (
          <Text className="text-red-500 mb-3 text-center">{generalError}</Text>
        )}

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-accent px-6 py-3 rounded-lg w-full mt-3"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  //  Auth form (Login or Signup)
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-8">
          <Text className="text-light-100 text-2xl font-bold mb-6 text-center">
            {authMode === "signup" ? "Create Account" : "Welcome Back"}
          </Text>

          {generalError && (
            <Text className="text-red-500 text-center mb-4">
              {generalError}
            </Text>
          )}

          {authMode === "signup" ? (
            <>
              <TextInput
                placeholder="Name"
                placeholderTextColor="#A8B5DB"
                value={signupName}
                onChangeText={setSignupName}
                className="w-full border border-light-300 bg-secondary rounded-lg p-3 mb-1 text-light-100"
              />
              {signupErrors.name && (
                <Text className="text-red-500 mb-3">{signupErrors.name}</Text>
              )}

              <TextInput
                placeholder="Email"
                placeholderTextColor="#A8B5DB"
                value={signupEmail}
                onChangeText={setSignupEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full border border-light-300 bg-secondary rounded-lg p-3 mb-1 mt-4 text-light-100"
              />
              {signupErrors.email && (
                <Text className="text-red-500 mb-3">{signupErrors.email}</Text>
              )}

              <TextInput
                placeholder="Password"
                placeholderTextColor="#A8B5DB"
                secureTextEntry
                value={signupPassword}
                onChangeText={setSignupPassword}
                className="w-full border border-light-300 bg-secondary rounded-lg p-3 mb-1 mt-4 text-light-100"
              />
              {signupErrors.password && (
                <Text className="text-red-500 mb-3">
                  {signupErrors.password}
                </Text>
              )}

              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#A8B5DB"
                secureTextEntry
                value={signupConfirm}
                onChangeText={setSignupConfirm}
                className="w-full border border-light-300 bg-secondary rounded-lg p-3 mb-1 mt-4 text-light-100"
              />
              {signupErrors.confirmPassword && (
                <Text className="text-red-500 mb-3">
                  {signupErrors.confirmPassword}
                </Text>
              )}
            </>
          ) : (
            <>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#A8B5DB"
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full border border-light-300 bg-secondary rounded-lg p-3 mb-1 mt-4 text-light-100"
              />
              {loginErrors.email && (
                <Text className="text-red-500 mb-3">{loginErrors.email}</Text>
              )}

              <TextInput
                placeholder="Password"
                placeholderTextColor="#A8B5DB"
                secureTextEntry
                value={loginPassword}
                onChangeText={setLoginPassword}
                className="w-full border border-light-300 bg-secondary rounded-lg p-3 mb-1 mt-4 text-light-100"
              />
              {loginErrors.password && (
                <Text className="text-red-500 mb-3">
                  {loginErrors.password}
                </Text>
              )}
            </>
          )}

          <TouchableOpacity
            onPress={handleAuth}
            activeOpacity={0.8}
            className="bg-accent py-3 rounded-lg mt-4"
          >
            <Text className="text-white text-center font-semibold text-base">
              {authMode === "signup" ? "Sign Up" : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setAuthMode(authMode === "signup" ? "login" : "signup")
            }
            activeOpacity={0.7}
            className="mt-4"
          >
            <Text className="text-light-200 text-center">
              {authMode === "signup"
                ? "Already have an account? "
                : "Don't have an account? "}
              <Text className="text-accent font-semibold">
                {authMode === "signup" ? "Log in" : "Sign up"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Profile;
