import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import Head from "next/head";
import { NextPage } from "next";

const AdminLogin: NextPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);

    if (!result || result.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/admin/products");
  };

  return (
    <>
      <Head>
        <title>Admin Login</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm space-y-4"
        >
          <h1 className="text-2xl font-semibold text-gray-900">Admin Login</h1>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 text-white rounded-md py-2 hover:bg-slate-900 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </>
  );
};

export default AdminLogin;
