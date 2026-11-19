import { Suspense } from 'react'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'

type SuccessProps = {
  searchParams: Promise<{ session_id?: string }>
}

async function SuccessContent({ searchParams }: SuccessProps) {
  await connection()
  const { session_id } = await searchParams

  if (!session_id) redirect('/')

  const checkout = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent'],
  })

  const customerEmail =
    checkout.customer_details?.email ?? checkout.customer_email

  if (checkout.status === 'open') redirect('/')

  if (checkout.status === 'complete') {
    return (
      <section id="success">
        <p>
          We appreciate your business! A confirmation email will be sent to{' '}
          {customerEmail}. If you have any questions, please email{' '}
          <a href="mailto:orders@example.com">orders@example.com</a>.
        </p>
      </section>
    )
  }

  return <p>Payment status: {checkout.status}</p>
}

export default function Success({ searchParams }: SuccessProps) {
  return (
    <Suspense fallback={<p>Confirming your payment...</p>}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  )
}