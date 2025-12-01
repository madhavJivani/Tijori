import fs from "fs"
import path from "path"
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const getMimeType = (ext) => {
            const mimeTypes = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.pdf': 'application/pdf',
                '.txt': 'text/plain',
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
            };
            return mimeTypes[ext] || 'application/octet-stream';
        };

export const getFileFromS3 = async (fileKey, expiresIn = 3600) => {
    try {
        // Extract file extension from the fileKey to determine content type
        const fileExtension = path.extname(fileKey).toLowerCase();
        
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
            ResponseContentDisposition: 'inline', // Force inline viewing
            ResponseContentType: getMimeType(fileExtension), // Set proper MIME type
        });
        const url = await getSignedUrl(s3, command, { expiresIn });// default expiry is 3600 seconds (1 hour)
        return url;
    } catch (error) {
        console.error(`Error getting file from S3: ${error}`);
        return null;
    }
}

export const getDownloadUrlFromS3 = async (fileKey, originalFileName, expiresIn = 3600) => {
    try {
        const fileExtension = path.extname(fileKey).toLowerCase();
        
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
            ResponseContentDisposition: `attachment; filename="${originalFileName}${fileExtension}"`, // Force download with original filename
            ResponseContentType: getMimeType(fileExtension), // Set proper MIME type
        });
        const url = await getSignedUrl(s3, command, { expiresIn });// default expiry is 3600 seconds (1 hour)
        return url;
    } catch (error) {
        console.error(`Error getting download URL from S3: ${error}`);
        return null;
    }
}

export const uploadFileToS3 = async (userId, fileLocalPath, actualFileName) => {
    try {
        if (!fileLocalPath) return null;
        const fileContent = fs.readFileSync(fileLocalPath);
        
        // Extract file extension from local file path
        const fileExtension = path.extname(fileLocalPath);
        
        const fileKey = `${userId}/${Date.now()}-${actualFileName}${fileExtension}`;
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
            Body: fileContent,
            ContentDisposition: 'inline', // Force inline viewing
        });
        await s3.send(command);

        // File is now uploaded with ContentDisposition: 'inline'
        fs.unlinkSync(fileLocalPath);
        return fileKey;
    } catch (error) {
        console.log(`Error uploading file to S3: ${error}`);
        fs.unlinkSync(fileLocalPath);
        return null;
    }
};