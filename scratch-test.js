const http = require('http');
const url = require('url');

const proxyUrlStr = process.env.http_proxy || process.env.HTTP_PROXY || 'http://127.0.0.1:52444';
console.log('Using proxy:', proxyUrlStr);
const proxyUrl = url.parse(proxyUrlStr);

const options = {
  host: proxyUrl.hostname,
  port: proxyUrl.port,
  path: 'https://registry.npmjs.org/zod',
  method: 'GET',
  headers: {
    'Host': 'registry.npmjs.org',
    'User-Agent': 'npm/11.13.0 node/v24.16.0',
    'Connection': 'keep-alive'
  }
};

const req = http.request(options, (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Body length:', data.length);
    console.log('Body snippet:', data.substring(0, 500));
  });
});

req.on('error', (err) => {
  console.error('Error:', err);
});

req.end();
