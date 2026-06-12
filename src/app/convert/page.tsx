import { redirect } from 'next/navigation'

// The convert experience moved to /studio; this stub keeps old bookmarks
// and installed-PWA entry points working.
export default function ConvertPage() {
  redirect('/studio')
}
