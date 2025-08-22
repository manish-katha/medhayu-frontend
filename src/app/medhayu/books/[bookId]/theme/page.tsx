
import { getBookContent } from "@/services/book.service";
import { getThemeForBook, getDefaultTheme } from "@/services/theme.service";
import { notFound } from "next/navigation";
import { BookThemeEditor } from "@/components/theme/BookThemeEditor";
import { BookThemeProvider } from "@/components/theme/BookThemeContext";
import { TransliterationProvider } from "@/components/transliteration-provider";
import { use } from "react";

export default async function BookThemeEditorPage(props: { params: { bookId: string } }) {
  const params = use(props.params);
  const bookId = params.bookId;
  if (!bookId) {
    notFound();
  }

  const [bookContent, initialTheme, defaultTheme] = await Promise.all([
    getBookContent(bookId),
    getThemeForBook(bookId),
    getDefaultTheme()
  ]);

  if (!bookContent) {
    notFound();
  }

  const themeToLoad = initialTheme.bookId === 'default' ? { ...initialTheme, bookId } : initialTheme;
  
  return (
    <TransliterationProvider>
        <BookThemeProvider theme={themeToLoad}>
            <BookThemeEditor
                initialTheme={themeToLoad}
                defaultTheme={defaultTheme}
                bookContent={bookContent}
            />
        </BookThemeProvider>
    </TransliterationProvider>
  );
}
