import { supabase } from './supabase'

export interface ShippingInfo {
  name: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  country: string
}

export interface OrderLineItem {
  productId: string
  title: string
  price_cents: number
  quantity: number
  image?: string
}

/**
 * Creates an order and its line items in Supabase.
 * Line items snapshot title/price so historical orders are not affected by
 * future product edits.
 *
 * Returns the created order row on success, throws on error.
 *
 * TODO: Move this to a Supabase Edge Function to make both inserts atomic
 *       (a server-side transaction so a partial failure can't leave an order
 *        with no items).
 */
export async function createOrder(
  userId: string,
  items: OrderLineItem[],
  shipping: ShippingInfo,
  totalCents: number,
) {
  // 1. Insert order row
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        user_id: userId,
        status: 'pending',
        total_cents: totalCents,
        shipping,
        metadata: { item_count: items.length },
      },
    ])
    .select()
    .single()

  if (orderError) throw new Error(orderError.message)

  // 2. Insert order_items snapshot
  const lineItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.productId,
    title: i.title,
    price_cents: i.price_cents,
    quantity: i.quantity,
    metadata: { image: i.image ?? null },
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(lineItems)

  if (itemsError) {
    // TODO: If items insert fails, roll back by deleting the order row
    //       until a proper Edge Function transaction is in place.
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error(itemsError.message)
  }

  return order
}
