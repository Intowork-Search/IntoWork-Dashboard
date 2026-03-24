import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion — INTOWORK Search',
  description: 'Connectez-vous à votre espace professionnel INTOWORK',
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
