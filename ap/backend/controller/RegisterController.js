
class RegisterController {

    async register(body, ctx) { 
        let username = ctx.request.body.username
        if (username === '' || users.has(username)) {
            ctx.body = {
                id: apName,
                tod: Date.now(),
                priority: -1,
                type: "MT_REG_RJT",
                username: username,
                error: 'Username already exists.'
            }
            ctx.status = 409
        }
        else {

        }

        return ctx;
    }
}
