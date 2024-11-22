import Order from '../models/order.model.js';

export const createCheckoutSession = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty products array' });
    }

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const amount = product.price;
      totalAmount += amount * product.quantity;

      return {
        name: product.name,
        image: product.image,
        unit_price: amount,
        quantity: product.quantity || 1,
      };
    });

    res.status(200).json({
      message: 'Checkout session created successfully',
      lineItems,
      totalAmount,
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    res
      .status(500)
      .json({ message: 'Error processing checkout', error: error.message });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { lineItems, totalAmount } = req.body;

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty line items' });
    }

    // Create a new Order
    const newOrder = new Order({
      user: req.user._id,
      products: lineItems.map((product) => ({
        product: product.id,
        quantity: product.quantity,
        price: product.unit_price,
      })),
      totalAmount,
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: 'Payment successful and order created.',
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error('Error processing successful checkout:', error);
    res.status(500).json({
      message: 'Error processing successful checkout',
      error: error.message,
    });
  }
};
