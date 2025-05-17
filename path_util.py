import numpy as np
import rasterio
import heapq
import matplotlib.pyplot as plt
velocity=15
lpixel=47
altitude_velocity=2.5
mass=24
lat1=46.1731
lat2=46.5011
lon1=13.2697
lon2=14.3210
h=779
w=2494
x=694
y=1297
lat=46.431356
lon=13.938543
#Kapacitet 4416
#


# start=(320,1963)#bled
#goal=(31,1227) #Kranjska gora
#start=(388,669)#bovec
#start=(282,1149)#trenta
#start=(546,1631)#bohinjska bistrica

goal=(292,1348)#triglav
#goal=(625,1288)#vogel
#goal=(232,779)#log
#goal=(191,974) #Jalovec
#goal=(559,925)#krn
#goal=(165,1586)#Zgornja Radovna
wind_vector = np.array([0,0])  # Wind blowing from left to right

def pixeltocoordinate (x,y):
    lat=lat2-x*(lat2-lat1)/h
    lon=lon1+y*(lon2-lon1)/w
    cor=np.array([lat,lon])
    return (lat,lon)
def coordinatetopixel (lat,lon):
    x=(lat2-lat)*h/(lat2-lat1)
    y=(lon-lon1)*w/(lon2-lon1)
    cor=np.array([x,y])
    return (x,y)

def load_dem(path):
    with rasterio.open(path) as src:
        dem = src.read(1)
        transform = src.transform
    return dem, transform

def energy_cost(elevation1, elevation2, dx, movement_vector, mass=24.0, g=9.81):
    dh = elevation2 - elevation1
    Phover=4400*pow((mass/36.9),1.5)
    Pmove=1.2*Phover
    Pclimb=Phover*1.3
    max_alt_change = altitude_velocity * (dx/ (velocity / lpixel))
    if(dh>max_alt_change):
        energy=Pclimb*dh/(altitude_velocity/lpixel)
    if (dh>0):
        energy=Pmove*1.3*dx/(velocity/lpixel)
    else:
        energy=Pmove*dx/(velocity/lpixel)

    return (energy/3600)


def travel_time(dx, movement_vector, wind_vector):
    movement_vector=movement_vector*velocity+wind_vector

    effective_speed = np.linalg.norm(movement_vector)/lpixel
    #print(effective_speed)
    #print(dx/effective_speed)

    return dx / effective_speed

def heuristic(a, b):
    return np.linalg.norm(np.array(a) - np.array(b))

def astar(dem, start, goal, dx=1.0, wind_vector=np.array([0, 0])):
    h, w = dem.shape
    frontier = []
    heapq.heappush(frontier, (0, start))
    came_from = {}
    cost_so_far = {start: 0}
    while frontier:
        _, current = heapq.heappop(frontier)

        if current == goal:
            break
        for dx_ in [-1, 0, 1]:

            for dy_ in [-1, 0, 1]:
                if dx_ == 0 and dy_ == 0:
                    continue

                next_node = (current[0] + dx_, current[1] + dy_)
                #print (next_node)
                if (current[0] + dx_>h or current[1] + dy_>w or current[0] + dx_<0 or current[1] + dy_<0):
                    #print(next_node)
                    continue

                if 0 <= next_node[0] < h and 0 <= next_node[1] < w:
                    # Altitude rate constraint
                    time=0
                    alt_diff = dem[next_node[0], next_node[1]] - dem[current[0], current[1]]
                    step_distance = np.linalg.norm([dx_, dy_])
                    max_alt_change = altitude_velocity* (step_distance /(velocity/lpixel))  # otprilika 21 metar ti e edna edinica
                    if alt_diff > max_alt_change:
                        time=alt_diff/altitude_velocity

                    movement_vector = np.array([dx_, dy_])
                    time += travel_time(step_distance, movement_vector, wind_vector)
                    new_cost = cost_so_far[current] + time
                    if next_node not in cost_so_far or new_cost < cost_so_far[next_node]:
                        cost_so_far[next_node] = new_cost
                        priority = new_cost + heuristic(goal, next_node)
                        heapq.heappush(frontier, (priority, next_node))
                        came_from[next_node] = current
    return came_from, cost_so_far

def reconstruct_path(came_from, start, goal):
    current = goal
    path = [current]
    while current != start:
        current = came_from[current]
        path.append(current)
    path.reverse()
    return path

def plot_path(dem, path):
    plt.imshow(dem, cmap='terrain')
    y, x = zip(*path)
    plt.plot(x, y, 'r-', linewidth=2)
    plt.title("Path over Elevation Map")
    plt.xlabel("X")
    plt.ylabel("Y")
    plt.colorbar(label='Elevation (m)')
    plt.show()

def summarize_battery_and_elevation(dem, path, wind_vector=np.array([0, 0]), mass=24.0):
    total_energy = 0
    total_time = 0
    elevations = [dem[p[0], p[1]] for p in path]
    distances = list(range(len(elevations)))
    for i in range(len(path)-1):
        p1 = path[i]
        p2 = path[i+1]
        movement_vector = np.array([p2[0] - p1[0], p2[1] - p1[1]])
        dx = np.linalg.norm(movement_vector)

        energy = energy_cost(dem[p1[0], p1[1]], dem[p2[0], p2[1]], dx, movement_vector, mass)
        time = travel_time(dx, movement_vector, wind_vector)
        total_energy += energy
        total_time += time

    print(f"Total Energy Consumption (approx.): {total_energy:.2f} Wh")
    print(f"Total Estimated Travel Time: {total_time:.2f} seconds")

    plt.figure()
    plt.plot(distances, elevations, label="Elevation Profile")
    plt.title("Elevation Along the Path")
    plt.xlabel("Step")
    plt.ylabel("Elevation (m)")
    plt.grid(True)
    plt.legend()
    plt.show()
    return (total_time)
