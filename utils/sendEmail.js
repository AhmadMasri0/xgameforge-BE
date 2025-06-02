const nodemailer = require("nodemailer");

exports.transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


exports.sendOrderConfirmation = async (order, items) => {
    const mailOptions = {
        from: `"XGameForge" <${process.env.EMAIL_USER}>`,
        to: order.orderDetail.email,
        subject: "🧾 Your XGameForge Order Confirmation",
        html: `
      <h2>Thank you for your order!</h2>
      <p>Hello ${order.orderDetail.fullName},</p>
      <p>We've received your order and it's being processed.</p>
      <p>Your order Id: ${order._id} </p>
      <p><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
      <p><strong>Payment Method:</strong> ${order.paymentIntentId ? 'Card' : 'Unpaid'}</p>

      <h3>Shipping to:</h3>
      <p>
        ${order.orderDetail.address}<br />
        ${order.orderDetail.city}, ${order.orderDetail.zip}<br />
        Phone: ${order.orderDetail.phone}
      </p>

      <h4>Items:</h4>
      <ul>
        ${items.map(item => `
          <li>${item.product.name} × ${item.quantity}</li>
        `).join('')}
      </ul>
      <h4>Order notes:</h4>
            <p>${order.orderDetail.notes ? order.orderDetail.notes : 'None'} </p>
      <p>We'll notify you once it's shipped. 🎮</p>
    `
    };

    await this.transporter.sendMail(mailOptions);
};


exports.sendUserConfirmation = async (to, username, confirmToken) => {

    const confirmURL = `${process.env.CLIENT_URL}/verify-email/${confirmToken}`;

    await this.transporter.sendMail({
        from: `"XGameForge" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Confirm your email",
        html: `<h3>Welcome, ${username}!</h3>
                       <p>Click the link below to confirm your email:</p>
                       <a href="${confirmURL}">${confirmURL}</a>
                       <p>This link expires in 24 hours.</p>`,
    });
};

exports.sendOrderCancellationNotification = async (order) => {

    await this.transporter.sendMail({
        from: `"XGameForge" <${process.env.EMAIL_USER}>`,
        to: order.orderDetail.email,
        subject: "Your XGameForge Order was Cancelled",
        html: `
        <h2>Hi ${order.orderDetail.fullName},</h2>
        <p>Your order placed on <strong>${new Date(order.createdAt).toLocaleDateString()}</strong> has been <strong>cancelled</strong>.</p>
        <p>If you didn't request this or need help, contact support.</p>
        <hr>
        <p>Thank you for choosing XGameForge!</p>
      `,
    });
};

exports.sendOrderDeliveryNotification = async (order) => {

    await this.transporter.sendMail({
        from: `"XGameForge" <${process.env.EMAIL_USER}>`,
        to: order.orderDetail.email,
        subject: "Your XGameForge Order Has Been Delivered 🎮📦",
        html: `
          <h2>Hi ${order.orderDetail.fullName},</h2>
          <p>We're excited to let you know that your order (ID: <strong>${order._id}</strong>) has been <strong>delivered</strong>.</p>
          <p>We hope you enjoy your items! If you have any feedback or need help, feel free to reach out.</p>
          <hr>
          <p>Thank you for choosing <strong>XGameForge</strong>!</p>
        `,
    });
};

