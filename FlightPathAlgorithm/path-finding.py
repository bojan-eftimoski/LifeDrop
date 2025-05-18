from path_util import (load_dem, astar, reconstruct_path,summarize_battery_and_elevation,wind_vector,coordinatetopixel,onecall_key)
import numpy as np
import matplotlib.pyplot as plt
import requests
import cdsapi
c=cdsapi.Client()
def draw(lat,lon):
    url = f"https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&appid={onecall_key}"
    response = requests.get(url)
    weather_data = response.json()
    goal=tuple (int(x) for x in coordinatetopixel(lat,lon))
    print(goal)
    dem_file = "output_4.tiff"
    dem, transform = load_dem(dem_file)

    start_points = [
        (388, 669),  # Bovec
        (282, 1149),  # Trenta
        (546, 1631)  # Bohinjska Bistrica
    ]


    all_paths = []
    all_costs = []

    # Run A* for each start point
    for start in start_points:
        came_from, cost_so_far = astar(dem, start, goal, wind_vector=wind_vector)
        path = reconstruct_path(came_from, start, goal)
        all_paths.append(path)
        all_costs.append(cost_so_far[goal])

    # Find the index of the shortest route (min time)
    shortest_index = np.argmin(all_costs)
    shortest_path = all_paths[shortest_index]
    print(shortest_path)
    # Plot the paths and points
    plt.figure(figsize=(10, 10))
    plt.imshow(dem, cmap='terrain')

    # Plot all paths
    for idx, path in enumerate(all_paths):
        y, x = zip(*path)
        color = 'blue' if idx == shortest_index else 'orange'
        plt.plot(x, y, color=color, linewidth=2)

    # Plot start points
    for start in start_points:
        plt.plot(start[1], start[0], 'go', markersize=8)

    # Plot goal point
    plt.plot(goal[1], goal[0], 'ro', markersize=8)

    plt.title("Paths to Destination")
    plt.xlabel("X")
    plt.ylabel("Y")
    plt.colorbar(label='Elevation (m)')
    plt.grid(True)
    plt.show()

    # Print energy and time for shortest route
    summarize_battery_and_elevation(dem, shortest_path, wind_vector=wind_vector)

draw (46.376677, 13.837065)