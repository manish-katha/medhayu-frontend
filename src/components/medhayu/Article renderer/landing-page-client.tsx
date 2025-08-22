
'use client';

import React from 'react';
import Link from 'next/link';
import { OmIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BookText, Users, GitBranch, Wind, NotebookText } from 'lucide-react';
import LottiePlayer from './lottie-player';
import animationData from '../../Lotties/Man with book and hearts.json';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Leverage state-of-the-art AI for grammar checking, translation, and citation extraction to accelerate your research.',
  },
  {
    icon: BookText,
    title: 'Rich Content Editor',
    description: 'Create complex documents with support for footnotes, citations, tables, and multiple Sanskrit text types.',
  },
  {
    icon: Users,
    title: 'Collaborative Circles',
    description: 'Form private groups to share work, discuss findings, and collaborate with fellow scholars and students.',
  },
  {
    icon: GitBranch,
    title: 'Evolve Your Thoughts',
    description: 'Transform simple posts from The Wall into structured articles, white papers, or book chapters.',
  },
  {
    icon: NotebookText,
    title: 'Living Document Reader',
    description: 'Experience texts with multi-pane layouts, interactive glossary highlighting, and personal notes.',
  },
  {
    icon: Wind,
    title: 'Drift & Spark',
    description: 'Start a "Drift" to evolve content independently, or leave a "Spark" to share a quick insight on any post.',
  },
];

const LandingHeader = () => (
    <header className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
                <OmIcon className="h-8 w-8 text-primary" />
                <span className="font-headline text-2xl font-bold">MEDHAYU</span>
            </div>
            <Button asChild variant="outline">
                <Link href="/login">Login / Sign Up</Link>
            </Button>
        </div>
    </header>
);

const HeroSection = () => (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 landing-page-bg z-0"></div>
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
             <div className="relative z-10 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                    The Digital Sabha for <br />
                    <span className="animated-gradient-text">Modern Scholars</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto md:mx-0 text-lg md:text-xl text-muted-foreground">
                    Unite ancient wisdom with modern technology. MEDHAYU is an AI-powered platform for collaborative research, authoring, and the profound exploration of Sanskrit literature.
                </p>
                <div className="mt-10">
                    <Button asChild size="lg" className="text-lg py-7 px-10 rounded-full shadow-lg">
                        <Link href="/login">Get Started Free</Link>
                    </Button>
                </div>
            </div>
             <div className="relative z-10 hidden md:flex justify-center items-center">
                <LottiePlayer animationData={animationData} />
            </div>
        </div>
    </section>
);

const FeaturesSection = () => (
    <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
                 <h2 className="text-3xl md:text-4xl font-bold">A New Era of Scholarly Work</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    MEDHAYU integrates everything you need to research, write, and collaborate on a single, powerful platform.
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <div
                        key={feature.title}
                    >
                         <Card className="h-full bg-card/50 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center gap-4">
                                 <div className="p-3 bg-primary/10 rounded-full">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const CtaSection = () => (
    <section className="py-20 md:py-28">
        <div className="container mx-auto text-center">
             <h2 className="text-3xl md:text-4xl font-bold">Begin Your Scholarly Journey Today</h2>
            <p className="mt-4 text-lg text-muted-foreground">Join a community of researchers and unlock a new dimension of study.</p>
            <Button asChild size="lg" className="mt-8 text-lg py-7 px-10 rounded-full shadow-lg">
                <Link href="/login">Start for Free</Link>
            </Button>
        </div>
    </section>
);

const LandingFooter = () => (
    <footer className="border-t py-8">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} MEDHAYU. All Rights Reserved.</p>
            <div className="flex justify-center gap-4 mt-4">
                <Link href="#" className="hover:text-primary">Terms of Service</Link>
                <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            </div>
        </div>
    </footer>
)

export function LandingPageClient() {
    return (
        <div className="bg-background text-foreground">
            <LandingHeader />
            <main>
                <HeroSection />
                <FeaturesSection />
                <CtaSection />
            </main>
            <LandingFooter />
        </div>
    );
}
