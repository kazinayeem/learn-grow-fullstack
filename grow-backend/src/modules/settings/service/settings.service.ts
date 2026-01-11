import { Settings } from "../model/settings.model";

const ensureDoc = async () => {
  const doc = await Settings.findOne({ key: "global" });
  if (doc) return doc;
  return Settings.create({ key: "global", platformCommissionPercent: 20, kitPrice: 4500 });
};

export const getGlobalSettings = async () => {
  return ensureDoc();
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
        kitPrice: doc.kitPrice ?? 4500,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to get commission" };
  }
};

export const updateCommission = async (platformCommissionPercent: number, kitPrice?: number) => {
  try {
    const bounded = Math.min(100, Math.max(0, platformCommissionPercent));
    const kit = kitPrice !== undefined && kitPrice !== null ? Math.max(0, kitPrice) : undefined;
    const doc = await Settings.findOneAndUpdate(
      { key: "global" },
      { $set: { platformCommissionPercent: bounded, ...(kit !== undefined ? { kitPrice: kit } : {}) } },
      { new: true, upsert: true }
    );
    return {
      success: true,
      message: "Commission updated",
      data: {
        platformCommissionPercent: doc.platformCommissionPercent,
        instructorPayoutPercent: Math.max(0, 100 - doc.platformCommissionPercent),
        kitPrice: doc.kitPrice ?? 4500,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update commission" };
  }
};
