const {
  dynamicGroupingBasedOnPerformance,
} = require("../../controllers/matchmaking");
const tf = require("@tensorflow/tfjs");
const matchmaking = (app) => {
    app.post('/group-teams', async (req, res) => {
        try {
            const teams = req.body.teams;
            const numGroups = req.body.numGroups || 2; // Default to 2 groups if not provided
    
            if (!teams || !Array.isArray(teams) || teams.length === 0) {
                return res.status(400).json({ error: 'No teams provided' });
            }
    
            if (numGroups < 1) {
                return res.status(400).json({ error: 'Number of groups must be at least 1' });
            }
    
            const groupedTeams = await groupTeams(teams, numGroups);
            res.json(groupedTeams);
        } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
    async function groupTeams(teams, numGroups) {
        try {
            const response = await axios.post(`${apiUrl}/group-teams`, {
                teams: teams,
                numGroups: numGroups
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    }
};

module.exports = matchmaking;
