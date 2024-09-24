const wrapAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
};

const wrapAsyncGen = (fn) => {
    return async () => {
        try {
            await fn();
        } catch (error) {
            console.error('Error during server startup:', error);
            process.exit(1);
        }
    };
};

module.exports = { wrapAsyncGen, wrapAsync };