const asyncHandler = require('../middleware/asyncHandler');

const getAdminHealth = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin module is active',
    data: {
      admin: req.user.fullName
    },
    admin: req.user.fullName
  });
});

module.exports = {
  getAdminHealth
};
