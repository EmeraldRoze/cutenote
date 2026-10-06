// App Store Connect API helper — JWT auth + request wrapper
const crypto = require('crypto')
const fs = require('fs')
const os = require('os')

const KEY_ID = 'Y5NXGFNCFV'
const ISSUER = 'a8f9ba85-917d-49e9-888e-e128d4ef6822'
const KEY = fs.readFileSync(`${os.homedir()}/.appstoreconnect/private_keys/AuthKey_${KEY_ID}.p8`, 'utf8')

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function makeJWT() {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' }))
  const payload = b64url(JSON.stringify({ iss: ISSUER, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' }))
  const sig = crypto.sign('sha256', Buffer.from(`${header}.${payload}`), { key: KEY, dsaEncoding: 'ieee-p1363' })
  return `${header}.${payload}.${b64url(sig)}`
}

async function asc(method, path, body) {
  const res = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${makeJWT()}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: res.status, json, text }
}

module.exports = { asc }

// CLI: node asc.js GET /v1/certificates
if (require.main === module) {
  const [, , method, path, bodyArg] = process.argv
  asc(method, path, bodyArg ? JSON.parse(bodyArg) : undefined).then((r) => {
    console.log(r.status)
    console.log(JSON.stringify(r.json ?? r.text, null, 2).slice(0, 4000))
  })
}
