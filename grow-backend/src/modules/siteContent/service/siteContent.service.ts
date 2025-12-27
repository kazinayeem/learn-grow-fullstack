import { SiteContent } from "../model/siteContent.model";

export const getSiteContent = async (page: string) => {
  try {
    const doc = await SiteContent.findOne({ page });
    return { success: true, message: "Content retrieved", data: doc || null };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to get content" };
  }
};

export const upsertSiteContent = async (page: string, content: any) => {
  try {
    const updated = await SiteContent.findOneAndUpdate(
      { page },
      { $set: { content } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return { success: true, message: "Content saved", data: updated };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to save content" };
  }
};
