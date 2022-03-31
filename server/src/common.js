export const asyncRoute = (routeFunc) => async (req, res, next) => {
    try {
        await routeFunc(req, res, next)
    } catch(e) {
        res.status(500).send({ error: e.message })
    }
}