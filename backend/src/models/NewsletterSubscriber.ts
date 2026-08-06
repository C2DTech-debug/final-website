import { Schema, model, models } from "mongoose";

const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, default: "" },
    status: { type: String, enum: ["subscribed", "unsubscribed", "bounced"], default: "subscribed" },
    source: { type: String, default: "footer" }, // footer | popup | page
    unsubscribedAt: { type: Date },
  },
  { timestamps: true }
);

subscriberSchema.index({ createdAt: -1 });

export const NewsletterSubscriberModel = models.NewsletterSubscriber || model("NewsletterSubscriber", subscriberSchema);
