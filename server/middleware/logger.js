const ActivityLog = require('../models/ActivityLog');

const logActivity = (action, entityType) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;

    res.json = function(data) {
      // Restore original method
      res.json = originalJson;

      // Log if response is successful
      if (data && data.success !== false && req.user) {
        ActivityLog.create({
          user: req.user._id,
          action,
          entityType,
          entityId: data.data?._id || req.params.id,
          details: {
            body: req.body,
            params: req.params,
            query: req.query,
            response: data
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }).catch(console.error);
      }

      return res.json(data);
    };

    next();
  };
};

module.exports = { logActivity };
