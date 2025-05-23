resource "aws_iam_policy" "freq_website_policy" {
  name        = "freq_website_policy"
  description = "Policy for frequency website S3 access"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = [
          "arn:aws:s3:::frequency-advisors-eu",
          "arn:aws:s3:::frequency-advisors-eu/*"
        ]
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "attach_freq_policy" {
  user       = "github_actions"  
  policy_arn = aws_iam_policy.freq_website_policy.arn
}
