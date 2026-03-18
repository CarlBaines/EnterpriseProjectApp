function requireLogin(request, response, next){
    if(!request.session.userId){
        return response.status(401).json({
            success: false,
            message: "Unauthorised to access this resource. Please log in."
        });
    }
    next();
}

module.exports = requireLogin;