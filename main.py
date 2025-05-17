from path_util import (
    load_dem, astar, reconstruct_path,
    summarize_battery_and_elevation,
    wind_vector, coordinatetopixel, pixeltocoordinate
)
import numpy as np
import matplotlib.pyplot as plt


def draw(lat, lon):
    goal = tuple(int(x) for x in coordinatetopixel(lat, lon))
    print(f"Goal pixel: {goal}")
    dem_file = "output_4.tiff"  # Replace with actual DEM file path
    dem, transform = load_dem(dem_file)

    start_points = [
        (388, 669),  # Bovec
        (282, 1149),  # Trenta
        (546, 1631)  # Bohinjska Bistrica
    ]

    # Find start point closest to goal by Euclidean distance
    distances = [np.linalg.norm(np.array(start) - np.array(goal)) for start in start_points]
    closest_index = np.argmin(distances)
    closest_start = start_points[closest_index]
    #print(f"Closest start point: {closest_start}")

    # Run A* only for closest start point
    came_from, cost_so_far = astar(dem, closest_start, goal, wind_vector=wind_vector)
    shortest_path = reconstruct_path(came_from, closest_start, goal)
    #print(shortest_path)

    # Plotting
    plt.figure(figsize=(10, 10))
    plt.imshow(dem, cmap='terrain')

    y, x = zip(*shortest_path)
    plt.plot(x, y, 'g-', linewidth=2)  # shortest path green line

    plt.plot(closest_start[1], closest_start[0], 'go', markersize=8, label='Start (Closest)')
    plt.plot(goal[1], goal[0], 'ro', markersize=8, label='Goal')

    plt.title("Shortest Path to Destination")
    plt.xlabel("X")
    plt.ylabel("Y")
    plt.colorbar(label='Elevation (m)')
    plt.legend()
    plt.grid(True)
    plt.show()

    # Calculate energy/time for shortest route
    timetotal = summarize_battery_and_elevation(dem, shortest_path, wind_vector=wind_vector)

    # Convert pixel path to coordinate path
    shortest_coordpath = [pixeltocoordinate(row, col) for (row, col) in shortest_path]

    return timetotal, shortest_coordpath


print(draw(46.376677, 13.837065))
