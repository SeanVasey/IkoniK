import { redirect } from 'next/navigation'

// Sign-in moved to /login; this stub keeps old bookmarks working.
export default function AuthPage() {
  redirect('/login')
}
