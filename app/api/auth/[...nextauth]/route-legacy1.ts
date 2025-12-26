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
    async jwt({ token, user, trigger }) {
      // Si es login inicial, guardar datos del usuario
      if (user) {
        token.sub = user.id;
        token.tier = user.tier;
        token.email = user.email;
      }

      // CRÍTICO: Si se solicita actualizar la sesión, consultar BD
      // Esto se ejecuta cuando llamamos a /api/auth/session?update=1
      if (trigger === 'update' || !token.tier) {
        console.log('🔄 JWT callback: Updating tier from database for user:', token.sub);
        
        if (token.sub) {
          try {
            const { data: profile, error } = await supabaseAdmin
              .from('user_profiles')
              .select('tier, name')
              .eq('id', token.sub)
              .single();

            if (!error && profile) {
              console.log('✅ JWT callback: Found tier in DB:', profile.tier);
              token.tier = profile.tier || 'free';
              token.name = profile.name;
            } else {
              console.log('❌ JWT callback: Error fetching profile:', error);
            }
          } catch (err) {
            console.error('❌ JWT callback: Exception fetching profile:', err);
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.tier = token.tier as string;
        session.user.name = token.name as string;
        
        console.log('📋 Session callback: Tier =', token.tier);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
