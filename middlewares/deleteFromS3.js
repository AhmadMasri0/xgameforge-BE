const { DeleteObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});


exports.deleteFromS3 = async (url) => {
    try {
        const key = url.split('/').slice(3).join('/');
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        });
        await s3.send(command);
        return true;
    } catch (err) {
        console.error('Error deleting file from S3:', err);
        return false;
    }
}
