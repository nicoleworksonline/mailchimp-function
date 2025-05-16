
const crypto = require('crypto');
const fetch = require('node-fetch');

const API_KEY = process.env.MAILCHIMP_API_KEY;
const LIST_ID = '27e1cc01a0';

exports.handler = async (event) => {
  const { email, firstName } = JSON.parse(event.body || '{}');
  if (!email) return { statusCode: 400, body: 'Missing email' };

  const dc = API_KEY.split('-')[1];
  const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${hash}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${Buffer.from('any:' + API_KEY).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed',
      merge_fields: { FNAME: firstName || '' }
    })
  });

  return {
    statusCode: response.status,
    body: await response.text()
  };
};
