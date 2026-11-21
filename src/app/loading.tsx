import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className="flex h-full w-full items-center justify-center">
        <Button disabled size="sm">
        <Spinner data-icon="inline-start" />
        Loading...
      </Button>
    </div>
  )
}