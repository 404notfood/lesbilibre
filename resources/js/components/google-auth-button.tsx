export default function GoogleAuthButton() {
    return (
        <a href="/auth/google" className="mb-5 flex min-h-11 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Continuer avec Google
        </a>
    );
}
