const authModer = require('../middlewares/authModer');
const singerController = require('../controllers/singer.controller');
const getCurrentUser = require('../middlewares/getCurrentUser');

var router = require("express-promise-router")();

router.get('/get-list', singerController.getList);
router.get('/:id/get', getCurrentUser, singerController.getByID);
router.get('/list-option', singerController.getListOption);
router.post('/', authModer, singerController.create);
router.put ('/:id', authModer, singerController.update);

module.exports = router;