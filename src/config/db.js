import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("mongo connect");
        
    }catch(err) {
        console.log("mongdb err ",err);
        process.exit(1)
    }
}
export default connectDB 