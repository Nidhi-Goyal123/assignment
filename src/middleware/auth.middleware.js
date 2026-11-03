const authenticateUser = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    const userRole = req.headers["x-user-role"];

    // Check whether headers are present
    if (!userId || !userRole) {
        return res.status(401).json({
            success: false,
            code: "UNAUTHORIZED",
            message: "User ID and role are required"
        });
    }

    // Check valid role
    if (!["recruiter", "candidate"].includes(userRole)) {
        return res.status(401).json({
            success: false,
            code: "UNAUTHORIZED",
            message: "Invalid user role"
        });
    }

    // Attach user information to request
    req.user = {
        id: userId,
        role: userRole
    };

    next();
};


// Check whether the user has the required role
const authorizeRole = (requiredRole) => {
    return (req, res, next) => {

        if (req.user.role !== requiredRole) {
            return res.status(403).json({
                success: false,
                code: "FORBIDDEN",
                message: "You do not have permission to perform this action"
            });
        }

        next();
    };
};

module.exports = {
    authenticateUser,
    authorizeRole
};