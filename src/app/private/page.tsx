import { Lock } from "lucide-react";

export default function PrivatePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold">Private Demo</h1>
        <p className="text-muted-foreground max-w-sm">
          This demo is private and requires an access token.
        </p>
      </div>
    </div>
  );
}
