import modal from './modal'

export default {
    install: (app) => {
        app.config.globalProperties.$modal = modal
    }
}
