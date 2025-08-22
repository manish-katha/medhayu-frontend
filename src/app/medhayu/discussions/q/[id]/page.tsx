

import { getDiscussionById } from '@/services/discussion.service';
import { notFound } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import QuestionDetail from '@/components/discussions/QuestionDetail';
import { getUserProfile } from '@/services/user.service';
import { use } from 'react';

interface QuestionPageProps {
  params: { id: string };
}

export default async function QuestionPage({ params: paramsProp }: QuestionPageProps) {
  const params = use(paramsProp);
  const [discussion, currentUser] = await Promise.all([
    getDiscussionById(params.id),
    getUserProfile() // In a real app, this would get the logged-in user
  ]);
  
  if (!discussion || !currentUser) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      <Breadcrumb className="mb-4 flex-shrink-0">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/medhayu/wall">Discussions</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{discussion.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex-1 overflow-y-auto pr-4 -mr-4">
        <QuestionDetail initialDiscussion={discussion} currentUser={currentUser} />
      </div>
    </div>
  );
}
