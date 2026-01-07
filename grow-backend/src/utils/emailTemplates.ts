/**
 * Professional Email Templates with Learn & Grow Branding
 */

const LOGO_URL = "https://learnandgrow.io/logo.png";
const BRAND_COLOR = "#0ea5e9"; // Sky Blue
const SUCCESS_COLOR = "#10b981"; // Green
const DANGER_COLOR = "#ef4444"; // Red
const SECONDARY_COLOR = "#8b5cf6"; // Purple for Premium
const TEXT_DARK = "#1f2937"; // Dark Gray
const TEXT_LIGHT = "#6b7280"; // Light Gray
const BG_LIGHT = "#f9fafb"; // Very Light Gray

interface OrderDetails {
  orderId: string;
  studentName: string;
  studentEmail: string;
  planType: "single" | "quarterly" | "kit" | "premium";
  courseTitle?: string;
  price: number;
  transactionId: string;
  paymentMethod?: string;
  paymentAccount?: string;
  deliveryAddress?: {
    name: string;
    phone: string;
    fullAddress: string;
    city: string;
    postalCode: string;
  };
  bankDetails?: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    routingNumber?: string;
  };
  createdAt: string;
}

// Header Component
const getEmailHeader = () => `
  <div style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #06b6d4 100%); padding: 40px 20px; text-align: center; border-radius: 0;">
    <img src="${LOGO_URL}" alt="Learn & Grow" style="height: 50px; margin-bottom: 15px;" />
    <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Learn & Grow Academy</h1>
    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Empowering the Next Generation</p>
  </div>
`;

// Footer Component
const getEmailFooter = () => `
  <div style="background: ${BG_LIGHT}; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
    <div style="margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px;">
      <p style="margin: 8px 0; color: ${TEXT_LIGHT}; font-size: 13px;">
        <strong>Learn & Grow Academy</strong><br>
        📧 info@learnandgrow.io | 📱 +880 1706-276447
      </p>
    </div>
    <div style="margin: 15px 0; font-size: 12px;">
      <p style="margin: 5px 0; color: ${TEXT_LIGHT};">
        <a href="https://learnandgrow.io" style="color: ${BRAND_COLOR}; text-decoration: none;">Website</a> • 
        <a href="https://facebook.com/learnandgrowofficial" style="color: ${BRAND_COLOR}; text-decoration: none;">Facebook</a> • 
        <a href="https://instagram.com/learngrow_insta" style="color: ${BRAND_COLOR}; text-decoration: none;">Instagram</a>
      </p>
    </div>
    <p style="margin: 15px 0 0; color: #9ca3af; font-size: 11px;">© 2026 Learn & Grow Academy. All rights reserved.</p>
  </div>
`;

// Format Price Helper
const formatPrice = (amount: number) =>
  `৳${Number(amount || 0).toLocaleString("en-US")}`;

// Conditional Delivery Address Section
const getDeliverySection = (order: OrderDetails) => {
  // Show delivery address only for KIT orders
  if (
    order.planType === "kit" ||
    (order.planType === "quarterly" && order.deliveryAddress)
  ) {
    return `
      <div style="margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; color: ${TEXT_DARK}; font-size: 16px; font-weight: 600;">📦 Delivery Address</h3>
        <div style="background: ${BG_LIGHT}; padding: 15px; border-radius: 8px; border-left: 4px solid ${BRAND_COLOR};">
          <p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>Name:</strong> ${order.deliveryAddress.name}</p>
          <p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>Phone:</strong> ${order.deliveryAddress.phone}</p>
          <p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>Address:</strong> ${order.deliveryAddress.fullAddress}</p>
          <p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>City:</strong> ${order.deliveryAddress.city}</p>
          <p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>Postal Code:</strong> ${order.deliveryAddress.postalCode}</p>
        </div>
      </div>
    `;
  }
  return "";
};

// Bank Details Section (for Premium orders)
const getBankDetailsSection = (order: OrderDetails) => {
  if (
    (order.planType === "premium" || order.planType === "quarterly") &&
    order.bankDetails
  ) {
    return `
      <div style="margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; color: ${TEXT_DARK}; font-size: 16px; font-weight: 600;">🏦 Bank Transfer Details</h3>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>Bank Name:</strong> ${
      order.bankDetails.bankName
    }</p>
          <p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>Account Holder:</strong> ${
      order.bankDetails.accountHolder
    }</p>
          <p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>Account Number:</strong> <code style="background: white; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${
      order.bankDetails.accountNumber
    }</code></p>
          ${
            order.bankDetails.routingNumber
              ? `<p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>Routing Number:</strong> <code style="background: white; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${order.bankDetails.routingNumber}</code></p>`
              : ""
          }
        </div>
      </div>
    `;
  }
  return "";
};

/**
 * ORDER CONFIRMATION EMAIL (to Student)
 */
export const getOrderConfirmationEmail = (order: OrderDetails) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      ${getEmailHeader()}
      
      <div style="padding: 30px 20px; color: ${TEXT_DARK}; line-height: 1.6;">
        <h2 style="margin: 0 0 10px 0; color: ${TEXT_DARK}; font-size: 24px;">✅ Order Confirmed!</h2>
        <p style="margin: 0 0 20px 0; color: ${TEXT_LIGHT}; font-size: 14px;">Thank you for your order, <strong>${
  order.studentName
}</strong></p>
        
        <div style="background: ${BG_LIGHT}; padding: 20px; border-radius: 8px; border-left: 4px solid ${SUCCESS_COLOR}; margin: 20px 0;">
          <p style="margin: 0; color: ${SUCCESS_COLOR}; font-weight: 600;">
            ✓ Your order has been successfully submitted and is awaiting admin verification.
          </p>
        </div>

        <h3 style="margin: 20px 0 15px 0; color: ${TEXT_DARK}; font-size: 16px; font-weight: 600;">📋 Order Details</h3>
        <div style="background: ${BG_LIGHT}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT}; border-bottom: 1px solid #e5e7eb;">Order ID:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">#${order.orderId.substring(
  0,
  8
)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT}; border-bottom: 1px solid #e5e7eb;">Plan Type:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">${order.planType.toUpperCase()}</td>
            </tr>
            ${
              order.courseTitle
                ? `
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT}; border-bottom: 1px solid #e5e7eb;">Course:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">${order.courseTitle}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT}; border-bottom: 1px solid #e5e7eb;">Amount:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 16px;">${formatPrice(
  order.price
)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT};">Transaction ID:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; text-align: right; font-family: monospace; font-size: 12px;">${
  order.transactionId
}</td>
            </tr>
          </table>
        </div>

        ${getDeliverySection(order)}
        ${getBankDetailsSection(order)}

        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid ${BRAND_COLOR}; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #0369a1;">⏳ Next Steps</h4>
          <p style="margin: 5px 0; color: #0369a1; font-size: 14px;">1. Our admin team will verify your payment details</p>
          <p style="margin: 5px 0; color: #0369a1; font-size: 14px;">2. You'll receive a confirmation email once approved</p>
          <p style="margin: 5px 0; color: #0369a1; font-size: 14px;">3. Instant access to your ${
            order.planType
          } plan</p>
        </div>

        <p style="margin: 20px 0 0 0; color: ${TEXT_LIGHT}; font-size: 13px;">
          If you have any questions, feel free to reach out to us at <strong>info@learnandgrow.io</strong> or call <strong>+880 1706-276447</strong>
        </p>
      </div>

      ${getEmailFooter()}
    </div>
  </body>
  </html>
`;

/**
 * ADMIN ORDER APPROVAL REQUEST EMAIL
 */
export const getAdminOrderApprovalEmail = (
  order: OrderDetails,
  approveUrl: string,
  rejectUrl: string
) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Approval Required</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      ${getEmailHeader()}
      
      <div style="padding: 30px 20px; color: ${TEXT_DARK}; line-height: 1.6;">
        <h2 style="margin: 0 0 10px 0; color: ${DANGER_COLOR}; font-size: 24px;">🔔 New Order Pending Review</h2>
        <p style="margin: 0 0 20px 0; color: ${TEXT_LIGHT}; font-size: 14px;">An order requires your immediate attention.</p>

        <h3 style="margin: 20px 0 15px 0; color: ${TEXT_DARK}; font-size: 16px; font-weight: 600;">👤 Student Information</h3>
        <div style="background: ${BG_LIGHT}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>Name:</strong> ${
  order.studentName
}</p>
          <p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>Email:</strong> ${
  order.studentEmail
}</p>
        </div>

        <h3 style="margin: 20px 0 15px 0; color: ${TEXT_DARK}; font-size: 16px; font-weight: 600;">💳 Order Information</h3>
        <div style="background: ${BG_LIGHT}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT}; border-bottom: 1px solid #e5e7eb;">Order ID:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">#${order.orderId.substring(
  0,
  8
)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT}; border-bottom: 1px solid #e5e7eb;">Plan Type:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="background: ${
                  order.planType === "premium" ? SECONDARY_COLOR : BRAND_COLOR
                }; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                  ${order.planType.toUpperCase()}
                </span>
              </td>
            </tr>
            ${
              order.courseTitle
                ? `
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT}; border-bottom: 1px solid #e5e7eb;">Course:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">${order.courseTitle}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT}; border-bottom: 1px solid #e5e7eb;">Amount:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 16px;">${formatPrice(
  order.price
)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT};">Transaction ID:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; text-align: right; font-family: monospace; font-size: 12px;">${
  order.transactionId
}</td>
            </tr>
          </table>
        </div>

        ${
          order.paymentMethod
            ? `
        <h3 style="margin: 20px 0 15px 0; color: ${TEXT_DARK}; font-size: 16px; font-weight: 600;">💰 Payment Method</h3>
        <div style="background: ${BG_LIGHT}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 5px 0; color: ${TEXT_DARK};"><strong>${
                order.paymentMethod
              }</strong></p>
          ${
            order.paymentAccount
              ? `<p style="margin: 5px 0; color: ${TEXT_LIGHT}; font-size: 12px;">${order.paymentAccount}</p>`
              : ""
          }
        </div>
        `
            : ""
        }

        ${getDeliverySection(order)}

        <h3 style="margin: 20px 0 15px 0; color: ${TEXT_DARK}; font-size: 16px; font-weight: 600;">✅ Action Required</h3>
        <div style="display: flex; gap: 12px; margin: 20px 0;">
          <a href="${approveUrl}" style="flex: 1; background: ${SUCCESS_COLOR}; color: white; padding: 12px; border-radius: 6px; text-decoration: none; font-weight: 600; text-align: center; display: block;">
            ✓ Approve Order
          </a>
          <a href="${rejectUrl}" style="flex: 1; background: ${DANGER_COLOR}; color: white; padding: 12px; border-radius: 6px; text-decoration: none; font-weight: 600; text-align: center; display: block;">
            ✕ Reject Order
          </a>
        </div>
        <p style="margin: 10px 0 0 0; color: #f97316; font-size: 12px; text-align: center;">⚠ These links expire in 48 hours</p>
      </div>

      ${getEmailFooter()}
    </div>
  </body>
  </html>
`;

/**
 * ORDER APPROVED EMAIL (to Student)
 */
export const getOrderApprovedEmail = (order: OrderDetails) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Approved</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      ${getEmailHeader()}
      
      <div style="padding: 30px 20px; color: ${TEXT_DARK}; line-height: 1.6;">
        <h2 style="margin: 0 0 10px 0; color: ${SUCCESS_COLOR}; font-size: 28px;">🎉 Order Approved!</h2>
        <p style="margin: 0 0 20px 0; color: ${TEXT_LIGHT}; font-size: 14px;">Your payment has been verified and approved.</p>

        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid ${SUCCESS_COLOR}; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #166534;">✅ Your Access is Now Active!</h4>
          <p style="margin: 0; color: #166534; font-size: 14px;">You can now access all features of your ${order.planType.toUpperCase()} plan.</p>
        </div>

        <h3 style="margin: 20px 0 15px 0; color: ${TEXT_DARK}; font-size: 16px; font-weight: 600;">🎓 Getting Started</h3>
        <div style="background: ${BG_LIGHT}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <ol style="margin: 0; padding-left: 20px; color: ${TEXT_DARK}; font-size: 14px;">
            <li style="margin: 5px 0;">Log in to your account</li>
            <li style="margin: 5px 0;">Navigate to "My Courses"</li>
            <li style="margin: 5px 0;">Start learning immediately</li>
            <li style="margin: 5px 0;">Join our community forums</li>
          </ol>
        </div>

        <h3 style="margin: 20px 0 15px 0; color: ${TEXT_DARK}; font-size: 16px; font-weight: 600;">📋 Order Summary</h3>
        <div style="background: ${BG_LIGHT}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT}; border-bottom: 1px solid #e5e7eb;">Order ID:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">#${order.orderId.substring(
  0,
  8
)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT}; border-bottom: 1px solid #e5e7eb;">Amount Paid:</td>
              <td style="padding: 8px 0; color: ${SUCCESS_COLOR}; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 16px;">${formatPrice(
  order.price
)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT};">Approved Date:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; text-align: right;">${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid ${BRAND_COLOR}; margin: 20px 0;">
          <p style="margin: 0; color: #0369a1; font-size: 14px;">
            <strong>Need Help?</strong> Visit our <a href="https://learnandgrow.io/help" style="color: ${BRAND_COLOR}; text-decoration: none;">help center</a> or contact us at <strong>info@learnandgrow.io</strong>
          </p>
        </div>
      </div>

      ${getEmailFooter()}
    </div>
  </body>
  </html>
`;

/**
 * ORDER REJECTED EMAIL (to Student)
 */
export const getOrderRejectedEmail = (order: OrderDetails, reason?: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Update</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      ${getEmailHeader()}
      
      <div style="padding: 30px 20px; color: ${TEXT_DARK}; line-height: 1.6;">
        <h2 style="margin: 0 0 10px 0; color: ${DANGER_COLOR}; font-size: 24px;">⚠️ Order Status Update</h2>
        <p style="margin: 0 0 20px 0; color: ${TEXT_LIGHT}; font-size: 14px;">We've reviewed your order and need to inform you of the status.</p>

        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid ${DANGER_COLOR}; margin: 20px 0;">
          <h4 style="margin: 0 0 8px 0; color: #991b1b;">⚠️ Your Order Was Not Approved</h4>
          <p style="margin: 0; color: #991b1b; font-size: 14px;">
            Unfortunately, your payment could not be verified. ${
              reason ? `<br><br><strong>Reason:</strong> ${reason}` : ""
            }
          </p>
        </div>

        <h3 style="margin: 20px 0 15px 0; color: ${TEXT_DARK}; font-size: 16px; font-weight: 600;">📋 Order Details</h3>
        <div style="background: ${BG_LIGHT}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT}; border-bottom: 1px solid #e5e7eb;">Order ID:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">#${order.orderId.substring(
  0,
  8
)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${TEXT_LIGHT};">Amount:</td>
              <td style="padding: 8px 0; color: ${TEXT_DARK}; font-weight: 600; text-align: right;">${formatPrice(
  order.price
)}</td>
            </tr>
          </table>
        </div>

        <h3 style="margin: 20px 0 15px 0; color: ${TEXT_DARK}; font-size: 16px; font-weight: 600;">🔄 What You Can Do</h3>
        <div style="background: ${BG_LIGHT}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <ol style="margin: 0; padding-left: 20px; color: ${TEXT_DARK}; font-size: 14px;">
            <li style="margin: 5px 0;">Verify your payment details are correct</li>
            <li style="margin: 5px 0;">Try placing the order again</li>
            <li style="margin: 5px 0;">Contact our support team for assistance</li>
          </ol>
        </div>

        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid ${BRAND_COLOR}; margin: 20px 0;">
          <p style="margin: 0; color: #0369a1; font-size: 14px;">
            <strong>Need Help?</strong> Our support team is ready to assist. Contact us at <strong>info@learnandgrow.io</strong> or call <strong>+880 1706-276447</strong>
          </p>
        </div>
      </div>

      ${getEmailFooter()}
    </div>
  </body>
  </html>
`;
