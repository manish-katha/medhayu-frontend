

'use server';

import { readJsonFile, writeJsonFile } from '@/lib/db/utils';
import { corpusPath } from '@/lib/db/paths';
import type { Discussion, Answer, ManthanaThread, DebateEntry } from '@/types/discussion';
import path from 'path';

const discussionsFilePath = path.join(corpusPath, 'discussions.json');

export async function getDiscussions(): Promise<Discussion[]> {
    const discussions = await readJsonFile<Discussion[]>(discussionsFilePath, []);
    return discussions.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getDiscussionById(id: string): Promise<Discussion | undefined> {
    const discussions = await getDiscussions();
    return discussions.find(d => d.id === id);
}

export async function addDiscussion(discussionData: Omit<Discussion, 'id' | 'createdAt' | 'answers' | 'views' | 'upvotes' | 'downvotes'>): Promise<Discussion> {
    const discussions = await getDiscussions();
    
    // If the discussion is created from a post, the ID might be the same
    const existingDiscussion = discussions.find(d => d.id === discussionData.id);
    if (existingDiscussion) {
        return existingDiscussion;
    }

    const newDiscussion: Discussion = {
        id: discussionData.id || `disc-${Date.now()}`,
        createdAt: new Date().toISOString(),
        answers: [],
        views: 0,
        upvotes: 0,
        downvotes: 0,
        ...discussionData,
    };
    discussions.unshift(newDiscussion);
    await writeJsonFile(discussionsFilePath, discussions);
    return newDiscussion;
}

export async function addAnswerToDiscussion(discussionId: string, answerData: Omit<Answer, 'id' | 'createdAt' | 'upvotes' | 'downvotes'>): Promise<Answer> {
    const discussions = await getDiscussions();
    const discussionIndex = discussions.findIndex(d => d.id === discussionId);
    if (discussionIndex === -1) {
        throw new Error('Discussion not found');
    }
    
    const newAnswer: Answer = {
        id: `ans-${Date.now()}`,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        ...answerData,
    };
    
    discussions[discussionIndex].answers.push(newAnswer);
    await writeJsonFile(discussionsFilePath, discussions);
    return newAnswer;
}

export async function addManthanaThread(discussionId: string, topic: string, purvapakshaEntry: Omit<DebateEntry, 'id'>): Promise<ManthanaThread> {
    const discussions = await getDiscussions();
    const discussionIndex = discussions.findIndex(d => d.id === discussionId);
    if (discussionIndex === -1) {
        throw new Error('Discussion not found');
    }

    const newThread: ManthanaThread = {
        id: `manthana-${Date.now()}`,
        topic: topic,
        purvapaksha: { ...purvapakshaEntry, id: `purva-${Date.now()}` },
        uttarpaksha: [],
    };

    if (!discussions[discussionIndex].manthana) {
        discussions[discussionIndex].manthana = [];
    }
    
    discussions[discussionIndex].manthana!.push(newThread);
    await writeJsonFile(discussionsFilePath, discussions);
    return newThread;
}

export async function addUttaraPaksha(discussionId: string, threadId: string, uttaraPakshaData: Omit<DebateEntry, 'id'>): Promise<DebateEntry> {
    const discussions = await getDiscussions();
    const discussion = discussions.find(d => d.id === discussionId);
    if (!discussion || !discussion.manthana) {
        throw new Error("Discussion or Manthana thread not found.");
    }

    const thread = discussion.manthana.find(t => t.id === threadId);
    if (!thread) {
        throw new Error("Specific Manthana thread not found.");
    }

    const newEntry: DebateEntry = {
        id: `uttara-${crypto.randomUUID()}`,
        ...uttaraPakshaData,
    };

    thread.uttarpaksha.push(newEntry);
    await writeJsonFile(discussionsFilePath, discussions);
    return newEntry;
}
