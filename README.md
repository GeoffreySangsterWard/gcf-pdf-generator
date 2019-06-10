# Node JS HTML to PDF Generator 
******
Simple generator built to either get the HTML as a string or a URL and save the generated PDF to the Cloud Storage. 

### Reqires message to come from Pub/Sub

Attributes sent with the payload
* GCS Bucket name and loaction
* PDF file name
* HTML formate either URL or HTML string 
    * HTML String
        * "callType": "data:text/html," 
        * "html": "[HTML string]" 
    *   URL 
        * "callType": "[PROTOCOL]" (https://)
        * "html": "[PATH]" (full-url-path.sample)
* Fall back filename to UUID
* All fall back options can be set as a environment variables
### Dependencies
* google-cloud/pubsub: 0.18.0
* @google-cloud/storage: 2.0.3
* puppeteer: 1.9.0
* uuid: 3.3.2

Sample payload to come 