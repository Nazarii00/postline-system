const { getOverviewReport } = require("../repositories/reports.repository");

const getOverviewReportHandler = async (req, res, next) => {
  try {
    const report = await getOverviewReport(req.query);
    return res.status(200).json({ data: report });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getOverviewReportHandler,
};
