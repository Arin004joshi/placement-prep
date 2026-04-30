const MockSession = require("../models/MockSession");

const markExpiredSessions = () =>
  MockSession.updateMany(
    {
      status: "in_progress",
      expiresAt: { $lte: new Date() }
    },
    {
      $set: {
        status: "expired"
      }
    }
  );

module.exports = {
  markExpiredSessions
};
