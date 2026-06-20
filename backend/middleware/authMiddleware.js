import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const headerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
  const cookieToken = req.cookies?.token;
  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "nits-secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

export { verifyToken, authorizeRoles };
