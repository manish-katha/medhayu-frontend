
'use server';

// This file is being deprecated as the login logic is now directly
// handled within the `loginUser` function in `auth.actions.ts`.
// This simplifies the flow and removes an unnecessary layer.
// It is kept to prevent breaking any remaining imports but will be removed in a future refactor.

export async function login(): Promise<any> {
    return { success: false, error: "This function is deprecated." };
}
