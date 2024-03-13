import numpy as np
from sklearn.cluster import KMeans

def dynamic_grouping_based_on_performance(teams, num_groups):
    print(teams)
    performance_metrics = [[team["tournament_won"],  team["goals"], team["matches_won"]] for team in teams]
    performance_metrics_normalized = np.array(performance_metrics) / np.max(performance_metrics, axis=0)

    kmeans = KMeans(n_clusters=num_groups)
    cluster_labels = kmeans.fit_predict(performance_metrics_normalized)

    groups = [[] for _ in range(num_groups)]
    for label, team in zip(cluster_labels, teams):
        groups[label].append(team)

    return groups