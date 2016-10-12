var jwt = require("jsonwebtoken"),
  config = require("../../config").config(),
  User = require("../models/user");

var secret_token = config.secret;

/**
 * @api {post} /api/users/authenticate Authenticate user
 * @apiName authenticate
 * @apiGroup Users
 * @apiVersion 0.1.0
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User password
 *
 * @apiSuccessExample Success-Response
 *    HTTP/1.1 200 OK
 *    {
 *      token:  "12345abcdef",
 *      user: {
 *        _id: user._id,
 *        email: "user@example.com",
 *        firstname: "John",
 *        lastname: "Doe"
 *      }
 *    }
 *
 * @apiError InvalidCredentials Wrong email or password
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 401 Not Authorized
 *    {
 *      errors: {
 *        user: {
 *          message: "Invalid Credentials."
 *        }
 *      }
 *    }
 */

function authenticate(req, res){
  User
    .findOne({ email: req.body.email })
    .select("+password +active")
    .exec(function(err, user){
      if (err){
        return res.status(400).send({message: "There was a problem on authenticate user", error: err})
      }
      if (!user) {
        res.status(401).json({ message: "Login failed",
              errors: { user: { message: "Invalid Credentials."  } } });
      } else {
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
          res.status(401).json({ message: "Login failed",
              errors: { user: { message: "Invalid Credentials."  } } });
        } else {
          // Check if user is active
          if (!user.active) {
            res.status(401).json({ message: "Login failed",
              errors: { user: { message: "Please activate your account."  } } });
          } else {
            var token = jwt.sign({
              _id: user._id,
              email: user.email
            }, secret_token, { expiresIn: 86400 }); // 86400 seconds = 1 day
            res.json({
              token:  token,
              user: user.asJson()
            });
          }
        }
      }
    });
}

/**
 * @api {post} /api/users Register new user
 * @apiName user_create
 * @apiGroup Users
 * @apiVersion 0.1.0
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User password
 * @apiParam {String} firstname User firstname
 * @apiParam {String} lastname User lastname
 *
 * @apiSuccessExample Success-Response
 *    HTTP/1.1 201 Created
 *    {
 *      token:  "12345abcdef",
 *      user: {
 *        _id: user._id,
 *        email: "user@example.com",
 *        firstname: "John",
 *        lastname: "Doe"
 *      }
 *    }
 *
 * @apiError EmailAlreadyExists The email already exists
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 409 Conflict
 *    {
 *      errors: {
 *        email: {
 *          message: "A user with that email already exists."
 *        }
 *      }
 *    }
 *
 * @apiError ValidationError Validation error
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 400 Bad Request
 *    {
 *      errors: {
 *        email: {
 *          message: "A user with that email already exists."
 *        }
 *      }
 *    }
 */
function createUser(req, res){
  var user = new User();
  user.email = req.body.email;
  user.password = req.body.password;
  user.firstname = req.body.firstname;
  user.lastname = req.body.lastname;

  user.save(function(err){
    if (err) {
      // duplicate entry
      if (err.code === 11000)
        return res.status(409).json({
          message: "User validation failed",
          errors: {
            email: {
              message: "A user with that email already exists."
            }
          }
        });
      else
        return res.status(400).send(err);
    }
    res.status(201).json({
      message: "User created!"
    });
  });
}

/**
 * @api {put} /api/user Update user
 * @apiName user_update
 * @apiGroup Users
 * @apiVersion 0.1.0
 *
 * @apiHeader {String} x-access-token Users unique access token
 *
 * @apiParam {String} email User email
 * @apiParam {String} password User password
 * @apiParam {String} firstname User firstname
 * @apiParam {String} lastname User lastname
 *
 * @apiSuccessExample Success-Response
 *    HTTP/1.1 200 OK
 *    {
 *      message:  "User updated!",
 *      user: {
 *        _id: user._id,
 *        email: "user@example.com",
 *        firstname: "John",
 *        lastname: "Doe"
 *      }
 *    }
 *
 * @apiError InvalidPassword Wrong password
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 400 Bad Request
 *    {
 *      errors: {
 *        password: {
 *          message: "Current password is invalid."
 *        }
 *      }
 *    }
 */
function updateCurrentUser(req, res) {
  var user = req.current_user;
  if(req.files.picture) {
    user.picture = {
      url: null,
      path: null,
      original_file: req.files.picture
    };
  }
  if (req.body.password && req.body.new_password) {
    // Check current password
    var validPassword = user.comparePassword(req.body.password);
    if (!validPassword) {
      return res.status(400).json({
        message: "User validation failed",
        errors: {
          password: {
            message: "Current password is invalid." }
        }
      });
    }

    user.password = req.body.new_password;
  }

  if (req.body.firstname ){
    user.firstname = req.body.firstname
  }

  if (req.body.lastname ){
    user.lastname = req.body.lastname
  }

  user.save(function(err, updatedUser){
    if (err) return res.status(400).send(err);
    res.json({
      message: "User updated!",
      user: updatedUser.asJson()
    });
  });
}

/**
 * @api {post} /api/users/activate Activate user
 * @apiName user_activate
 * @apiGroup Users
 * @apiVersion 0.1.0
 *
 * @apiParam {String} activation_token Activation token
 *
 * @apiSuccessExample Success-Response
 *    HTTP/1.1 200 OK
 *    {
 *      message:  "Account activated."
 *    }
 *
 * @apiError InvalidToken Invalid activation token
 *
 * @apiErrorExample Error-Response
 *    HTTP/1.1 400 Bad Request
 *    {
 *      errors: {
 *        user: {
 *          message: "Invalid token."
 *        }
 *      }
 *    }
 */
function activateAccount(req, res) {
  User.activateAccount(req.body.activation_token, function(err, user) {
    if (err) return res.status(400).send(err);

    if (user)
        return res.json({
          message: "Account activated."
        });
    else
      return res.status(400).json({
        errors: {
          user: {
            message: "Invalid token."
          }
        }
      });
  });
}

exports.authenticate = authenticate;
exports.createUser = createUser;
exports.updateCurrentUser = updateCurrentUser;
exports.activateAccount = activateAccount;
