function requireCompanyAccess(req, res, next) {
    const { role, company: userCompanyId } = req.user;

    // super-admin bypasses everything
    if (role === "super-admin") return next();

    // all other routes must specify a :companyId param
    const { companyId } = req.params;
    if (!companyId) return res.status(400).json({ error: "Missing companyId" });
    if (companyId !== userCompanyId.toString()) {
        return res.status(403).json({ error: "Forbidden: Access outside your company" });
    }
    next();
}

module.exports = requireCompanyAccess