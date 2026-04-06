const BASE_URL = process.env.BASE_URL;

exports.baseTemplate = (title, content) => {
  return `
    <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
      <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px;">
        <h1 style="color:#3b82f6; text-align:center;">📚 BookHub</h1>
        <h2 style="text-align:center;">${title}</h2>
        <div style="margin:20px 0;">
          ${content}
        </div>
        <p style="font-size:12px; color:gray; text-align:center;">
          If you did not request this, you can ignore this email.
        </p>
      </div>
    </div>
  `;
};

exports.verifyTemplate = (name, link) => {
  return exports.baseTemplate(
    "Verify Your Email",
    `
      <p>Hello ${name},</p>
      <p>Welcome to <b>BookHub</b>! Please verify your email to get started.</p>

      <div style="text-align:center; margin:20px;">
        <a href="${link}" 
           style="background:#3b82f6; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
           Verify Email
        </a>
      </div>

      <p>This link will expire in 1 hour.</p>
    `
  );
};

exports.resetTemplate = (name, link) => {
  return exports.baseTemplate(
    "Reset Your Password",
    `
      <p>Hello ${name},</p>
      <p>You requested to reset your password.</p>

      <div style="text-align:center; margin:20px;">
        <a href="${link}" 
           style="background:#ef4444; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
           Reset Password
        </a>
      </div>

      <p>This link will expire in 1 hour.</p>
    `
  );
};

exports.orderTemplate = (link) => {
  return exports.baseTemplate(
    "New Order Received 📦",
    `
      <p>You have received a new order on <b>BookHub</b>.</p>

      <div style="text-align:center; margin:20px;">
        <a href="${link}" 
           style="background:#10b981; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
           View Order
        </a>
      </div>
    `
  );
};

exports.orderPlacedTemplate = (name, orderId) => {
  return exports.baseTemplate(
    "Order Confirmed 🎉",
    `
      <p>Hello ${name},</p>
      <p>Your order has been placed successfully.</p>

      <p><b>Order ID:</b> ${orderId}</p>

      <div style="text-align:center; margin:20px;">
        <a href="${BASE_URL}/user/orders" 
           style="background:#3b82f6; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
           View Orders
        </a>
      </div>
    `
  );
};

exports.newOrderTemplate = (orderId, items) => {
  return exports.baseTemplate(
    "New Order Received 📦",
    `
      <p>You have received a new order.</p>

      <p><b>Order ID:</b> ${orderId}</p>

      <p><b>Items:</b></p>
      <p>${items}</p>

      <div style="text-align:center; margin:20px;">
        <a href="${BASE_URL}/host/orders" 
           style="background:#10b981; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
           View Orders
        </a>
      </div>
    `
  );
};

exports.orderShippedTemplate = (name, orderId) => {
  return exports.baseTemplate(
    "Your Order has been Shipped 🚚",
    `
      <p>Hello ${name},</p>
      <p>Your order <b>#${orderId}</b> has been shipped.</p>

      <div style="text-align:center; margin:20px;">
        <a href="${BASE_URL}/user/orders" 
           style="background:#f59e0b; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
           Track Order
        </a>
      </div>
    `
  );
};

exports.orderDeliveredTemplate = (name, orderId) => {
  return exports.baseTemplate(
    "Order Delivered 🎉",
    `
      <p>Hello ${name},</p>
      <p>Your order <b>#${orderId}</b> has been delivered successfully.</p>

      <p>We hope you enjoy your books 📚</p>
    `
  );
};