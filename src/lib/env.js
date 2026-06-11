const fs = require('fs');
const path = require('path');

let cachedLocalEnv = null;

function parseEnvFile(contents) {
  const values = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex < 1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      values[key] = value;
    }
  }

  return values;
}

function getLocalEnv() {
  if (cachedLocalEnv) {
    return cachedLocalEnv;
  }

  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    cachedLocalEnv = {};
    return cachedLocalEnv;
  }

  cachedLocalEnv = parseEnvFile(fs.readFileSync(envPath, 'utf8'));
  return cachedLocalEnv;
}

function getConfigValue(name, fallback = '') {
  const runtimeValue = process.env[name];
  if (runtimeValue && runtimeValue.trim()) {
    return runtimeValue.trim();
  }

  const localValue = getLocalEnv()[name];
  if (localValue && localValue.trim()) {
    return localValue.trim();
  }

  return fallback;
}

module.exports = {
  getConfigValue,
  getLocalEnv,
};