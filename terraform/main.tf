provider "aws" {
  region = "eu-west-1"
  default_tags {
    tags = {
      Environment = "Webhosting"
      Owner       = "BWalters/DFlower"
      terraform   = "True"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

terraform {
  required_version = ">= 1.10"
  required_providers {

    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.82"
    }
  }
  backend "s3" {
    bucket         = "freq-webhosting-tf-state-eu-west-1"
    key            = "webhosting/terraform.tfstate"
    dynamodb_table = "terraform-state-lock"
    region         = "eu-west-1"
    encrypt        = "true"
  }
}

data "aws_caller_identity" "current" {}

