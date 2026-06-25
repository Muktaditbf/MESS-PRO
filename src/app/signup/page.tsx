import { redirect } from 'next/navigation';

/** No public signup — redirect to login */
export default function SignupPage() {
  redirect('/login');
}
