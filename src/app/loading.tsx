import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div>
        <Button disabled size="sm">
        <Spinner data-icon="inline-start" />
        Loading...
      </Button>
    </div>
  )
}