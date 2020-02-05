'use strict';
const AWS = require('aws-sdk');

const db = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

module.exports.handler = async event => {
	const params = {
		TableName : process.env.DYNAMODB_TABLE
	};

	const results = await db.scan(params).promise();
	const images = results.Items.map(r => ({
		name: r.name,
		created_at: r.createdAt,
		id: r.ImageId,
		original: `${process.env.IMAGE_BUCKET}/resized/${r.ImageId}/original.jpg`,
		thumbnail: `${process.env.IMAGE_BUCKET}/resized/${r.ImageId}/thumbnail.jpg`
	}));
	return {
		statusCode: 200,
		body: JSON.stringify({results: images, total: images.length}, null, 2)
	};
};
