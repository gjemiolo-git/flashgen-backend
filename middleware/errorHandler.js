class ExpressError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const errorHandler = (err, req, res, next) => {
    if (err instanceof ExpressError) {
        const { statusCode, message } = err;
        return res.status(statusCode).json({ error: { message, status: statusCode } });
    }

    let error = new ExpressError('Internal Server Error', 500);

    switch (err.name) {
        case 'ValidationError':
            error = new ExpressError(err.message, 400);
            break;
        case 'UnauthorizedError':
            error = new ExpressError('Unauthorized', 401);
            break;
        case 'ForbiddenError':
            error = new ExpressError('Forbidden', 403);
            break;
        case 'NotFoundError':
            error = new ExpressError('Resource Not Found', 404);
            break;
    }

    const { statusCode, message } = error;
    res.status(statusCode).json({ error: { message, status: statusCode } });
};

module.exports = { ExpressError, errorHandler };
