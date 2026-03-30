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
     image: {
      type: String,
      default: ""
    },
      about: {
      type: String,
      default: "Hey there! I am using Chat Vibe"
    },
    online: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: String
    },
     fcm_token: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const user = mongoose.models.User || mongoose.model("User", userSchema);

export default user;