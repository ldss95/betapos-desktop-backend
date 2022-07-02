import { ReadStream } from 'fs'
import aws from 'aws-sdk'

/**
 * Asynchronously upload file to Digital Ocean Spaces
 * @param path A path to upload file on Digital Ocean Space
 * @param fileName A name of file
 * @param content A content to uplod, can be file, or stream
 * @param type type of file, like application/pdf
 * 
 * @return string url
 */
function uploadFile(path: string, fileName: string, content: ReadStream | File, type: 'application/pdf' | 'application/excel') {
	const spaceEndpoint = new aws.Endpoint(process.env.S3_ENDPOINT!)
	const s3 = new aws.S3({ endpoint: spaceEndpoint })
	
	const uploadParams = {
		Key: `${path}${fileName}`,
		Body: content,
		Bucket: `${process.env.BUCKET_NAME}`,
		ContentType: type,
		ACL: 'public-read'
	}

	return new Promise<string>((resolve, reject) => {
		s3.upload(uploadParams, (error: any, results: any) => {
			if (error) {
				return reject(error)
			}
			
			resolve(results.Location)
		})
	})
}

export { uploadFile };
