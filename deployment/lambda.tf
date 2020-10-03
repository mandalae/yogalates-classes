provider "aws" {
  region = "eu-west-1"
}

resource "aws_lambda_permission" "Yogalates-classes" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.Yogalates-classes.function_name}"
  principal     = "apigateway.amazonaws.com"
}

resource "aws_lambda_function" "Yogalates-classes" {
  filename      = "../artifact/artifact.zip"
  function_name = "Yogalates-classes"
  role          = "arn:aws:iam::368263227121:role/BasicLambdaRole"
  handler       = "index.handler"
  source_code_hash = "${filebase64sha256("../artifact/artifact.zip")}"
  runtime       = "nodejs12.x"
}
