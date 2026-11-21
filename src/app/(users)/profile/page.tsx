import { Suspense } from "react";

import { requireSession } from "@/lib/session";
import { PageHeading } from "../components/dashboard-ui";
import ProfileForm from "./ProfileForm";

async function ProfileContent() {
  const session = await requireSession();

  return (
    <ProfileForm
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        image: session.user.image,
        phone: session.user.phone,
        area: session.user.area,
        bio: session.user.bio,
      }}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div
      className="grid gap-4 md:grid-cols-[300px_1fr]"
      role="status"
      aria-label="Loading profile"
    >
      <div className="h-96 animate-pulse rounded-xl bg-white" />
      <div className="h-96 animate-pulse rounded-xl bg-white" />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Profile"
        description="Your details appear on the bookings you make or the services you publish."
      />
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
