import { Settings } from "../model/settings.model";

const ensureDoc = async () => {
  const doc = await Settings.findOne({ key: "global" });
  if (doc) return doc;
  return Settings.create({ key: "global", platformCommissionPercent: 20 });
};

export const getCommission = async () => {
  try {
    const doc = await ensureDoc();
    return {
      success: true,
      message: "Commission retrieved",
      data: {
        platformCommissionPercent: doc.platformCommissionPercent,
        instructorPayoutPercent: Math.max(0, 100 - doc.platformCommissionPercent),
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to get commission" };
  }
};

export const updateCommission = async (platformCommissionPercent: number) => {
  try {
    const bounded = Math.min(100, Math.max(0, platformCommissionPercent));
    const doc = await Settings.findOneAndUpdate(
      { key: "global" },
      { $set: { platformCommissionPercent: bounded } },
      { new: true, upsert: true }
    );
    return {
      success: true,
      message: "Commission updated",
      data: {
        platformCommissionPercent: doc.platformCommissionPercent,
        instructorPayoutPercent: Math.max(0, 100 - doc.platformCommissionPercent),
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update commission" };
  }
};
