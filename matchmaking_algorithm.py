import numpy as np
from sklearn.cluster import KMeans

def dynamic_grouping_based_on_performance(teams, num_teams_per_group):
    performance_metrics = [[team["score"], team["win"], team["lose"]] for team in teams]
    performance_metrics_normalized = np.array(performance_metrics) / np.max(performance_metrics, axis=0)
    
    # Find columns with all NaN values
    nan_columns = np.all(np.isnan(performance_metrics_normalized), axis=0)
    
    # Replace columns with all NaN values with 1
    performance_metrics_normalized[:, nan_columns] = 1

    weights = [3, 2, 1]  
    performance_metrics_weighted = performance_metrics_normalized * weights

    num_groups = len(teams) // num_teams_per_group

    kmeans = KMeans(n_clusters=num_groups, random_state=0)
    kmeans.fit(performance_metrics_weighted)

    group_assignments = kmeans.labels_
    unique_labels, label_counts = np.unique(group_assignments, return_counts=True)

    groups = [[] for _ in range(num_groups)]

    sorted_indices = np.argsort(label_counts)
    teams_sorted = np.array(teams)[np.argsort(group_assignments)]

    for i in range(num_groups):
        start_index = i * num_teams_per_group
        end_index = start_index + num_teams_per_group
        groups[i] = teams_sorted[start_index:end_index].tolist()

    return groups