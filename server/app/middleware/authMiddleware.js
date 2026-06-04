const jwt = require("jsonwebtoken");

const authCheck = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;

    // 💡 MOVE IT HERE TO SEE THE ACTUAL DATA:
    console.log("TOKEN USER DECODED SUCCESSFULLY:", req.user);

    next();
  } catch (error) {
    console.error("JWT ERROR ENCOUNTERED:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

module.exports = authCheck;