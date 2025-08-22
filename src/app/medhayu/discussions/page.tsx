
// This file is no longer needed as the discussion list is integrated into the wall.
// Keeping it to prevent build errors until all references are updated, then it can be deleted.
import { getDiscussions } from '@/services/discussion.service';
import DiscussionList from '@/components/discussions/DiscussionList';

export default async function DiscussionsPage() {
  const discussions = await getDiscussions();

  return (
    <div className="medhayu-module-container space-y-6">
      <DiscussionList initialDiscussions={discussions} />
    </div>
  );
}
