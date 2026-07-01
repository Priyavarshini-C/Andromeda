// =============================================================================
// Andromeda — Orders API Route Handler (GET and POST)
// =============================================================================

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  carts,
  products,
  sellers,
  notifications,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  successResponse,
  unauthorized,
  validationError,
  serverError,
} from "@/lib/api-responses";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const userId = session.user.id;
    const role = session.user.role;

    if (role === "seller") {
      // 1. Fetch seller profile first
      const sellerProfile = await db
        .select({ id: sellers.id })
        .from(sellers)
        .where(eq(sellers.userId, userId))
        .limit(1);

      if (sellerProfile.length === 0) {
        return successResponse([]);
      }

      const sellerId = sellerProfile[0].id;

      // 2. Fetch orders placed with this seller
      const sellerOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.sellerId, sellerId))
        .orderBy(desc(orders.createdAt));

      // Fetch items for each order
      const ordersWithItems = await Promise.all(
        sellerOrders.map(async (order: any) => {
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));
          return {
            ...order,
            shippingAddress: JSON.parse(order.shippingAddress),
            items,
          };
        })
      );

      return successResponse(ordersWithItems);
    } else {
      // Fetch orders placed by this customer
      const customerOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));

      const ordersWithItems = await Promise.all(
        customerOrders.map(async (order: any) => {
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));
          return {
            ...order,
            shippingAddress: JSON.parse(order.shippingAddress),
            items,
          };
        })
      );

      return successResponse(ordersWithItems);
    }
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const userId = session.user.id;

    let body;
    try {
      body = await request.json();
    } catch {
      return validationError({ body: ["Invalid JSON body"] });
    }

    const { shippingAddress, paymentMethod = "COD" } = body;
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.phone) {
      return validationError({ shippingAddress: ["Incomplete shipping address details"] });
    }

    // 1. Fetch current cart items joined with product info
    const cartItemsList = await db
      .select({
        cart: carts,
        product: products,
      })
      .from(carts)
      .innerJoin(products, eq(carts.productId, products.id))
      .where(eq(carts.userId, userId));

    if (cartItemsList.length === 0) {
      return validationError({ cart: ["Your shopping cart is empty"] });
    }

    // 2. Validate stock for all items
    for (const item of cartItemsList) {
      if (item.product.stock < item.cart.quantity) {
        return validationError({
          stock: [`Product "${item.product.title}" only has ${item.product.stock} items left in stock.`],
        });
      }
    }

    // 3. Group cart items by sellerId to support per-seller order creation
    const itemsBySeller: Record<string, typeof cartItemsList> = {};
    for (const item of cartItemsList) {
      const sid = item.product.sellerId;
      if (!itemsBySeller[sid]) itemsBySeller[sid] = [];
      itemsBySeller[sid].push(item);
    }

    const createdOrderIds: string[] = [];

    // 4. Run order creation transaction
    await db.transaction(async (tx: any) => {
      for (const [sellerId, items] of Object.entries(itemsBySeller) as [string, any[]][]) {
        const subtotal = items.reduce((sum: number, item: any) => sum + item.product.price * item.cart.quantity, 0);
        const shipping = subtotal > 1000 ? 0 : 99;
        const total = subtotal + shipping;

        // Insert order
        const [newOrder] = await tx
          .insert(orders)
          .values({
            userId,
            sellerId,
            status: "pending",
            paymentStatus: "pending",
            paymentMethod,
            subtotal,
            shippingAmount: shipping,
            totalAmount: total,
            shippingAddress: JSON.stringify(shippingAddress),
          })
          .returning({ id: orders.id });

        createdOrderIds.push(newOrder.id);

        // Insert order items & decrement stock
        for (const item of items) {
          await tx.insert(orderItems).values({
            orderId: newOrder.id,
            productId: item.product.id,
            productTitle: item.product.title,
            productImage: item.product.thumbnailUrl,
            productSku: item.product.sku,
            quantity: item.cart.quantity,
            unitPrice: item.product.price,
            totalPrice: item.product.price * item.cart.quantity,
          });

          // Decrement stock
          await tx
            .update(products)
            .set({ stock: item.product.stock - item.cart.quantity })
            .where(eq(products.id, item.product.id));
        }

        // Trigger notification
        await tx.insert(notifications).values({
          userId,
          title: "Order Placed Successfully",
          message: `Your order of ${formatCurrency(total)} has been submitted. Order ID: ${newOrder.id}.`,
          type: "order",
        });
      }

      // Clear cart items for this user
      await tx.delete(carts).where(eq(carts.userId, userId));
    });

    return successResponse({ success: true, orderIds: createdOrderIds }, null, 201);
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return serverError();
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
