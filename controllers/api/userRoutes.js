const router = require('express').Router();
const { User, Checkbook } = require('../../models');
const sequelize = require('../../config/connection');

router.post('/', async (req, res) => {
  try {
    const userData = await User.create(req.body);

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.status(200).json(userData);
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      
      res.json({ user: userData, message: 'You are now logged in!' });
    });

  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});


router.get('/categories/:id', async (req, res)=> {
  try {
    const categories = await Checkbook.findAll({
      attributes: ['category', [sequelize.fn('sum', sequelize.col('amount')), 'total_amount']],
      where: { user_id: req.params.id },
      group: "category"
    });
    res.json(categories);
    // serialize categories (map and get)
    // call a req.session.save & save the array to session (cat = cat)
    console.log(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
