// Imports
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jsonwebtoken = require('jsonwebtoken');
const { secret } = require('./configuration/config');

// Controllers import
const UserController = require('./controller/user.controller');
const AuthController = require('./controller/auth.controller');
const DiscussionController = require('./controller/discussion.controller');
const MessageController = require('./controller/message.controller');

// Initialisation
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
	if (!req.cookies.jwt) {
		return next();
	}

	req.user = jsonwebtoken.verify(req.cookies.jwt, secret);

	next();
});

// Routes call
app.use('/api/users', UserController);
app.use('/api/auth', AuthController);
app.use('/api/discussions', DiscussionController);
app.use('/api/messages', MessageController);

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`)
});
