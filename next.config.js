function formatDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2);
  const day = (`0${date.getDate()}`).slice(-2);
  const hours = (`0${date.getHours()}`).slice(-2);
  const minutes = (`0${date.getMinutes()}`).slice(-2);
  const seconds = (`0${date.getSeconds()}`).slice(-2);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}UTC`;
}

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    BUILD_DATETIME: formatDate(),
  },
};
