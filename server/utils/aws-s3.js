import fs from "fs"

export const uploadFileToS3 = async (fileLocalPath, actualFileName) => {
    try {
        if (!fileLocalPath) return null;
        // let response = await cloudinary.uploader.upload(file, {
        //     resource_type: 'auto',
        //     secure: true
        // });
        // console.log(`File upload successful on cloudinary url is : ${response.secure_url}`);
        // return response?.secure_url || "./temp/file-path";
        await new Promise(resolve => setTimeout(resolve, 1000)); // temporarily simulate delay
        fs.unlinkSync(fileLocalPath);
        return "./temp/file-path";
    } catch (error) {
        console.log(`Error uploading file to S3: ${error}`);
        fs.unlinkSync(fileLocalPath);
        return null;
    }
};