const dotenv = require('fs').readFileSync('.env', 'utf8');
const lines = dotenv.split('\n');
lines.forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    const value = rest.join('=').trim();
    console.log(`Key: "${key.trim()}", Value: "${value}"`);
  }
});
