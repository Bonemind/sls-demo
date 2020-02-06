# sls-demo

This application is a simple example of a serverless backend application.
What it does is pick up images uploaded in a certain bucket defined in the `serverless.yml` file, resize it, 
upload a thumbnail and move the original, and then store some info about it in a DynamoDB table. This can then be listed
at the `/images` endpoint of the deployed api gateway.

You can check out the slide repo [here](https://github.com/Bonemind/sls-presentation) which contains the accompanying slides for this app.

## Deployment

Make sure you have the aws cli configured as described [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html).

You'll also need nodejs installed, and the `serverless` npm package installed which you can get like so:

```
npm i -g serverless
```

Once the cli is configured, install the npm packages, and deploy the app:
```
npm i
sls deploy
```

If all goes well, serverless should give you a url where you can list the images that have been resized.
At this point you'll have no images, so go to the bucket that was just deployed by serverless, create an `uploads` folder,
and upload a jpg image.

After a few moments the image should be gone, and you should have an extra folder in the bucket called `resized`.
This will then have the resized image. If you now call your api endpoint you should see one image in there.

## Troubleshooting

Since s3 buckets have to be uniquely named globally across aws, it's possible your bucket name is not available.
You can change the image bucket name in the `serverless.yml` file, under `custom` > `s3bucket`:

```
custom:
  stage: ${opt:stage, self:provider.stage}
  s3bucket: rs.imageresize.demo.${self:custom.stage} << Make this name something different
  dynamodb_table: imageresize_${self:custom.stage}
```
