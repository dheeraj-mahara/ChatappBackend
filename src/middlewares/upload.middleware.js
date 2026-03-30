//         -==-=-==--= cloudinery work -=-=-=-==--====--==

import multer from "multer";
const storage =multer.memoryStorage()
export const upload = multer({
    storage,
    limits:{
        fieldSize: 5 * 1024 * 1024
    }
})