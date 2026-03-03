import mongoose from "mongoose";

// const statusSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     text: String,
//     image: String,
//     expireAt: Date,
//     seenBy: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User"
//     }]
//   },
//   { timestamps: true }
// );
// statusSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// export default mongoose.model("Status", statusSchema);


const singleStatusSchema = new mongoose.Schema(
  {
    text: String,
    image: String,
    expireAt: Date,
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

const statusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true  
    },
    statuses: [singleStatusSchema]
  },
  { timestamps: true }
);

statusSchema.index(
  { "statuses.expireAt": 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model("Status", statusSchema);
