# CloudFront Manual Setup Instructions

Since we are using manual CloudFront distribution with Amplify Gen 2 Storage (S3), follow these steps to securely serve your images.

## 1. Create CloudFront Distribution
1.  Go to the **AWS Console** > **CloudFront**.
2.  Click **Create Distribution**.
3.  **Origin Domain**: Select the S3 bucket created by Amplify (e.g., `amplify-YOUR_APP_ID-dev-branch-drivebucket...`).
4.  **Origin Access**: Select **Origin access control settings (recommended)**.
    - Click **Create control setting**.
    - Name existing setting, keep defaults (Sign requests).
    - Click **Create**.
5.  **Viewer Protocol Policy**: usage "Redirect HTTP to HTTPS".
6.  **Allowed HTTP Methods**: "GET, HEAD" is sufficient for serving images.
7.  Click **Create Distribution**.

## 2. Update S3 Bucket Policy
**Crucial Step**: CloudFront will provide a policy statement that you MUST add to your S3 bucket policy.
1.  After creating the distribution, you will see a banner saying "The S3 bucket policy needs to be updated".
2.  Click **Copy policy** (or go to the Origins tab, edit the origin, and find the policy copy button).
3.  Go to **AWS Console** > **S3**.
4.  Open your Amplify Storage Bucket.
5.  Go to **Permissions** > **Bucket policy**.
6.  Edit the policy and **Append** the CloudFront statement to the `Statement` array.
    - *Do not delete existing Amplify policies.* Just add the new object to the list.

## 3. Update Frontend Component
1.  Copy the **Distribution Domain Name** (e.g., `d1234567890.cloudfront.net`).
2.  Open `src/components/ProductUpload.tsx`.
3.  Update the `CLOUDFRONT_DOMAIN` constant with your distribution domain.
    ```typescript
    const CLOUDFRONT_DOMAIN = 'https://d1234567890.cloudfront.net';
    ```
