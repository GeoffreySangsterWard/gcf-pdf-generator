const puppeteer = require("puppeteer");
const uuidv4 = require("uuid/v4");
const att = new Array();
// Your Google Cloud Platform project ID
const projectId = process.env.PROJECT_ID;
// Fallback options
const fbkBucket =  process.env.FALLBACK_BUCKET_NAME;
const fbkLocation = process.env.FALLBACK_FILE_LOCATION;

// Create storage client
const { Storage } = require("@google-cloud/storage");
const storage = new Storage({
  projectId: projectId
});
const responseCodes = ["200",200 ];

exports.savePDF = async (event, context) => {

  if (typeof event.attributes !== "undefined") {
    Object.assign(att, event.attributes, att);  
  }
  console.log(att);
  const pdfStorageLoaction =
    finder(att, "pdfLocation", fbkLocation) + "/" +
    finder(att, "name", uuidv4()) +
    ".pdf";
  const html = new Buffer(event.data, "base64").toString("utf8");
  const bucket = storage.bucket(finder(att, "bucket", fbkBucket));
  const attMetadata = { contentType: "application/pdf" };

  //console.log(html);
  if (typeof att.metadata !== "undefined") {
    Object.assign(att, att.metadata, att);
  }
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();
  const pdfCallType = finder(att, "callType", "data:text/html,");
  //visit the page and wait till all asset & XHR calls are done.
  const response = await page.goto(pdfCallType + html, { waitUntil: "networkidle2", timeout: 0 });
  // if url requested check response code for errors 
  if (pdfCallType.indexOf("http") > -1) {
    const headers = response.headers();
    if (!responseCodes.includes(headers.status)) {
      console.log("page request error");
      console.log(headers);
      throw new Error(html + " " + headers.data + " " + headers.status);
    }
  }
  
  await page.pdf({
    path: "/tmp/file.pdf",
    printBackground: true,
    format: "A4",
    margin: { top: ".5cm", right: ".5cm", bottom: ".5cm", left: ".5cm" }
  });
  
  await browser.close();

  console.log(pdfStorageLoaction);
  await bucket
    .upload("/tmp/file.pdf", {
      destination: pdfStorageLoaction,
      metadata: attMetadata
    })
    .then(() => {
      console.log("pass");
    });
};

function finder(arr, key, fallback) {
  if (typeof arr[key] !== "undefined") {
    return arr[key];
  } else {
    console.log(key + "  NOT FOUND in finder");
    return fallback;
  }
}
/*
## Topics 
##
##            - gcloud pubsub topics create [TOPIC NAME] --project "[PROJECT NAME]"

## Deployment - just run inside folder
## 
##            - gcloud functions deploy "[FUNCTION NAME]" --project "[PROJECT NAME]" --trigger-resource [TOPIC NAME] --trigger-event google.pubsub.topic.publish  --timeout "60s" --region "[REGION]" --runtime "nodejs8" --entry-point "savePDF" --memory "1GB" 
## 

*/