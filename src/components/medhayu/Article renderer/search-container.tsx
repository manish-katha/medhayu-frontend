
'use client';

import { useFormStatus } from 'react-dom';
import { performSearch } from '@/actions/search.actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Sparkles } from 'lucide-react';
import type { CorpusEntry } from '@/types';
import { Transliterate, TransliterationProvider } from './transliteration-provider';
import { ScriptSwitcher } from './script-switcher';

const initialState = {
  translation: undefined,
  variations: undefined,
  matches: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto shrink-0">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Search
        </>
      )}
    </Button>
  );
}

function SearchResults({ state }: { state: typeof initialState }) {
    const { pending } = useFormStatus();

    if (pending) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground font-medium">Searching the cosmic library...</p>
                <p className="text-sm text-muted-foreground">Translating, generating variations, and consulting ancient texts.</p>
            </div>
        );
    }
    
    if (state?.error && !state.translation) {
        return null;
    }

    if (!state?.translation) {
        return (
            <Card className="text-center bg-transparent border-dashed">
                <CardContent className="p-8">
                    <p className="text-lg text-muted-foreground">Your journey into Sanskrit wisdom begins here.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Transliterate>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Sparkles className="h-6 w-6 text-accent" />
                            AI Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Sanskrit Translation:</h3>
                            <p className="text-xl font-devanagari font-semibold bg-muted p-4 rounded-md">{state.translation}</p>
                        </div>
                        {state.variations && state.variations.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Sentence Variations:</h3>
                            <div className="flex flex-wrap gap-2 font-devanagari">
                            {state.variations.map((v, i) => (
                                <Badge key={i} variant="secondary" className="text-md font-normal p-2">{v}</Badge>
                            ))}
                            </div>
                        </div>
                        )}
                    </CardContent>
                </Card>

                {state.matches && state.matches.length > 0 ? (
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-center">Search Results</h2>
                        {state.matches.map((match: CorpusEntry, index: number) => (
                            <Card key={index} className="overflow-hidden">
                                <CardHeader>
                                    <CardTitle>{match.book}: {match.chapter} - {match.verse}</CardTitle>
                                    <CardDescription>{match.text_english}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xl font-devanagari text-primary">{match.text_sanskrit}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center">
                        <CardContent className="p-8">
                            <p className="text-lg text-muted-foreground">No matches found in the ancient texts for the generated variations.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Transliterate>
    );
}


export function SearchContainer() {
  const [state, formAction] = useActionState(performSearch, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: state.error,
      });
    }
  }, [state?.error, toast]);

  return (
    <TransliterationProvider>
        <form action={formAction} className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Input
                name="query"
                type="search"
                placeholder="e.g., 'What is duty?' or 'कर्म क्या है?'"
                className="flex-grow text-lg p-6"
                required
                />
                <SubmitButton />
            </div>
            {state.translation && (
                <div className="flex justify-end -mb-4">
                    <ScriptSwitcher />
                </div>
            )}
            <SearchResults state={state} />
        </form>
    </TransliterationProvider>
  );
}
