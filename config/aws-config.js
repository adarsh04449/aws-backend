const AWS = require("aws-sdk");

AWS.config.update({ region: "us-west-1" });

const s3 = new AWS.S3();

const S3_BUCKET = "bucketgithubclone";

module.exports = { s3, S3_BUCKET };