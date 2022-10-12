module.exports = {
  webpack: (config) => {
    // refresh
    config.watchOptions.poll = 300;
    return config;
  },
};
