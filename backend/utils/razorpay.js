let razorpayClient = null;

try {
  const Razorpay = (await import('razorpay')).default;

  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.warn('Razorpay is not configured or the package is unavailable. Payment routes will remain disabled until credentials are added.');
}

export default razorpayClient;
