const Router = require("express-promise-router");
const db = require("../db");

const router = new Router();

module.exports = router;

// Get All Teams
router.get("/", async (req, res) => {
  const { rows } = await db.query("Select * FROM team ORDER BY id ASC;");
  res.send(rows);
});

//Get Team by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query("SELECT * FROM team WHERE id = $1", [id]);
  res.send(rows[0]);
});

// Get roster of team members by team id
router.get("/:id/roster", async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(
    `
  SELECT * FROM team t 
  LEFT JOIN profile p ON p.team_id = $1
  LEFT JOIN users u ON u.id = p.user_id
  LEFT JOIN rank r ON r.id = p.rank_id
  LEFT JOIN branch b ON b.id = p.branch_id
  LEFT JOIN position po ON po.id = p.position_id
  WHERE t.id = $1;`,
    [id]
  );
  res.send(rows);
});
