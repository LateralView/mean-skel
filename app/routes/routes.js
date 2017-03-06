var express = require("express");
var token_authentication = require("../middleware/auth");

function setup(app, handlers) {

// ########## Authentication Route ##########
  var authenticationRouter = express.Router();

  // Without authentication
  authenticationRouter.post("/authenticate", handlers.users.authenticate)

  app.use("/api/users", authenticationRouter);

// ########## User Routes ##########
  var usersRouter = express.Router();

  // Without authentication
  usersRouter.post("/", handlers.users.createUser);
  usersRouter.post("/activate", handlers.users.activateAccount);

  app.use("/api/users", usersRouter);

  var userRouter = express.Router();
  // With Token authentication
  userRouter.use(token_authentication);
  userRouter.put("/", handlers.users.updateCurrentUser)
  userRouter.get("/", handlers.users.getUsers)

  app.use("/api/user", userRouter);

// ########## More Routes ##########

// ########## Event Routes ##########
  var eventsRouter = express.Router();
  eventsRouter.use(token_authentication);

  eventsRouter.post('/', handlers.events.createEvent.bind(handlers.events));
  eventsRouter.put('/', handlers.events.updateEvent.bind(handlers.events));
  // eventsRouter.put('/answer', handlers.events.answerEvent);
  // eventsRouter.put('/cancel', handlers.events.cancelEvent);

  app.use('/api/event', eventsRouter);


};

exports.setup = setup;
