const NGO = require("../../models/ngo");
const CleaningCompany = require("../../models/cleaningCompany");

class PaymentService {

  // NGO Elite Badge Payment
  static async calculateEliteBadgePayment(ngoId) {

    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      throw new Error("NGO not found");
    }
    if (ngo.badge === "elite") {
      return 856;
    }
    return 0;
  }
  // NGO Hiring Cleaning Company
  static async cleaningHirePayment() {
    return 489;
  }

  // Cleaning Company Subscription
  static async companyRequestPayment(companyId) {

    const company = await Company.findById(companyId);

    if (!company) {
      throw new Error("Company not found");
    }

    // Example field:
    // company.totalRequestsAccepted

    if (company.totalRequestsAccepted >= 2) {
      return 599;
    }

    return 0;
  }
}

module.exports = PaymentService;