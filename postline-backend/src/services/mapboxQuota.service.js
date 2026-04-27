const fs = require("fs");
const path = require("path");

const DEFAULT_MONTHLY_LIMIT = 15000;
const MAX_MONTHLY_LIMIT = 15000;
const DEFAULT_QUOTA_FILE = ".mapbox-quota.json";

let quotaLock = Promise.resolve();

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const withQuotaLock = (task) => {
  const run = quotaLock.then(task, task);
  quotaLock = run.catch(() => {});
  return run;
};

const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
};

const getMonthlyLimit = () => {
  const configuredLimit = Number(process.env.MAPBOX_MONTHLY_REQUEST_LIMIT);

  if (!Number.isFinite(configuredLimit) || configuredLimit <= 0) {
    return DEFAULT_MONTHLY_LIMIT;
  }

  return Math.min(Math.floor(configuredLimit), MAX_MONTHLY_LIMIT);
};

const getQuotaFilePath = () => {
  const configuredPath = process.env.MAPBOX_QUOTA_FILE || DEFAULT_QUOTA_FILE;

  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }

  return path.resolve(__dirname, "../..", configuredPath);
};

const createFreshQuota = () => ({
  period: getCurrentPeriod(),
  used: 0,
  limit: getMonthlyLimit(),
  updatedAt: new Date().toISOString(),
});

const readQuota = () => {
  const quotaFile = getQuotaFilePath();

  try {
    const raw = fs.readFileSync(quotaFile, "utf8");
    const quota = JSON.parse(raw);

    if (quota.period !== getCurrentPeriod()) {
      return createFreshQuota();
    }

    if (!Number.isInteger(quota.used) || quota.used < 0) {
      throw createError(500, "Файл ліміту Mapbox пошкоджений");
    }

    return {
      ...quota,
      limit: getMonthlyLimit(),
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return createFreshQuota();
    }

    if (error.status) {
      throw error;
    }

    throw createError(500, "Не вдалося прочитати файл ліміту Mapbox");
  }
};

const writeQuota = (quota) => {
  const quotaFile = getQuotaFilePath();
  const temporaryFile = `${quotaFile}.tmp`;

  try {
    fs.mkdirSync(path.dirname(quotaFile), { recursive: true });
    fs.writeFileSync(temporaryFile, `${JSON.stringify(quota, null, 2)}\n`, "utf8");
    fs.renameSync(temporaryFile, quotaFile);
  } catch {
    throw createError(500, "Не вдалося оновити ліміт Mapbox, запит не виконано");
  }
};

const assertMapboxQuotaAvailable = async (requestCount = 1) =>
  withQuotaLock(() => {
    const count = Number(requestCount);
    if (!Number.isInteger(count) || count <= 0) {
      throw createError(500, "Некоректний розмір резерву Mapbox");
    }

    const quota = readQuota();
    const remaining = quota.limit - quota.used;

    if (remaining < count) {
      throw createError(
        429,
        `Ліміт Mapbox запитів вичерпано: ${quota.used}/${quota.limit} за ${quota.period}`
      );
    }

    return {
      ...quota,
      remaining,
    };
  });

const reserveMapboxRequest = async (requestCount = 1) =>
  withQuotaLock(() => {
    const count = Number(requestCount);
    if (!Number.isInteger(count) || count <= 0) {
      throw createError(500, "Некоректний розмір резерву Mapbox");
    }

    const quota = readQuota();

    if (quota.used + count > quota.limit) {
      throw createError(
        429,
        `Ліміт Mapbox запитів вичерпано: ${quota.used}/${quota.limit} за ${quota.period}`
      );
    }

    const updatedQuota = {
      ...quota,
      used: quota.used + count,
      updatedAt: new Date().toISOString(),
    };

    writeQuota(updatedQuota);

    return {
      ...updatedQuota,
      remaining: updatedQuota.limit - updatedQuota.used,
    };
  });

const getMapboxQuotaStatus = async () =>
  withQuotaLock(() => {
    const quota = readQuota();

    return {
      ...quota,
      remaining: quota.limit - quota.used,
    };
  });

module.exports = {
  assertMapboxQuotaAvailable,
  getMapboxQuotaStatus,
  reserveMapboxRequest,
};
