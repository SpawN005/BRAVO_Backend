from fastapi import FastAPI, HTTPException
from typing import List
from pydantic import BaseModel
import tensorflow as tf
import numpy as np

app = FastAPI()

class Team(BaseModel):
    name: str
    tournament_won: int
    cards: int
    goals: int
    clean_sheet: int
    matches_won: int

def dynamic_grouping_based_on_performance(teams: List[Team], num_groups: int) -> List[List[Team]]:
    performance_metrics = [[team.tournament_won, team.cards, team.goals, team.clean_sheet, team.matches_won] for team in teams]
    performance_metrics_normalized = np.array(performance_metrics) / np.max(performance_metrics, axis=0)
    tensor = tf.convert_to_tensor(performance_metrics_normalized, dtype=tf.float32)

    kmeans = tf.keras.cluster.KMeans(num_groups)
    cluster_labels = kmeans.fit_predict(tensor).numpy()

    groups = [[] for _ in range(num_groups)]
    for label, team in zip(cluster_labels, teams):
        groups[label].append(team)

    return groups

@app.post("/group-teams", response_model=List[List[Team]])
async def group_teams(teams: List[Team], num_groups: int = 2):
    if not teams:
        raise HTTPException(status_code=400, detail="No teams provided")
    if num_groups < 1:
        raise HTTPException(status_code=400, detail="Number of groups must be at least 1")
    
    grouped_teams = dynamic_grouping_based_on_performance(teams, num_groups)
    return grouped_teams

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
