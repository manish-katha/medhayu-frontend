
'use client';

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import KnowledgeBaseItem from '@/components/KnowledgeBase/KnowledgeBaseItem';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const knowledgeBaseData = [
  {
    id: 'kb-001',
    title: 'Standard Operating Procedure for Panchakarma',
    type: 'sop',
    description: 'A detailed SOP for conducting Vamana, Virechana, and Basti therapies, including pre and post-procedure care.',
    dateAdded: '2023-01-15',
    author: 'Dr. Sharma',
    tags: ['Panchakarma', 'SOP', 'Detox'],
    approvedBy: 'Dr. Gupta',
    usageCount: 12,
  },
  {
    id: 'kb-002',
    title: 'Diet Protocol for Pitta Dosha Imbalance',
    type: 'diet',
    description: 'A comprehensive dietary plan focusing on cooling and sweet foods to pacify aggravated Pitta dosha.',
    dateAdded: '2023-02-20',
    author: 'Dr. Priya',
    tags: ['Diet', 'Pitta', 'Nutrition'],
    approvedBy: 'Dr. Sharma',
    usageCount: 25,
  },
  {
    id: 'kb-003',
    title: 'Classical Reference: Charaka Samhita on Jwara Chikitsa',
    type: 'classical',
    description: 'Excerpts and interpretations from the Charaka Samhita regarding the diagnosis and treatment of various types of fevers (Jwara).',
    dateAdded: '2023-03-10',
    author: 'Research Team',
    tags: ['Charaka Samhita', 'Jwara', 'Fever'],
    approvedBy: 'Dr. Sharma',
    usageCount: 42,
  },
  {
    id: 'kb-004',
    title: 'Case Study: Successful Management of Amavata',
    type: 'case-study',
    description: 'A documented case study showing the successful treatment of Rheumatoid Arthritis (Amavata) using a combination of Langhana, Deepana, and specific herbal formulations.',
    dateAdded: '2023-04-05',
    author: 'Dr. Verma',
    tags: ['Amavata', 'Rheumatoid Arthritis', 'Case Study'],
    approvedBy: 'Dr. Sharma',
    usageCount: 8,
  },
];

const KnowledgeBasePage = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">
            A centralized repository of Ayurvedic knowledge and clinical protocols.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search knowledge base..." className="pl-8" />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Entry
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="sop">SOPs</TabsTrigger>
          <TabsTrigger value="diet">Diet Protocols</TabsTrigger>
          <TabsTrigger value="classical">Classical References</TabsTrigger>
          <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {knowledgeBaseData
          .filter(item => activeTab === 'all' || item.type === activeTab)
          .map(item => (
            <KnowledgeBaseItem key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
