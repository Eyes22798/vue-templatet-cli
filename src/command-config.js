const COMMAND_LIST = [
  {
    command: 'create <projectName>',
    description: 'create a new project',
    alias: 'c',
    options: [
      ['-f', '--force', 'overwrite target directory if it exists'], // 强制覆盖
      ['-v2', '--vue2', 'vue2 template'],
      ['-v3', '--vue3', 'vue3 template'],
    ],
    action: require('./commandHandler/create'),
    examples: ['-f', '--force', '-v2', '--vue2', '-v3', '--vue3'].map((v) => `create projectName ${v}`)
  }
]

module.exports = COMMAND_LIST