/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
    directories: {
        output: 'dist/electron',
    },
    publish: null,
    npmRebuild: false,
    files: [
        'dist/main/**/*',
        'dist/preload/**/*',
        'dist/render/**/*',
    ],
    win: {
        target: [{
            target: 'nsis',
            arch: [
                'x64',
                'ia32',
            ],
        }],
    },
    nsis: {
        shortcutName: 'zhe_li_xue_xi',
        oneClick: false,
        allowElevation: true,
        allowToChangeInstallationDirectory: true,
        perMachine: true,
    },
}

module.exports = config
