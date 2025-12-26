import NextAuth from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseAdmin } from '@/lib/supabase/server';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          return null;
        }

        // Get user profile
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        return {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name,
          tier: profile?.tier || 'free',
        };
      },
    }),
  ],
pages: {
  signIn: '/auth/signin',
},
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;  // ← IMPORTANTE: Asignar ID al token
        token.tier = user.tier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;  // ← IMPORTANTE: Pasar ID a la sesión
        session.user.tier = token.tier as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };