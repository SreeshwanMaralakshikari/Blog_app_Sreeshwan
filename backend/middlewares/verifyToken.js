import jwt from 'jsonwebtoken'
import { config } from 'dotenv';
const { verify } = jwt;

config();

export const verifyToken = (...allowedRoles) => {
    return (req, res, next) => {

        // ✅ Read token from Authorization header instead of cookie
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

        if (!token) {
            return res.status(401).json({ message: "Please Login First" });
        }
        try {
            const decodedToken = verify(token, process.env.SECRET_KEY);
            console.log(decodedToken);

            if (!allowedRoles.includes(decodedToken.role)) {
                return res.status(403).json({ message: "You are not authorized" });
            }

            req.user = decodedToken;
            next();
        } catch (err) {
            res.status(401).json({ message: "Session Expired. Please Relogin" });
        }
    };
};