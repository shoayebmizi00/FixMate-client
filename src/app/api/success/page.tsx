
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'


export default async function Success({ searchParams } : { searchParams: { session_id?: string } }) {
  const { session_id } = await searchParams

  if (!session_id)
    throw new Error('Please provide a valid session_id (`cs_test_...`)')

  const checkout = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  })
  const { status } = checkout
  const customerEmail =
    checkout.customer_details?.email ?? checkout.customer_email

  if (status === 'open') {
    return redirect('/')
  }

  if (status === 'complete') {
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
}