module.exports = (function () {
  return {
    local: { // localhost
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: '1q2w3e4r!',
      database: 'board'
    },
    real: { // real server db info
      host: '',
      port: '',
      user: '',
      password: '',
      database: ''
    },
    dev: { // dev server db info
      host: '',
      port: '',
      user: '',
      password: '',
      database: ''
    }
  }
})();
