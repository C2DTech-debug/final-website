import { Schema, model, models } from "mongoose";

const teamMemberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    photo: { type: String, default: "" },
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    email: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

teamMemberSchema.index({ order: 1 });

export const TeamMemberModel = models.TeamMember || model("TeamMember", teamMemberSchema);
