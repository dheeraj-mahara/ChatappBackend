import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {id: {
  type: String,
  unique: true,
  default: () => new mongoose.Types.ObjectId().toString()
},
   
    name: {
      type: String,
      required: true,
      unique: true
    },
    contact: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    online: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
