import { supabase } from './supabase.js';

export async function createOrder(orderData) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      total_amount: orderData.totalAmount,
      status: 'pending'
    }])
    .select()
    .maybeSingle();

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw itemsError;
  }

  return order;
}
