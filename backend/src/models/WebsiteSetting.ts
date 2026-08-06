import { Schema, model, models } from "mongoose";

const websiteSettingSchema = new Schema(
  {
    group: { type: String, required: true, index: true }, // hero | about | footer | contact | social | company | estimator | homepage | misc
    key: { type: String, required: true, index: true }, // unique within group
    label: { type: String, default: "" }, // human-readable label for admin UI
    value: { type: Schema.Types.Mixed, default: null }, // string | number | object | array
    type: { type: String, default: "text" }, // text | textarea | rich | image | number | boolean | json
    updatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  },
  { timestamps: true }
);

websiteSettingSchema.index({ group: 1, key: 1 }, { unique: true });

export const WebsiteSettingModel = models.WebsiteSetting || model("WebsiteSetting", websiteSettingSchema);
