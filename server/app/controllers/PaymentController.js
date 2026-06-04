const crypto = require("crypto");
const Razorpay = require("razorpay");
const pdf = require("html-pdf-node");
const Payment = require("../models/payment");
const PaymentService = require("../services/payment/paymentService");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class PaymentController {


  async createDonationOrder(req, res) {
    try {
      const { amount } = req.body; // Amount passed from frontend in INR (e.g., 500)

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid donation amount.",
        });
      }

      const options = {
        amount: amount * 100, 
        currency: "INR",
        receipt: `donation_${req.user?._id || "guest"}_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      return res.status(200).json({
        success: true,
        message: "Donation order initialized successfully",
        order,
      });
    } catch (error) {
      console.error("Order Creation Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to initialize donation order",
        error: error.message,
      });
    }
  }

  // STEP 2: Verify the payment signature sent by Razorpay after user pays
  // async verifyDonation(req, res) {
  //   try {
  //     const {
  //       razorpay_order_id,
  //       razorpay_payment_id,
  //       razorpay_signature,
  //       amount, // Pass the original amount back from frontend to store it
  //     } = req.body;

  //     // Cryptographic verification
  //     const generatedSignature = crypto
  //       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  //       .update(razorpay_order_id + "|" + razorpay_payment_id)
  //       .digest("hex");

  //     if (generatedSignature !== razorpay_signature) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Payment verification failed. Security alert.",
  //       });
  //     }

  //     // Save the donation to your database
  //     const donation = await Payment.create({
  //       userId: req.user?._id || null, // Stores user ID if logged in, null if guest
  //       amount: amount,
  //       paymentFor: "green_pulse_donation",
  //       paymentMethod: "razorpay", // Can be UPI, Card, Netbanking (Razorpay handles this automatically)
  //       transactionId: razorpay_payment_id,
  //       paymentStatus: "success",
  //     });

  //     return res.status(201).json({
  //       success: true,
  //       message: "Thank you for your donation! Payment verified successfully.",
  //       donation,
  //     });
  //   } catch (error) {
  //     console.error("Verification Error:", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Payment verified by provider, but failed to save in internal records.",
  //       error: error.message,
  //     });
  //   }
  // }

  async verifyDonation(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount, // Passed from frontend
    } = req.body;

    // 1. Cryptographic verification
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Security alert.",
      });
    }

    // 2. Save the donation to your database
    const donation = await Payment.create({
      userId: req.user?._id || null, 
      amount: amount,
      paymentFor: "green_pulse_donation",
      paymentMethod: "razorpay", 
      transactionId: razorpay_payment_id,
      paymentStatus: "success",
    });

    // 3. Prepare Dynamic Variables for the Receipt Template
    const customerName = req.user?.name || "Valued Supporter";
    const customerEmail = req.user?.email || "N/A";
    const receiptId = `REC-${Math.floor(100000 + Math.random() * 900000)}`; // Generates a random receipt tracking #
    const dateString = new Date(donation.createdAt || Date.now()).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // 4. HTML Template Definition
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        body {
            font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            font-size: 10pt;
            -webkit-print-color-adjust: exact;
        }

        /* Dashboard Header Layout */
        .dashboard-header {
            background-color: #064e3b; /* Deep emerald */
            padding: 30px 40px;
            color: #ffffff;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .brand-logo {
            font-size: 24pt;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #ffffff;
        }

        .brand-tagline {
            font-size: 9.5pt;
            color: #34d399; /* Mint green */
            margin-top: 2px;
            font-weight: 500;
        }

        .document-type {
            text-align: right;
            vertical-align: middle;
        }

        .badge-receipt {
            background-color: #10b981;
            color: white;
            padding: 6px 14px;
            border-radius: 30px;
            font-weight: bold;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: inline-block;
        }

        /* Core Canvas Container */
        .dashboard-canvas {
            padding: 35px 40px;
        }

        /* Thank You Banner Card */
        .impact-hero-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .impact-hero-card h2 {
            margin: 0 0 10px 0;
            color: #065f46;
            font-size: 16pt;
            font-weight: 700;
        }

        .impact-hero-card p {
            margin: 0;
            color: #475569;
            font-size: 10.5pt;
            line-height: 1.6;
        }

        /* NGO DASHBOARD STATS METRICS GRID */
        .stats-grid-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 15px 0;
            margin: 0 -15px 25px -15px;
        }

        .stat-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            vertical-align: top;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .stat-label {
            font-size: 8.5pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            font-weight: 600;
            margin-bottom: 6px;
        }

        .stat-value {
            font-size: 16pt;
            font-weight: 700;
            color: #0f172a;
        }

        .stat-value.amount {
            color: #059669; /* Emerald Green */
        }

        .stat-footer-text {
            font-size: 8pt;
            color: #059669;
            margin-top: 5px;
            font-weight: 500;
        }

        /* 2-Column Split Information Layout */
        .info-grid-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }

        .info-grid-table td {
            width: 50%;
            vertical-align: top;
        }

        .panel-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .panel-title {
            font-size: 10pt;
            font-weight: 700;
            color: #334155;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }

        .data-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .data-list li {
            margin-bottom: 8px;
            font-size: 9.5pt;
            color: #475569;
        }

        .data-list strong {
            color: #64748b;
            display: inline-block;
            width: 110px;
            font-weight: 500;
        }

        .data-list span.value {
            color: #0f172a;
            font-weight: 600;
        }

        /* Detailed Ledger Table */
        .ledger-table {
            width: 100%;
            border-collapse: collapse;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .ledger-table th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 600;
            text-align: left;
            padding: 12px 16px;
            font-size: 9pt;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
        }

        .ledger-table td {
            padding: 16px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
            vertical-align: middle;
        }

        .item-title {
            font-weight: 600;
            color: #0f172a;
            font-size: 10pt;
        }

        .item-subtext {
            font-size: 8.5pt;
            color: #64748b;
            margin-top: 2px;
        }

        .text-right {
            text-align: right;
        }

        /* Verification & Sign-off Footer */
        .footer-action-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
        }

        .verified-stamp {
            border: 2px solid #059669;
            background-color: #ecfdf5;
            color: #059669;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 9pt;
            padding: 6px 14px;
            border-radius: 6px;
            letter-spacing: 1px;
            display: inline-block;
        }

        .signature-container {
            text-align: right;
        }

        .signature-line {
            display: inline-block;
            width: 200px;
            border-top: 1px solid #cbd5e1;
            margin-top: 35px;
            text-align: center;
            font-size: 8.5pt;
            color: #475569;
            padding-top: 5px;
        }

        .footer-disclaimer {
            margin-top: 40px;
            text-align: center;
            font-size: 8pt;
            color: #94a3b8;
            line-height: 1.5;
        }
    </style>
</head>
<body>

    <div class="dashboard-header">
        <table class="header-table">
            <tr>
                <td>
                    <div class="brand-logo">green_pulse</div>
                    <div class="brand-tagline">Global Environmental Protection Framework</div>
                </td>
                <td class="document-type">
                    <span class="badge-receipt">Official Contribution Receipt</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="dashboard-canvas">

        <div class="impact-hero-card">
            <h2>Thank You for Supporting Our Mission, ${customerName}!</h2>
            <p>Your contribution was audited and confirmed successfully. This dashboard receipt registers your transaction data directly onto our foundational financial ledgers, routing capital resources into our active climate and clean tech deployment pipelines.</p>
        </div>

        <table class="stats-grid-table">
            <tr>
                <td class="stat-card">
                    <div class="stat-label">Total Contribution</div>
                    <div class="stat-value amount">₹${donation.amount}.00</div>
                    <div class="stat-footer-text">100% Audited Transparency</div>
                </td>
                <td class="stat-card">
                    <div class="stat-label">Allocation Strategy</div>
                    <div class="stat-value" style="color: #0284c7;">Earmarked Funds</div>
                    <div class="stat-footer-text">Green Pulse General Portfolio</div>
                </td>
                <td class="stat-card">
                    <div class="stat-label">Exemption Status</div>
                    <div class="stat-value" style="color: #7c3aed;">Complete</div>
                    <div class="stat-footer-text">Registered NGO Grant</div>
                </td>
            </tr>
        </table>

        <table class="info-grid-table">
            <tr>
                <td style="padding-right: 10px;">
                    <div class="panel-card" style="height: 110px;">
                        <div class="panel-title">Supporter Node Profile</div>
                        <ul class="data-list">
                            <li><strong>Legal Name:</strong> <span class="value">${customerName}</span></li>
                            <li><strong>Email Node:</strong> <span class="value">${customerEmail}</span></li>
                            <li><strong>Security Status:</strong> <span class="value" style="color:#059669;">Verified Contributor</span></li>
                        </ul>
                    </div>
                </td>
                <td style="padding-left: 10px;">
                    <div class="panel-card" style="height: 110px;">
                        <div class="panel-title">Ledger Transaction Audits</div>
                        <ul class="data-list">
                            <li><strong>Receipt ID:</strong> <span class="value">${receiptId}</span></li>
                            <li><strong>Payment ID:</strong> <span class="value font-mono" style="font-size:8.5pt;">${donation.transactionId}</span></li>
                            <li><strong>Timestamp:</strong> <span class="value">${dateString}</span></li>
                        </ul>
                    </div>
                </td>
            </tr>
        </table>

        <table class="ledger-table">
            <thead>
                <tr>
                    <th style="width: 55%;">Impact Ledger Core Strategy</th>
                    <th style="width: 25%;">Gateway Network</th>
                    <th style="width: 20%; text-align: right;">Subtotal (INR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="item-title">Micro-Grant Ecosystem Donation</div>
                        <div class="item-subtext">Allocation Portfolio: Global Environmental Action Strategy (green_pulse_donation)</div>
                    </td>
                    <td>Razorpay Gateway</td>
                    <td class="text-right" style="font-weight: 600; color: #0f172a;">₹${donation.amount}.00</td>
                </tr>
                <tr style="background-color: #fafbfc;">
                    <td></td>
                    <td class="text-right" style="font-weight: 700; color: #475569; font-size: 9.5pt; padding-top: 20px;">Net Contributed:</td>
                    <td class="text-right" style="font-weight: 800; color: #059669; font-size: 13pt; padding-top: 16px;">₹${donation.amount}.00</td>
                </tr>
            </tbody>
        </table>

        <table class="footer-action-table">
            <tr>
                <td style="vertical-align: bottom;">
                    <div class="verified-stamp">
                        ✓ SecOps Ledger Verified
                    </div>
                </td>
                <td class="signature-container">
                    <div class="signature-line">
                        Authorized System Comptroller<br>
                        <strong>Green Pulse Executive Committee</strong>
                    </div>
                </td>
            </tr>
        </table>

        <div class="footer-disclaimer">
            This environmental data index sheet is generated instantly following secure verification protocols.<br>
            Green Pulse Foundation Collective (MERN Instance) • support@greenpulsemern.org • Secure Endpoint Node v2.6
        </div>

    </div>

</body>
</html>
`;

    // 5. Generate PDF and send back to client
    const options = { format: "A4" };
    const file = { content: htmlContent };

    const pdfBuffer = await pdf.generatePdf(file, options);
    const base64Pdf = pdfBuffer.toString("base64"); // Convert raw PDF buffer to Base64 string[cite: 2]

    return res.status(201).json({
      success: true,
      message: "Thank you for your donation! Payment verified successfully.",
      donation,
      pdfFile: base64Pdf, // Send file stream back inline[cite: 2]
    });

  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verified by provider, but failed to process internal operations.",
      error: error.message,
    });
  }
}

  async createEliteBadgePayment(req, res) {
    try {
      const { ngoId } = req.body;
      const amount =
        await PaymentService.calculateEliteBadgePayment(
          ngoId
        );

  
      if (amount === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Moderate and Good NGOs don't need payment",
        });
      }

      const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `elite_${ngoId}_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      return res.status(200).json({
        success: true,
        message: "Elite badge payment order created",
        amount,
        order,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create elite payment",
        error: error.message,
      });
    }
  }


  async hireCleaningCompanyPayment(req, res) {
    try {
      const { ngoId, companyId } = req.body;

      const amount =
        await PaymentService.cleaningHirePayment();

      const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `hire_${ngoId}_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      return res.status(200).json({
        success: true,
        message: "Cleaning company payment order created",
        amount,
        companyId,
        order,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to create cleaning company payment",
        error: error.message,
      });
    }
  }
  
async companySubscriptionPayment(req, res) {
    try {
      const { companyId } = req.body;

      // Service Layer Logic
      const amount =
        await PaymentService.companyRequestPayment(
          companyId
        );

      // Less than 2 requests
      if (amount === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Payment required only after 2 accepted requests",
        });
      }

      const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `company_${companyId}_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      return res.status(200).json({
        success: true,
        message:
          "Company subscription payment order created",
        amount,
        order,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to create company subscription payment",
        error: error.message,
      });
    }
  }


 async verifyPayment(req, res) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,

        paymentFor,
        ngoId,
        companyId,
      } = req.body;

      
      const generatedSignature = crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          razorpay_order_id + "|" + razorpay_payment_id
        )
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }

      let amount = 0;

      
      if (paymentFor === "elite_badge") {
        amount =
          await PaymentService.calculateEliteBadgePayment(
            ngoId
          );
      }

      if (paymentFor === "hire_cleaning_company") {
        amount =
          await PaymentService.cleaningHirePayment();
      }

      if (paymentFor === "company_subscription") {
        amount =
          await PaymentService.companyRequestPayment(
            companyId
          );
      }

      // Save Payment
      const payment = await Payment.create({
        userId: req.user._id,

        ngoId: ngoId || null,

        companyId: companyId || null,

        amount,

        paymentFor,

        paymentMethod: "upi",

        transactionId: razorpay_payment_id,

        paymentStatus: "success",
      });

      return res.status(201).json({
        success: true,
        message: "Payment verified successfully",
        payment,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Payment verification failed",
        error: error.message,
      });
    }
  }


  async getAllPayments(req, res) {
    try {
      const payments = await Payment.find()
        .populate("userId", "name email")
        .populate("ngoId", "ngoName badge")
        .populate("companyId", "companyName")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: payments.length,
        payments,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch payments",
        error: error.message,
      });
    }
  }


async getSinglePayment(req, res) {
  try {

    // Role Check
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can access single payment details",
      });
    }

    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate("userId", "name email")
      .populate("ngoId", "ngoName badge")
      .populate("companyId", "companyName");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
}
}

module.exports = new PaymentController();