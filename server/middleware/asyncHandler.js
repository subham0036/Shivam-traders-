export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const wrapRouter = (router) => {
  router.stack.forEach((layer) => {
    if (!layer.route) return;
    layer.route.stack.forEach((routeLayer) => {
      const handler = routeLayer.handle;
      if (handler.length === 4) return;
      routeLayer.handle = asyncHandler(handler);
    });
  });
  return router;
};
