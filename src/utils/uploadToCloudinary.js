//    -==-=-==--= cloudinery work -=-=-=-==--====--==
import cloudinary from "../config/cloudinary.js";

export const uploadeImage = (file, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image"
            },
            (error, result) => {
                if (error) reject(error)
                else resolve({
                    imageUrl: result.secure_url,   
                    public_id: result.public_id    
                });
            }
        ).end(file.buffer)
    })
}