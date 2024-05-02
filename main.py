from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import json
from matchmaking_algorithm import dynamic_grouping_based_on_performance

app = FastAPI()

class Team(BaseModel):
    _id: str
    win: int
    lose: int
    score: int


@app.post("/group-teams")
async def group_teams(teams: List, num_teams: int = 2):
    try:
        matched_teams = dynamic_grouping_based_on_performance(teams, num_teams)
        return matched_teams
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))