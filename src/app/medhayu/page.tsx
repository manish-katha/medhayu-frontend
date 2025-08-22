

import { redirect } from 'next/navigation';

// Redirect the base path to the profile page within this module.
export default function MedhayuRootPage() {
  redirect('/medhayu/profile');
}
