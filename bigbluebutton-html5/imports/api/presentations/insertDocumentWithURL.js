import sha1 from 'js-sha1';
import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import convert from 'xml-js';

const BBB_SECRET = "QKgEbjHF2dXdCvBe4i4ZMsEe31gK5CnMOvoqtghAto";

const createChecksum = (apiCall, params) => {
  const queryString = new URLSearchParams(params).toString();
  return sha1(`${apiCall}${queryString}${BBB_SECRET}`);
};

const resToObject = (res) => {
  const rawObject = convert.xml2js(res.data, { compact: true, spaces: 4 });

  const finalObject = {};

  Object.keys(rawObject.response).forEach((key) => (finalObject[key] = rawObject.response[key]._text));

  return finalObject;
};

export default async function insertDocumentWithURL({ files, meetingID }) {
  const params = {
    meetingID,
    checksum: createChecksum('insertDocument', { meetingID }),
  };

  console.log("secret: ",BBB_SECRET)
  console.log("host: ", HOST_NAME)


  const filesXML = files.map((f) => `<module name="presentation"><document url="${f.url}" filename="${f.name}" downloadable="true" /></module>`).join('');
  console.log(filesXML)

    const res = await axios.post(`/bigbluebutton/api/insertDocument?${new URLSearchParams(params)}`, `<?xml version="1.0" encoding="UTF-8"?><modules>${filesXML}</modules>`, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });

  return resToObject(res);
}