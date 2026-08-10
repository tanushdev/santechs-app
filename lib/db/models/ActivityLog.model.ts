import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLogDocument extends Document {
  actor: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLogDocument>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ actor: 1, createdAt: -1 });
ActivityLogSchema.index({ resource: 1, resourceId: 1 });
ActivityLogSchema.index({ createdAt: -1 });

const ActivityLog: Model<IActivityLogDocument> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLogDocument>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
