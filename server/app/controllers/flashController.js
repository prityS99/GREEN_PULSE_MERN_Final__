// Example controller logic (e.g., app/router/index.js or a controller file)
exports.createDonation = async (req, res) => {
  try {
    // ... your saving logic ...
    
    req.flash('success', 'Thank you! Your donation was recorded successfully.');
    return res.status(200).json({ status: "success" });
  } catch (error) {
    req.flash('error', 'Something went wrong. Please try again.');
    return res.status(500).json({ status: "error" });
  }
};