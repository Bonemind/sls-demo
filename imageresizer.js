'use strict';
const AWS = require('aws-sdk');
const sharp = require('sharp');
const uuidv4 = require('uuid/v4');

const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const db = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

function getS3Object(bucket, key) {
	const params = {
		Bucket: bucket, 
		Key: key
	};
	return s3.getObject(params).promise();
}

function uploadS3Object(bucket, key, body) {
	const params = {
		Bucket: bucket, 
		Key: key,
		Body: body
	};
	return s3.putObject(params).promise();
}

async function moveS3Object(bucket, sourceKey, targetKey) {
	const copyParams = {
		Bucket: bucket,
		CopySource: `${bucket}/${sourceKey}`,
		Key: targetKey
	}
	console.log(copyParams);
	await s3.copyObject(copyParams).promise();

	const deleteParams = {
		Bucket: bucket,
		Key: sourceKey
	};
	console.log(deleteParams);
	return s3.deleteObject(deleteParams).promise();
}

function createDynamoDBRecord(id, originalName) {
	const newImage = {
		ImageId: id,
		name: originalName,
		createdAt: (new Date()).toISOString()
	};

	const insertParams = {
		TableName: process.env.DYNAMODB_TABLE,
		Item: newImage
	}

	return db.put(insertParams).promise();
}


module.exports.handler = async event => {
	const records = event.Records;
	console.log(JSON.stringify(event));

	const promises = records.map(async r => {
		const uuid = uuidv4();
		const bucket = r.s3.bucket.name;
		const uploadedImageKey = r.s3.object.key;
		const image = await getS3Object(bucket, uploadedImageKey);
		console.log('Got image data');
		const resized = await sharp(image.Body).resize(100).toBuffer();
		console.log('Resized image');
		await uploadS3Object(process.env.IMAGE_BUCKET, `resized/${uuid}/thumbnail.jpg`, resized);
		console.log('Uploaded resized image');
		await moveS3Object(bucket, uploadedImageKey, `resized/${uuid}/original.jpg`);
		console.log('Moved original');
		await createDynamoDBRecord(uuid, uploadedImageKey.substring(8));
	});

	await Promise.all(promises);
};
